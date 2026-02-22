import { streamGemini } from "@/services/aiService";
import { getSystemPrompt, buildUserPrompt } from "@/skills/job-architect";
import { NextResponse } from "next/server";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limiter";
import { jobDiagnosticSchema } from "@/lib/validation";

export async function POST(request) {
    try {
        const rateLimitResponse = checkRateLimit(request, RATE_LIMITS.generateJob);
        if (rateLimitResponse) return rateLimitResponse;

        const body = await request.json();
        const { companyName, diagnosticData } = body;

        // Validation with Zod
        const validation = jobDiagnosticSchema.safeParse(diagnosticData);
        if (!validation.success) {
            return NextResponse.json(
                { error: "Dados do diagnóstico inválidos", details: validation.error.format() },
                { status: 400 }
            );
        }

        const systemPrompt = getSystemPrompt();
        const userContent = buildUserPrompt(companyName, validation.data);

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of streamGemini({ systemPrompt, userContent })) {
                        controller.enqueue(encoder.encode(chunk));
                    }
                    controller.close();
                } catch (error) {
                    controller.error(error);
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Transfer-Encoding": "chunked",
            },
        });

    } catch (error) {
        console.error("API Error (generate-job):", error);
        return NextResponse.json(
            { error: error.message || "Erro ao gerar vaga" },
            { status: 500 }
        );
    }
}
