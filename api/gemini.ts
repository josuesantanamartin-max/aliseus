import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { checkRateLimit } from './middleware/rateLimit';
import { validateOrigin } from './middleware/validateOrigin';

/**
 * Serverless function to proxy Gemini API requests
 * This keeps the API key secure on the server side
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        const { headers } = validateOrigin(req.headers.origin || '');
        Object.entries(headers).forEach(([key, value]) => {
            res.setHeader(key, value);
        });
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Validate origin
    const { valid, headers } = validateOrigin(req.headers.origin || '');
    if (!valid) {
        return res.status(403).json({ error: 'Forbidden: Invalid origin' });
    }

    // Apply CORS headers
    Object.entries(headers).forEach(([key, value]) => {
        res.setHeader(key, value);
    });

    // Rate limiting (using IP address as identifier)
    const identifier = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const rateLimit = checkRateLimit(identifier as string, {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 20, // 20 requests per minute
    });

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', '20');
    res.setHeader('X-RateLimit-Remaining', rateLimit.remaining.toString());
    res.setHeader('X-RateLimit-Reset', new Date(rateLimit.resetTime).toISOString());

    if (!rateLimit.allowed) {
        return res.status(429).json({
            error: 'Too many requests',
            retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        });
    }

    try {
        // Validate request body
        const { model, contents } = req.body;

        if (!contents) {
            return res.status(400).json({ error: 'Missing required field: contents' });
        }

        // Map contents and check for empty strings
        let parts = Array.isArray(contents) ? contents : (contents.parts || contents);
        
        // Ensure parts is not just an empty string or empty array of empty strings
        const isActuallyEmpty = Array.isArray(parts) 
            ? (parts.length === 0 || parts.every((p: any) => typeof p === 'string' && p.trim() === ''))
            : (typeof parts === 'string' && parts.trim() === '');

        if (isActuallyEmpty) {
            return res.status(400).json({ error: 'Contents cannot be empty' });
        }

        // Get API key from environment
        const apiKey = process.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            console.error('VITE_GEMINI_API_KEY not found in environment variables');
            return res.status(500).json({ error: 'API configuration error' });
        }

        // Initialize Gemini AI
        const cleanKey = (apiKey || '').trim().replace(/[\x00-\x1F\x7F-\x9F]/g, ""); // Remove control characters
        if (cleanKey.length < 5) {
            return res.status(500).json({ error: 'API key is too short or invalid' });
        }

        const genAI = new GoogleGenerativeAI(cleanKey);

        // Use the requested model or fallback
        const modelName = model || 'gemini-2.0-flash';
        const genModel = genAI.getGenerativeModel({ model: modelName });

        // Make request to Gemini API
        const result = await genModel.generateContent(parts);
        const responseText = result.response.text();

        // Return response
        return res.status(200).json({
            text: responseText,
            success: true,
        });
    } catch (error: any) {
        console.error('Gemini API Error:', error);

        // Handle specific error types
        if (error.message?.includes('API key')) {
            return res.status(401).json({ error: 'Invalid API key' });
        }

        if (error.message?.includes('quota')) {
            return res.status(429).json({ error: 'API quota exceeded' });
        }

        if (error.message?.includes('rate limit')) {
            return res.status(429).json({ error: 'API rate limit exceeded' });
        }

        // Generic error
        return res.status(500).json({
            error: 'Failed to process request',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
}
