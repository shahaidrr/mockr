import type {
  DeepSeekErrorCode,
  GenerateJsonWithDeepSeekArgs,
  GenerateJsonWithDeepSeekResult,
  JsonObject,
} from "@/lib/ai/types";

const DEFAULT_DEEPSEEK_BASE_URL = "https://api.deepseek.com";
const DEFAULT_TIMEOUT_MS = 10000;

type DeepSeekChatCompletionResponse = {
  model?: string;
  error?: {
    message?: string;
  };
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

type DeepSeekConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
};

export class DeepSeekError extends Error {
  code: DeepSeekErrorCode;
  status: number;

  constructor(code: DeepSeekErrorCode, message: string, status = 500) {
    super(message);
    this.name = "DeepSeekError";
    this.code = code;
    this.status = status;
  }
}

function getDeepSeekConfig(): DeepSeekConfig {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const baseUrl = process.env.DEEPSEEK_BASE_URL ?? DEFAULT_DEEPSEEK_BASE_URL;
  const model = process.env.DEEPSEEK_MODEL;

  if (!apiKey) {
    throw new DeepSeekError(
      "missing_api_key",
      "Missing DEEPSEEK_API_KEY environment variable.",
      503
    );
  }

  if (!baseUrl) {
    throw new DeepSeekError(
      "missing_base_url",
      "Missing DEEPSEEK_BASE_URL environment variable.",
      500
    );
  }

  if (!model) {
    throw new DeepSeekError(
      "missing_model",
      "Missing DEEPSEEK_MODEL environment variable.",
      500
    );
  }

  return {
    apiKey,
    baseUrl: baseUrl.replace(/\/+$/, ""),
    model,
  };
}

function buildJsonPrompt(schemaName: string, prompt: string) {
  return [
    `Return only a valid JSON object for the schema named "${schemaName}".`,
    "Do not include markdown, code fences, or explanatory text.",
    prompt,
  ].join("\n");
}

function getErrorMessage(payload: unknown): string | null {
  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    payload.error &&
    typeof payload.error === "object" &&
    "message" in payload.error &&
    typeof payload.error.message === "string"
  ) {
    return payload.error.message;
  }

  return null;
}

export function getDeepSeekServerConfig() {
  const { baseUrl, model } = getDeepSeekConfig();

  return {
    baseUrl,
    model,
  };
}

export async function generateJsonWithDeepSeek<
  T extends JsonObject = JsonObject,
>({
  systemPrompt,
  userPrompt,
  schemaName,
  model,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  maxTokens,
}: GenerateJsonWithDeepSeekArgs): Promise<GenerateJsonWithDeepSeekResult<T>> {
  const config = getDeepSeekConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: model ?? config.model,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: buildJsonPrompt(schemaName, systemPrompt),
          },
          {
            role: "user",
            content: buildJsonPrompt(schemaName, userPrompt),
          },
        ],
      }),
      signal: controller.signal,
    });

    const payload =
      ((await response.json()) as DeepSeekChatCompletionResponse | null) ?? null;

    if (!response.ok) {
      if (response.status === 429) {
        throw new DeepSeekError(
          "rate_limited",
          getErrorMessage(payload) ?? "DeepSeek rate limit reached.",
          429
        );
      }

      throw new DeepSeekError(
        "api_error",
        getErrorMessage(payload) ?? "DeepSeek request failed.",
        502
      );
    }

    const rawContent = payload?.choices?.[0]?.message?.content?.trim();

    if (!rawContent) {
      throw new DeepSeekError(
        "invalid_response",
        "DeepSeek response did not include message content.",
        502
      );
    }

    try {
      return {
        data: JSON.parse(rawContent) as T,
        model: payload?.model ?? model ?? config.model,
        rawContent,
      };
    } catch {
      throw new DeepSeekError(
        "invalid_json",
        "DeepSeek returned content that was not valid JSON.",
        502
      );
    }
  } catch (error) {
    if (error instanceof DeepSeekError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new DeepSeekError(
        "request_timeout",
        "DeepSeek request timed out.",
        504
      );
    }

    throw new DeepSeekError(
      "api_error",
      error instanceof Error ? error.message : "Unknown DeepSeek error.",
      502
    );
  } finally {
    clearTimeout(timeout);
  }
}
