/**
 * Gemini Client - Base API wrapper for Gemini AI
 * Centralized client for all AI interactions
 */

const DEFAULT_MODEL = "gemini-2.0-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent`;

/**
 * Default generation configuration
 */
const DEFAULT_CONFIG = {
    temperature: 0.5,
    topK: 30,
    topP: 0.9,
    maxOutputTokens: 4096
};

/**
 * Call Gemini API with structured prompt
 * 
 * @param {object} options
 * @param {string} options.systemPrompt - System instruction
 * @param {string|array} options.userContent - User content (text or parts array)
 * @param {object} options.config - Generation config overrides
 * @returns {Promise<string>} Generated text
 */
export async function callGemini({ systemPrompt, userContent, config = {} }) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("GEMINI_API_KEY não configurada no servidor");
    }

    // Build parts array
    const parts = [];

    if (systemPrompt) {
        parts.push({ text: systemPrompt });
    }

    if (typeof userContent === 'string') {
        parts.push({ text: userContent });
    } else if (Array.isArray(userContent)) {
        parts.push(...userContent);
    } else if (userContent && typeof userContent === 'object') {
        // Handle single object (e.g., inlineData)
        parts.push(userContent);
    }

    const generationConfig = {
        ...DEFAULT_CONFIG,
        ...config
    };

    const modelsToTry = [DEFAULT_MODEL, "gemini-1.5-flash"];
    let lastError = null;

    for (const modelName of modelsToTry) {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [{ parts }],
                    generationConfig
                })
            });

            if (!response.ok) {
                let errorMessage = "Erro na API Gemini";
                try {
                    const error = await response.json();
                    errorMessage = error.error?.message || error.message || errorMessage;

                    if (response.status === 400 && error.error?.status === 'INVALID_ARGUMENT') {
                        errorMessage = "Chave de API inválida ou rejeitada pelo Google";
                    } else if (response.status === 429) {
                        errorMessage = "Limite de cota excedido no Gemini. Aguarde um momento.";
                    }
                } catch (e) {
                    errorMessage = `Erro ${response.status}: ${response.statusText}`;
                }

                if (response.status === 429 || errorMessage.includes('Too Many') || errorMessage.includes('Quota')) {
                    console.warn(`[YOLO] Rate limit atingido no modelo ${modelName}. Tentando fallback...`);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    continue;
                }

                if (errorMessage.includes("403") || errorMessage.includes("leaked")) {
                    throw new Error("Chave vazada ou revogada.");
                }

                console.error(`Falha no modelo ${modelName}:`, errorMessage);
                throw new Error(errorMessage);
            }

            const data = await response.json();
            const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!generatedText) {
                if (data.promptFeedback?.blockReason) {
                    throw new Error(`Busca bloqueada: ${data.promptFeedback.blockReason}`);
                }
                throw new Error("Resposta vazia da IA");
            }

            return generatedText;

        } catch (error) {
            lastError = error;
            if (error.message?.includes("Chave vazada")) throw error;
        }
    }

    throw new Error("Todos os modelos de IA falharam (Limites de API excedidos). Aguarde 1 minuto e tente novamente.");
}

/**
 * Call Gemini with Streaming support
 * 
 * @param {object} options
 * @yields {string} Text chunks
 */
export async function* streamGemini({ systemPrompt, userContent, config = {} }) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY missing");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: DEFAULT_MODEL,
        systemInstruction: systemPrompt
    });

    const generationConfig = {
        ...DEFAULT_CONFIG,
        ...config
    };

    const result = await model.generateContentStream({
        contents: [{ role: 'user', parts: Array.isArray(userContent) ? userContent : [{ text: userContent }] }],
        generationConfig
    });

    for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) yield chunkText;
    }
}

/**
 * Call Gemini with Structured JSON Output (Schema)
 * Implementa retry e fallback para lidar evasivamente com Rate Limits.
 * 
 * @param {object} options
 * @param {object} options.schema - JSON Schema for validation
 */
