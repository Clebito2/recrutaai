import { z } from "zod";

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
    profileLevel: z.enum(["tecnico", "lideranca"]).default("tecnico"),
    jobId: z.string().optional(),
    jobData: z.any().optional(),
    previousAnalysis: z.any().optional(),
});

export const jobDiagnosticSchema = z.any();
