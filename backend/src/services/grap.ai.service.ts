import { HumanMessage } from "@langchain/core/messages";
import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { z } from "zod";
import { mistralModel, cohereModel, geminiModel } from "./ai.service.js";

// ─── State Definition ────────────────────────────────────────────────────────

const BattleState = Annotation.Root({
  problem: Annotation<string>({
    reducer: (_, b) => b,
    default: () => "",
  }),
  solution_1: Annotation<string>({
    reducer: (_, b) => b,
    default: () => "",
  }),
  solution_2: Annotation<string>({
    reducer: (_, b) => b,
    default: () => "",
  }),
  judge: Annotation<{
    solution_1_score: number;
    solution_2_score: number;
    solution_1_reasoning: string;
    solution_2_reasoning: string;
  }>({
    reducer: (_, b) => b,
    default: () => ({
      solution_1_score: 0,
      solution_2_score: 0,
      solution_1_reasoning: "",
      solution_2_reasoning: "",
    }),
  }),
});

// ─── Node: Run Mistral + Cohere in parallel ───────────────────────────────────

const solutionNode = async (state: typeof BattleState.State) => {
  const [mistralResponse, cohereResponse] = await Promise.all([
    mistralModel.invoke([new HumanMessage(state.problem)]),
    cohereModel.invoke([new HumanMessage(state.problem)]),
  ]);

  const getText = (content: unknown): string => {
    if (typeof content === "string") return content;
    if (Array.isArray(content)) {
      return content
        .map((c: unknown) => (typeof c === "object" && c !== null && "text" in c ? (c as { text: string }).text : ""))
        .join("");
    }
    return JSON.stringify(content);
  };

  return {
    solution_1: getText(mistralResponse.content),
    solution_2: getText(cohereResponse.content),
  };
};

// ─── Node: Gemini Judge with Structured Output ────────────────────────────────

const JudgeSchema = z.object({
  solution_1_score: z.number().min(0).max(10).describe("Score for Mistral's solution (0-10)"),
  solution_2_score: z.number().min(0).max(10).describe("Score for Cohere's solution (0-10)"),
  solution_1_reasoning: z.string().describe("Concise reasoning for Mistral's score"),
  solution_2_reasoning: z.string().describe("Concise reasoning for Cohere's score"),
});

const judgeNode = async (state: typeof BattleState.State) => {
  const { solution_1, solution_2, problem } = state;

  const structuredGemini = geminiModel.withStructuredOutput(JudgeSchema);

  const judgeResponse = await structuredGemini.invoke([
    new HumanMessage(
      `You are an expert AI judge evaluating two AI-generated solutions.

Problem: ${problem}

Solution 1 (Mistral AI): 
${solution_1}

Solution 2 (Cohere AI): 
${solution_2}

Evaluate both solutions on accuracy, completeness, clarity, and code quality if applicable.
Provide a score from 0-10 and concise reasoning for each.`
    ),
  ]);

  return {
    judge: judgeResponse,
  };
};

// ─── Build Graph ──────────────────────────────────────────────────────────────

const graph = new StateGraph(BattleState)
  .addNode("solution", solutionNode)
  .addNode("judge_node", judgeNode)
  .addEdge(START, "solution")
  .addEdge("solution", "judge_node")
  .addEdge("judge_node", END)
  .compile();

// ─── Export ───────────────────────────────────────────────────────────────────

export default async function runBattle(problem: string) {
  const result = await graph.invoke({ problem });
  return result;
}
