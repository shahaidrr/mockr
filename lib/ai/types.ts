export type JsonObject = Record<string, unknown>;

export type GenerateJsonWithDeepSeekArgs = {
  systemPrompt: string;
  userPrompt: string;
  schemaName: string;
  model?: string;
  timeoutMs?: number;
};

export type GenerateJsonWithDeepSeekResult<T extends JsonObject = JsonObject> = {
  data: T;
  model: string;
  rawContent: string;
};

export type DeepSeekErrorCode =
  | "missing_api_key"
  | "missing_base_url"
  | "missing_model"
  | "request_timeout"
  | "rate_limited"
  | "api_error"
  | "invalid_response"
  | "invalid_json";
