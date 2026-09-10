import { streamGemini } from "@/services/aiService";
import { SYSTEM_PROMPT_INTERVIEW, buildInterviewGuidePrompt } from "@/skills/job-architect";
import { NextResponse } from "next/server";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limiter";
import { jobDiagnosticSchema } from "@/lib/validation";

export async function POST(request) {
    try {
        const rateLimitResponse = checkRateLimit(request, RATE_LIMITS.generateJob);
        if (rateLimitResponse) return rateLimitResponse;

        const body = await request.json();
        const { companyName = "Empresa", diagnosticData } = body;

        // Validação com Zod
        const validation = jobDiagnosticSchema.safeParse(diagnosticData);
        if (!validation.success) {
            return NextResponse.json(
                { error: "Dados do diagnóstico inválidos", details: validation.error.format() },
                { status: 400 }
            );
        }

        const systemPrompt = SYSTEM_PROMPT_INTERVIEW;
        const effectiveCompany = validation.data.companyName || companyName || "Empresa Contratante";
        const userContent = buildInterviewGuidePrompt(effectiveCompany, validation.data);

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
        console.error("API Error (generate-interview-guide):", error);
        return NextResponse.json(
            { error: error.message || "Erro ao gerar roteiro de entrevista" },
            { status: 500 }
        );
    }
}
