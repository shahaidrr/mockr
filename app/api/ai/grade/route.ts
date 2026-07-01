import { NextResponse } from "next/server";
import { gradeAttemptWithAI, DeepSeekError } from "@/lib/ai/grading";
import {
  GradeAttemptValidationError,
  parseGradeAttemptInput,
} from "@/lib/ai/grading-schema";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          ok: false,
          error: "unauthorized",
          message: "You must be signed in to use AI grading.",
        },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      throw new GradeAttemptValidationError(
        "Request body must be valid JSON."
      );
    }

    const input = parseGradeAttemptInput(body);
    const result = await gradeAttemptWithAI(input);

    return NextResponse.json(
      {
        ok: true,
        grading: result,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    if (error instanceof GradeAttemptValidationError) {
      return NextResponse.json(
        {
          ok: false,
          error: error.status >= 500 ? "invalid_ai_response" : "invalid_body",
          message: error.message,
        },
        {
          status: error.status,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    if (error instanceof DeepSeekError) {
      console.error("AI grading route failed", {
        code: error.code,
        status: error.status,
      });

      return NextResponse.json(
        {
          ok: false,
          error: error.code,
          message: error.message,
        },
        {
          status: error.status,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    console.error("AI grading route failed", {
      error:
        error instanceof Error ? error.name : "unknown_error",
    });

    return NextResponse.json(
      {
        ok: false,
        error: "grading_failed",
        message: "Unable to complete AI grading.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
