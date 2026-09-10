import { analyzeCandidate } from "@/services/aiService";
import { NextResponse } from "next/server";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limiter";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { analysisRequestSchema } from "@/lib/validation";

export async function POST(request) {
    try {
        const rateLimitResponse = checkRateLimit(request, RATE_LIMITS.analyzeCandidate);
        if (rateLimitResponse) return rateLimitResponse;

        const body = await request.json();

        // Validation with Zod
        const validation = analysisRequestSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: "Dados inválidos", details: validation.error.format() },
                { status: 400 }
            );
        }

        const { companyName, cvContent, jobContext, profileLevel, jobFamily, customWeights, repositoryUrl, jobId, jobData: incomingJobData, previousAnalysis } = validation.data;

        // Fetch jobData if jobId is provided and not already passed by client
        let jobData = incomingJobData || null;
        if (!jobData && jobId) {
            try {
                const jobDoc = await getDoc(doc(db, "jobs", jobId));
                if (jobDoc.exists()) {
                    jobData = jobDoc.data();
                }
            } catch (err) {
                console.warn("[analyze-candidate] Aviso ao buscar vaga no Firestore (seguindo com dados do payload):", err.message);
            }
        }

        // Determina a família da vaga (prioriza parâmetro explícito, depois o cadastro na vaga, depois profileLevel)
        const effectiveFamily = jobFamily || jobData?.family || (jobData?.profileType === "lideranca" ? "lideranca" : (profileLevel || "tecnico"));
        const effectiveWeights = customWeights || jobData?.customWeights;

        // Executa análise com a inteligência do Padrão Live
        const analysis = await analyzeCandidate(
            companyName,
            cvContent,
            {
                jobContext,
                profileLevel: profileLevel || 'tecnico',
                jobFamily: effectiveFamily,
                customWeights: effectiveWeights,
                repositoryUrl: repositoryUrl || jobData?.repositoryUrl,
                jobData,
                previousAnalysis
            }
        );

        return NextResponse.json({
            success: true,
            analysis
        });

    } catch (error) {
        console.error("API Error (analyze-candidate):", error);

        return NextResponse.json(
            {
                error: error.message || "Erro ao processar análise",
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}
