import { HumanMessage } from "@langchain/core/messages";
import {
  StateSchema,
  MessagesValue,
  StateGraph,
  ReducedValue,
  type GraphNode,
  START,
  END,
} from "@langchain/langgraph";
import { z } from "zod";
import { mistralModel, cohereModel, geminiModel } from "./ai.service.js";
import { createAgent, providerStrategy } from "langchain";

const State = new StateSchema({
  messages: MessagesValue,

  solution_1: new ReducedValue(z.string().default(""), (current, next) => next),

  solution_2: new ReducedValue(z.string().default(""), (current, next) => next),

  judge_recommandation: new ReducedValue(
    z.object({
      solution_1_score: z.number().default(0),
      solution_2_score: z.number().default(0),
    }),
    (current, next) => next,
  ),
});
const solutionNode: GraphNode<typeof State> = async (state) => {
  const [mistral_solution, cohere_solution] = await Promise.all([
    mistralModel.invoke([state.messages[0]]),
    cohereModel.invoke([state.messages[0]]),
  ]);
  return {
    solution_1: mistral_solution.text,
    solution_2: cohere_solution.text,
  };
};

const judgeNode: GraphNode<typeof State> = async (state: typeof State) => {
  const { solution_1, solution_2 } = state;

  const judge = createAgent({
    model: geminiModel,
    tools: [],
    responseFormat: providerStrategy(
      z.object({
        solution_1_score: z.number().min(0).max(10),
        solution_2_score: z.number().min(0).max(10),
      }),
    ),
  });

  const judgeRespose = await judge.invoke({
    messages: [
      new HumanMessage(
        `You are a judge tasked with evaluating the quality of two solutions to a problem. The problem is: ${state.messages[0].text}. The first solution is: ${solution_1}. The second solution is: ${solution_2}. Please provide a score between 0 and 10 for each solution, where 0 means the solution is completely incorrect or irrelevant, and 10 means the solution is perfect and fully addresses the problem.`,
      ),
    ],
  });

  const result = judgeRespose.structuredResponse;

  return {
    judge_recommandation: result,
  };
};

const graph = new StateGraph(State)
  .addNode("solution", solutionNode)
  .addNode("judge", judgeNode)
  .addEdge(START, "solution")
  .addEdge("solution", "judge")
  .addEdge("judge", END)
  .compile();

export default async function (userMessages: string) {
  const result = await graph.invoke({
    messages: [new HumanMessage(userMessages)],
  });

  return result;
}
