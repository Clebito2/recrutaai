import { analyzeCandidate } from "../../../services/aiService";
import { NextResponse } from "next/server";
import { checkRateLimit, RATE_LIMITS } from "../../../lib/rate-limiter";
import { db } from "../../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function POST(request) {
    try {
        const rateLimitResponse = checkRateLimit(request, RATE_LIMITS.analyzeCandidate);
        if (rateLimitResponse) {
            return rateLimitResponse;
        }

        const body = await request.json();
        const { companyName, cvContent, jobContext, profileLevel, jobId, previousAnalysis } = body;

        // ... (existing checks)

        // Pass profileLevel and jobData to get differentiated analysis
        const analysis = await analyzeCandidate(
            companyName,
            cvContent,
            jobContext, // Legacy context (string)
            profileLevel || 'tecnico',
            jobData,
            previousAnalysis // New context object
        );

        return NextResponse.json({
            success: true,
            analysis
        });

    } catch (error) {
        console.error("API Error (analyze-candidate):", error);
        console.error("Error stack:", error.stack);

        // Ensure we always return JSON
        return NextResponse.json(
            {
                error: error.message || "Erro ao processar análise",
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}
