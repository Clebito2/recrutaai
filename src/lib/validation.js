import { z } from "zod";

export const JOB_FAMILIES = [
    "comercial",
    "atendimento",
    "operacoes",
    "tecnico",
    "lideranca",
    "outro"
];

export const FAMILY_DEFAULT_WEIGHTS = {
    comercial: { comportamental: 40, tecnica: 20, pratica: 30, alinhamento: 10 },
    atendimento: { comportamental: 40, tecnica: 20, pratica: 20, alinhamento: 20 },
    operacoes: { comportamental: 30, tecnica: 30, pratica: 10, alinhamento: 30 },
    tecnico: { comportamental: 20, tecnica: 40, pratica: 30, alinhamento: 10 },
    lideranca: { comportamental: 40, tecnica: 10, pratica: 10, alinhamento: 40 },
    outro: { comportamental: 25, tecnica: 25, pratica: 25, alinhamento: 25 }
};

export const weightsSchema = z.object({
    comportamental: z.number().min(0).max(100),
    tecnica: z.number().min(0).max(100),
    pratica: z.number().min(0).max(100),
    alinhamento: z.number().min(0).max(100),
}).refine(
    (w) => w.comportamental + w.tecnica + w.pratica + w.alinhamento === 100,
    { message: "A soma dos pesos deve ser exatamente 100%" }
);

export const analysisRequestSchema = z.object({
    companyName: z.string().min(1),
    cvContent: z.union([
        z.string(),
        z.object({
            inlineData: z.object({
                mimeType: z.string(),
                data: z.string()
            })
        }),
        z.object({
            type: z.literal("url"),
            url: z.string().url(),
            mimeType: z.string()
        }),
    ]),
    jobContext: z.string().optional(),
    profileLevel: z.string().optional().default("tecnico"),
    jobFamily: z.enum([
        "comercial",
        "atendimento",
        "operacoes",
        "tecnico",
        "lideranca",
        "outro"
    ]).optional().default("tecnico"),
    customWeights: weightsSchema.optional(),
    repositoryUrl: z.string().optional(),
    jobId: z.string().optional(),
    jobData: z.any().optional(),
    previousAnalysis: z.any().optional(),
});

export const jobDiagnosticSchema = z.object({
    companyName: z.string().optional(),
    title: z.string().min(2),
    family: z.enum([
        "comercial",
        "atendimento",
        "operacoes",
        "tecnico",
        "lideranca",
        "outro"
    ]).default("tecnico"),
    archetype: z.string().optional(),
    motivator: z.string().optional(),
    mustHaves: z.string().optional(),
    niceToHaves: z.string().optional(),
    salary: z.string().optional(),
    workModel: z.string().optional(),
    benefits: z.string().optional(),
    customWeights: weightsSchema.optional(),
    repositoryUrl: z.string().optional(),
    candidateName: z.string().optional(),
    candidateScore: z.any().optional(),
    candidateAnalysis: z.any().optional()
});

