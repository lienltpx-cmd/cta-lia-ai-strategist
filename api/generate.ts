import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createSystemPrompt } from '../src/prompts/strategistPrompt';
import { Settings, AiFullStrategyResponse } from '../src/types';

const API_KEY = process.env.GEMINI_API_KEY;

const cleanLoremIpsum = (html: string): string => {
    if (!html) return html;
    const loremRegex = /lorem ipsum[a-z\s,.]*/gi;
    const withoutLorem = html.replace(loremRegex, '');
    const emptyTagRegex = /<((?!i\b|span\b|svg\b|path\b|rect\b|circle\b|line\b|polyline\b|polygon\b)[a-zA-Z0-9]+)[^>]*>\s*<\/\1>/g;
    return withoutLorem.replace(emptyTagRegex, '');
};

const sanitizeHtml = (html: string): string => {
    if (!html) return html;
    let sanitizedHtml = html;
    sanitizedHtml = sanitizedHtml.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
    sanitizedHtml = sanitizedHtml.replace(/\s(on\w+)=("([^"]*)"|'([^']*)'|[^>\s]+)/gi, '');
    sanitizedHtml = sanitizedHtml.replace(/\sstyle=("([^"]*)"|'([^']*)')/gi, '');
    sanitizedHtml = sanitizedHtml.replace(/href="javascript:[^"]*"/gi, 'href="#"');
    return sanitizedHtml;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!API_KEY) {
        console.error("Missing GEMINI_API_KEY environment variable");
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
        const { settings, blogContent } = req.body as { settings: Settings; blogContent: string };

        if (!settings || !blogContent) {
            return res.status(400).json({ error: 'Missing settings or blogContent' });
        }

        const ai = new GoogleGenAI({ apiKey: API_KEY });
        const systemInstruction = createSystemPrompt(settings);
        const userPrompt = `
      INPUT DATA FOR YOUR ANALYSIS:
      -   Blog Post Content: ${blogContent}
    `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
            }
        });

        const jsonText = response.text.trim();
        const cleanedJsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
        const parsedResponse: AiFullStrategyResponse = JSON.parse(cleanedJsonText);

        parsedResponse.abTestPairs.forEach(pair => {
            pair.variants.forEach(variant => {
                if (variant.htmlBlock) {
                    const sanitizedHtml = sanitizeHtml(variant.htmlBlock);
                    variant.htmlBlock = cleanLoremIpsum(sanitizedHtml);
                }
            });
        });

        return res.status(200).json(parsedResponse);

    } catch (error) {
        console.error("API Error:", error);
        return res.status(500).json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) });
    }
}
