import { NextResponse } from "next/server";
import { evaluateSpeech } from "@/lib/ai/client";
import type { SpeechEvaluationRequest } from "@/lib/ai/types";

export async function POST(request: Request) {
  const body = (await request.json()) as SpeechEvaluationRequest;

  if (!body.taskId || !body.transcript) {
    return NextResponse.json({ message: "taskId and transcript are required" }, { status: 400 });
  }

  const result = await evaluateSpeech(body);
  return NextResponse.json(result);
}
