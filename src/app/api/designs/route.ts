import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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

        const body = await req.json();
        const { prompt } = body;

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

        const design = await prisma.design.create({
            data: {
                prompt,
                userId: dbUser.id,
            },
        });

        return NextResponse.json(design);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
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

        const { designId } = await req.json();

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

        const design = await prisma.design.findUnique({
            where: {
                id: designId,
            },
        });

        if (!design || design.userId !== dbUser.id) {
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