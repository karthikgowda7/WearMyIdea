import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `
            You are an expert t-shirt design prompt engineer.

            Your task is to EXPAND the user's idea, not replace it.

            Rules:
            - Keep ALL important subjects from the user's idea.
            - Never remove or change the main character, object, animal, or action.
            - Add artistic detail, composition, style, colors, and t-shirt print considerations.
            - Create a prompt suitable for AI image generation.
            - Return ONLY the final enhanced prompt.

            User idea:
            ${prompt}
            `,
        });

        return NextResponse.json({
            enhancedPrompt: response.text,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Failed to generate prompt" },
            { status: 500 }
        );
    }
}