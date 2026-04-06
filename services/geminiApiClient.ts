/**
 * Client-side wrapper for Gemini API calls through serverless proxy
 * This replaces direct API calls to keep the API key secure
 */

interface GeminiRequest {
    model?: string;
    contents: any;
    config?: any;
}

interface GeminiResponse {
    text: string;
    success: boolean;
}

/**
 * Make a request to the Gemini API through the serverless proxy
 */
export async function callGeminiAPI(request: GeminiRequest): Promise<string> {
    // We use a relative path. In Vercel (Production and 'vercel dev') it works automatically.
    // If using 'npm run dev' without vercel CLI, this will fail unless a proxy is configured.
    const apiUrl = '/api/gemini';

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        // Handle rate limiting
        if (response.status === 429) {
            const data = await response.json();
            throw new Error(
                `Rate limit exceeded. Please try again in ${data.retryAfter} seconds.`
            );
        }

        // Handle other errors
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to connect to AI service');
        }

        const data: GeminiResponse = await response.json();
        return data.text || '';
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Failed to connect to AI service');
    }
}

/**
 * Generate content using Gemini API
 */
export async function generateContent(
    prompt: string,
    model: string = 'gemini-2.0-flash'
): Promise<string> {
    return callGeminiAPI({
        model,
        contents: prompt,
    });
}

/**
 * Generate content with image input
 */
export async function generateContentWithImage(
    prompt: string,
    imageData: string,
    mimeType: string = 'image/webp',
    model: string = 'gemini-2.0-flash'
): Promise<string> {
    return callGeminiAPI({
        model,
        contents: {
            parts: [
                { inlineData: { mimeType, data: imageData } },
                { text: prompt },
            ],
        },
    });
}

/**
 * Generate content with Google Search
 */
export async function generateContentWithSearch(
    prompt: string,
    model: string = 'gemini-2.0-flash'
): Promise<string> {
    return callGeminiAPI({
        model,
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });
}
