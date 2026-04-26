import { HumanMessage } from "@langchain/core/messages";
import {
  StateSchema,
  MessagesValue,
  StateGraph,
  ReducedValue,
  START,
  END,
} from "@langchain/langgraph";
import { GraphNode } from "@langchain/langgraph";
import { z } from "zod";
import { mistralModel, cohereModel } from "./ai.service.js";

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
    mistralModel.invoke(state.messages[0].text),
    cohereModel.invoke(state.messages[0].text),
  ]);

  return {
    ...state,
    solution_1: mistral_solution.text,
    solution_2: cohere_solution.text,
  };
};

const graph = new StateGraph(State)
  .addNode("solution", solutionNode)
  .addEdge(START, "solution")
  .addEdge("solution", END)
  .compile();

export default async function (userMessages: string) {
  const result = await graph.invoke({
    messages: [new HumanMessage(userMessages)],
  });

  console.log(result);

  return result.messages ?? [];
}
