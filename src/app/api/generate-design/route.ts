import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { uploadImageFromUrl } from "@/lib/uploadToCloudinary";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
});

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const dbUser = await prisma.user.findUnique({
            where: {
                clerkId: userId,
            },
        });

        if (!dbUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const designs = await prisma.design.findMany({
            where: {
                userId: dbUser.id,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(designs);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { prompt } = await req.json();

        const dbUser = await prisma.user.findUnique({
            where: {
                clerkId: userId,
            },
        });

        if (!dbUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const enhancedResponse = await ai.models.generateContent({
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

        const enhancedPrompt =
            enhancedResponse.text ?? prompt;

        const MAX_PROMPT_CHARS = 300;

        const trimmed =
            enhancedPrompt.slice(0, MAX_PROMPT_CHARS);

        const lastSpace =
            trimmed.lastIndexOf(" ");

        const safePrompt =
            (
                lastSpace > 0
                    ? trimmed.slice(0, lastSpace)
                    : trimmed
            ).trim();

        const pollinationsUrl =
            `https://image.pollinations.ai/prompt/${encodeURIComponent(
                safePrompt
            )}` +
            `?width=1024&height=1024&nologo=true&model=flux&seed=${Date.now()}`;

        const cloudinaryUrl =
            await uploadImageFromUrl(
                pollinationsUrl
            );

        const design =
            await prisma.design.create({
                data: {
                    prompt,
                    enhancedPrompt,
                    imageUrl: cloudinaryUrl,
                    userId: dbUser.id,
                },
            });

        return NextResponse.json(design);
    } catch (error) {
        console.error(
            "GENERATE DESIGN ERROR:",
            error
        );

        return NextResponse.json(
            {
                error: "Failed to generate design",
            },
            {
                status: 500,
            }
        );
    }
}

export async function DELETE(req: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { designId } =
            await req.json();

        const dbUser =
            await prisma.user.findUnique({
                where: {
                    clerkId: userId,
                },
            });

        if (!dbUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const design =
            await prisma.design.findUnique({
                where: {
                    id: designId,
                },
            });

        if (
            !design ||
            design.userId !== dbUser.id
        ) {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }

        await prisma.design.delete({
            where: {
                id: designId,
            },
        });

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}