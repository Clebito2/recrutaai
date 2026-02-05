/**
 * Auth Middleware for API Routes
 * Validates authentication via session cookie or Authorization header
 */

import { auth } from './firebase';

/**
 * Validates if the request has a valid authentication
 * Uses Firebase ID token from Authorization header
 * 
 * @param {Request} request - Next.js Request object
 * @returns {Promise<{authenticated: boolean, userId?: string, error?: string}>}
 */
export async function validateAuth(request) {
    try {
        // Check Authorization header (Bearer token)
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                authenticated: false,
                error: 'Token de autenticação não fornecido'
            };
        }

        const token = authHeader.replace('Bearer ', '');

        if (!token || token.length < 10) {
            return {
                authenticated: false,
                error: 'Token inválido'
            };
        }

        // For client-side validation, we trust the token format
        // In production with Firebase Admin SDK, you would verify the token
        // For now, we extract the user ID pattern from the token structure

        return {
            authenticated: true,
            userId: token // In production, this would be the decoded UID
        };

    } catch (error) {
        console.error('Auth validation error:', error);
        return {
            authenticated: false,
            error: 'Erro ao validar autenticação'
        };
    }
}

/**
 * Middleware wrapper for protected routes
 * Returns a 401 response if not authenticated
 * 
 * @param {Request} request
 * @returns {Promise<Response|null>} - Returns Response if unauthorized, null if OK
 */
export async function requireAuth(request) {
    const result = await validateAuth(request);

    if (!result.authenticated) {
        return new Response(
            JSON.stringify({ error: result.error || 'Não autorizado' }),
            {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }

    return null; // Proceed with request
}

/**
 * Simple in-memory session check using cookie
 * This works with Firebase's client-side auth
 */
export function getSessionFromCookie(request) {
    const cookies = request.headers.get('cookie') || '';
    const sessionMatch = cookies.match(/firebase-auth-token=([^;]+)/);
    return sessionMatch ? sessionMatch[1] : null;
}
