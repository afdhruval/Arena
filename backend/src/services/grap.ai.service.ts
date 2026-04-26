import { HumanMessage } from "@langchain/core/messages";
import {
  StateSchema,
  StateGraph,
  type GraphNode,
  START,
  END,
} from "@langchain/langgraph";
import { z } from "zod";
import { mistralModel, cohereModel, geminiModel } from "./ai.service.js";
import { createAgent, providerStrategy } from "langchain";

const state = new StateSchema({
  problem: z.string().default(""),
  solution_1: z.string().default(""),
  solution_2: z.string().default(""),
  judge: z.object({
    solution_1_score: z.number().default(0),
    solution_2_score: z.number().default(0),
    solution_1_reasoning: z.string().default(""),
    solution_2_reasoning: z.string().default(""),
  }),
});

const solutionNode: GraphNode<typeof state> = async (state) => {
  const [mistralResponse, cohoreResponse] = await Promise.all([
    mistralModel.invoke(state.problem),
    cohereModel.invoke(state.problem),
  ]);

  return {
    solution_1: mistralResponse.text,
    solution_2: cohoreResponse.text,
  };
};

const judgeNode: GraphNode<typeof state> = async (state) => {
  const { solution_1, solution_2, problem } = state;

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

export default async function (userMessage: string) {
  const result = await graph.invoke({
    messages: [new HumanMessage(userMessage)],
  });

  console.log(result);

  return result;
}
