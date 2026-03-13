import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateImage } from '../geminiCore';

describe('GeminiService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('generateImage', () => {
        it('should generate image URL with correct parameters', async () => {
            const result = await generateImage('Delicious pasta dish', '16:9');

            expect(result.imageUrl).toBeDefined();
            expect(result.imageUrl).toContain('pollinations.ai');
            expect(result.imageUrl).toContain('width=1280');
            expect(result.imageUrl).toContain('height=720');
            expect(result.imageUrl).toContain('Delicious');
        });

        it('should use default aspect ratio when not specified', async () => {
            const result = await generateImage('Test image');

            expect(result.imageUrl).toContain('width=1024');
            expect(result.imageUrl).toContain('height=1024');
        });

        it('should include enhanced prompt keywords', async () => {
            const result = await generateImage('Simple dish', '4:3', 'food');

            expect(result.imageUrl).toContain('professional');
            expect(result.imageUrl).toContain('food');
            expect(result.imageUrl).toContain('photography');
        });
    });
});
