/**
 * AI Service - Recruit-AI (Protocolo Elite V6.0)
 * 
 * This file now acts as the central orchestrator that imports from modular skills.
 * The actual implementation has been refactored into:
 * - /skills/gemini-client - Base Gemini API client
 * - /skills/job-architect - Mode 1: Job advertisement generation
 * - /skills/cv-analyst - Mode 2: Candidate analysis
 * - /skills/report-generator - HTML report generation
 * 
 * This file maintains backward compatibility with existing API routes.
 */

// Re-export from skills for backward compatibility
export { generateJobAd } from '../skills/job-architect';
export { analyzeCandidate } from '../skills/cv-analyst';
export { generateReport, generateEliteReport } from '../skills/report-generator';
export { callGemini, callGeminiMultimodal, parseJsonResponse, removeEmojis } from '../skills/gemini-client';