export async function callGeminiStructured({ systemPrompt, userContent, schema, config = {} }) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY missing");

    const genAI = new GoogleGenerativeAI(apiKey);

    const generationConfig = {
        ...DEFAULT_CONFIG,
        ...config,
        responseMimeType: "application/json",
        responseSchema: schema
    };

    const modelsToTry = [DEFAULT_MODEL, "gemini-1.5-flash"];
    let lastError = null;

    for (const modelName of modelsToTry) {
        try {
            const model = genAI.getGenerativeModel({
                model: modelName,
                systemInstruction: systemPrompt
            });

            const result = await model.generateContent({
                contents: [{ role: 'user', parts: Array.isArray(userContent) ? userContent : [{ text: userContent }] }],
                generationConfig
            });

            const response = await result.response;
            return JSON.parse(response.text());
        } catch (error) {
            lastError = error;
            if (error.message?.includes("403") || error.message?.includes("leaked")) {
                throw new Error("Sua chave do Gemini (GEMINI_API_KEY) foi revogada pelo Google por ter sido vazada. Crie uma nova chave no Google AI Studio e atualize o .env.local.");
            }
            if (error.status === 429 || error.message?.includes("429") || error.message?.includes("Too Many Requests")) {
                console.warn(`[YOLO] Rate limit atingido no modelo ${modelName}. Tentando fallback...`);
                // Espera 2 segundos antes de tentar o próximo
                await new Promise(resolve => setTimeout(resolve, 2000));
                continue; // Tenta o proximo modelo
            }
            // Se for outro erro, lançamos normalmente se não tiver fallback
            console.error(`Erro no modelo ${modelName}:`, error.message);
        }
    }

    throw new Error("Todos os modelos de IA falharam (Limites de API excedidos). Aguarde 1 minuto e tente novamente.");
}

import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Call Gemini with multimodal content (text + file)
 * Supports both Base64 (inlineData) and File API (fileData)
 * 
 * @param {object} options
 * @param {string} options.systemPrompt
 * @param {string} options.textPrompt
 * @param {object} options.fileData - { mimeType, data (base64) } OR { mimeType, fileUri }
 * @param {object} options.config
 * @returns {Promise<string>}
 */
export async function callGeminiMultimodal({ systemPrompt, textPrompt, fileData, config = {} }) {
    const userContent = [];

    if (fileData) {
        if (fileData.fileUri) {
            // File API (Large files)
            userContent.push({
                fileData: {
                    mimeType: fileData.mimeType,
                    fileUri: fileData.fileUri
                }
            });
        } else if (fileData.data) {
            // Base64 (Small files)
            userContent.push({
                inlineData: {
                    mimeType: fileData.mimeType,
                    data: fileData.data
                }
            });
        }
    }

    if (textPrompt) {
        userContent.push({ text: textPrompt });
    }

    return callGemini({
        systemPrompt,
        userContent,
        config
    });
}

/**
 * Upload file to Gemini File API (for large files)
 * 
 * @param {string} filePath - Local path to file
 * @param {string} mimeType - File MIME type
 * @returns {Promise<string>} fileUri
 */
export async function uploadFileToGemini(filePath, mimeType) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY missing");

    const fileManager = new GoogleAIFileManager(apiKey);

    try {
        const uploadResponse = await fileManager.uploadFile(filePath, {
            mimeType: mimeType,
            displayName: `Upload_${Date.now()}`,
        });

        console.log(`Uploaded file to Gemini: ${uploadResponse.file.uri}`);
        return uploadResponse.file.uri;
    } catch (error) {
        console.error("Gemini File Upload Error:", error);
        throw new Error("Falha no upload para Gemini File API: " + error.message);
    }
}

/**
 * Parse JSON from AI response
 * Handles responses wrapped in markdown code blocks
 * 
 * @param {string} text
 * @returns {object|null}
 */
export function parseJsonResponse(text) {
    if (!text) return null;

    try {
        // Try direct parse first
        return JSON.parse(text);
    } catch {
        // Try to extract JSON from the response
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[1].trim());
            } catch {
                // Fall through
            }
        }

        // Try to find raw JSON object
        const objectMatch = text.match(/\{[\s\S]*\}/);
        if (objectMatch) {
            try {
                return JSON.parse(objectMatch[0]);
            } catch {
                // Fall through
            }
        }
    }

    return null;
}

/**
 * Remove emojis from text
 * 
 * @param {string} text
 * @returns {string}
 */
export function removeEmojis(text) {
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
    return text.replace(emojiRegex, "");
}
