import { generateEliteReport } from "@/services/reportGenerator";
import { NextResponse } from "next/server";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limiter";

export async function POST(request) {
    try {
        const rateLimitResponse = checkRateLimit(request, RATE_LIMITS.generateReport);
        if (rateLimitResponse) {
            return rateLimitResponse;
        }

        const body = await request.json();
        const { analysis, companyName } = body;

        if (!analysis) {
            return NextResponse.json(
                { error: "Dados da análise não fornecidos" },
                { status: 400 }
            );
        }

        const htmlReport = generateEliteReport(analysis, companyName);

        return NextResponse.json({
            success: true,
            html: htmlReport
        });

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: error.message || "Erro interno" },
            { status: 500 }
        );
    }
}


