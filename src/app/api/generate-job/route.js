import { generateJobAd } from "../../../services/aiService";
import { NextResponse } from "next/server";
import { checkRateLimit, RATE_LIMITS } from "../../../lib/rate-limiter";

export async function POST(request) {
    try {
        const rateLimitResponse = checkRateLimit(request, RATE_LIMITS.generateJob);
        if (rateLimitResponse) {
            return rateLimitResponse;
        }

        const body = await request.json();
        const { companyName, diagnosticData } = body;

        if (!companyName || !diagnosticData) {
            return NextResponse.json(
                { error: "Dados incompletos" },
                { status: 400 }
            );
        }

        const jobText = await generateJobAd(companyName, diagnosticData);

        return NextResponse.json({
            success: true,
            jobText
        });

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: error.message || "Erro interno" },
            { status: 500 }
        );
    }
}
