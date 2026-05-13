import type { AIModelConfig, AIProvider, SpeechEvaluationRequest, SpeechEvaluationResult } from "./types";

class MockProvider implements AIProvider {
  async evaluateSpeech(input: SpeechEvaluationRequest): Promise<SpeechEvaluationResult> {
    const words = input.transcript.split(" ");
    const scores = [96, 89, 76, 92, 67, 95, 84, 91, 73, 98];

    return {
      score: 93,
      dimensions: {
        accuracy: 94,
        fluency: 91,
        completeness: 96
      },
      tokens: words.map((token, index) => {
        const score = scores[index % scores.length];
        return {
          token,
          score,
          status: score >= 90 ? "great" : score >= 78 ? "warn" : "error"
        };
      }),
      feedback: "节奏稳定，重音清晰。注意 school 与 usually 的尾音收束。"
    };
  }
}

class HttpCompatibleProvider implements AIProvider {
  constructor(private readonly config: AIModelConfig) {}

  async evaluateSpeech(input: SpeechEvaluationRequest): Promise<SpeechEvaluationResult> {
    if (!this.config.apiKey || !this.config.baseUrl) {
      throw new Error("AI provider is not configured. Set apiKey and baseUrl before calling a real model.");
    }

    const response = await fetch(`${this.config.baseUrl}/speech/evaluate`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({ model: this.config.model, ...input })
    });

    if (!response.ok) {
      throw new Error(`AI provider request failed: ${response.status}`);
    }

    return response.json() as Promise<SpeechEvaluationResult>;
  }
}

export function createAIProvider(config: AIModelConfig): AIProvider {
  if (config.provider === "mock") {
    return new MockProvider();
  }

  return new HttpCompatibleProvider(config);
}
