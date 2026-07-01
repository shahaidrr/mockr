import { NextResponse } from "next/server";
import {
  DeepSeekError,
  generateJsonWithDeepSeek,
  getDeepSeekServerConfig,
} from "@/lib/ai/deepseek";

export const dynamic = "force-dynamic";

type HealthPayload = {
  provider: string;
  status: string;
  ok: boolean;
};

export async function GET() {
  try {
    const { model } = getDeepSeekServerConfig();
    const result = await generateJsonWithDeepSeek<HealthPayload>({
      schemaName: "ai_health_check",
      systemPrompt:
        'You are a backend health-check responder. Return JSON only with keys "provider", "status", and "ok".',
      userPrompt:
        'Respond with {"provider":"deepseek","status":"ok","ok":true}.',
      timeoutMs: 10000,
    });

    return NextResponse.json(
      {
        ok: true,
        provider: "deepseek",
        configuredModel: model,
        responseModel: result.model,
        health: result.data,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    const deepSeekError =
      error instanceof DeepSeekError
        ? error
        : new DeepSeekError("api_error", "Unknown DeepSeek route error.", 502);

    return NextResponse.json(
      {
        ok: false,
        provider: "deepseek",
        error: deepSeekError.code,
        message: deepSeekError.message,
      },
      {
        status: deepSeekError.status,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
