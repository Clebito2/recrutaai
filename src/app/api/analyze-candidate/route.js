import { analyzeCandidate } from "../../../services/aiService";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const body = await request.json();
        const { companyName, cvContent, jobContext, profileLevel } = body;

        if (!cvContent) {
            return NextResponse.json(
                { error: "Conteúdo do CV não fornecido" },
                { status: 400 }
            );
        }

        // Pass profileLevel to get differentiated analysis (tecnico or lideranca)
        const analysis = await analyzeCandidate(
            companyName,
            cvContent,
            jobContext,
            profileLevel || 'tecnico'
        );

        return NextResponse.json({
            success: true,
            analysis
        });

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: error.message || "Erro interno" },
            { status: 500 }
        );
    }
}
