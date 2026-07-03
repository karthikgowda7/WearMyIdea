import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export default async function DashboardPage() {
    const { userId } = await auth();
    if (!userId) {
        return null;
    }

    let existingUser = await prisma.user.findUnique({
        where: {
            clerkId: userId,
        },
    });

    if (!existingUser) {
        existingUser = await prisma.user.create({
            data: {
                clerkId: userId,
            },
        });
    }

    return (
        <main className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold">
                    Dashboard 🚀
                </h1>

                <p className="mt-4">
                    Clerk User ID:
                </p>

                <p className="text-sm text-gray-500">
                    {userId}
                </p>
                <p className="mt-4">
                    Database User:
                </p>

                <pre className="text-xs">
                    {JSON.stringify(existingUser, null, 2)}
                </pre>
                <Link
                    href="/studio"
                    className="mt-6 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-black"
                >
                    Open Design Studio
                </Link>
            </div>
        </main>
    );
}