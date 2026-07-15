import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";

export default async function DashboardPage() {
    const { userId } = await auth();
    if (!userId) {
        return null;
    }

    let existingUser = await prisma.user.findUnique({
        where: {
            clerkId: userId,
        },
        include: {
            designs: {
                orderBy: { createdAt: "desc" },
                take: 3,
            },
            _count: {
                select: { designs: true },
            },
        },
    });

    if (!existingUser) {
        const newUser = await prisma.user.create({
            data: {
                clerkId: userId,
            },
        });
        // Re-fetch with includes
        existingUser = await prisma.user.findUnique({
            where: { id: newUser.id },
            include: {
                designs: {
                    orderBy: { createdAt: "desc" },
                    take: 3,
                },
                _count: {
                    select: { designs: true },
                },
            },
        });
        if (!existingUser) return null;
    }

    const designCount = existingUser._count.designs;

    return (
        <main className="min-h-screen bg-white">
            {/* ── Nav ── */}
            <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
                    <Link
                        href="/dashboard"
                        className="text-lg font-bold tracking-tight"
                    >
                        WearMyIdea
                    </Link>
                    <div className="flex items-center gap-6">
                        <Link
                            href="/dashboard"
                            className="text-sm font-medium text-gray-900"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/studio"
                            className="text-sm font-medium text-gray-500 transition hover:text-gray-900"
                        >
                            Studio
                        </Link>
                        <Link
                            href="/profile"
                            className="text-sm font-medium text-gray-500 transition hover:text-gray-900"
                        >
                            Profile
                        </Link>
                        <UserButton />
                    </div>
                </div>
            </nav>

            <div className="mx-auto max-w-4xl px-6 py-12">
                {/* ── Welcome ── */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        Welcome back
                    </h1>
                    <p className="mt-2 text-gray-500">
                        Create, manage, and order your custom AI
                        t-shirt designs.
                    </p>
                </div>

                {/* ── Stats ── */}
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-gray-200 bg-white p-5">
                        <p className="text-sm font-medium text-gray-500">
                            Designs Created
                        </p>
                        <p className="mt-1 text-2xl font-bold text-gray-900">
                            {designCount}
                        </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white p-5">
                        <p className="text-sm font-medium text-gray-500">
                            Product
                        </p>
                        <p className="mt-1 text-2xl font-bold text-gray-900">
                            T-Shirt
                        </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white p-5">
                        <p className="text-sm font-medium text-gray-500">
                            Price
                        </p>
                        <p className="mt-1 text-2xl font-bold text-gray-900">
                            ₹499
                        </p>
                    </div>
                </div>

                {/* ── Quick Actions ── */}
                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                    <Link
                        href="/studio"
                        className="group flex flex-col rounded-xl border border-gray-200 p-6 transition hover:border-gray-300 hover:shadow-sm"
                    >
                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-black text-lg text-white">
                            ✨
                        </div>
                        <h3 className="text-base font-semibold text-gray-900">
                            Open Design Studio
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Generate new AI designs and
                            order custom t-shirts.
                        </p>
                        <span className="mt-4 text-sm font-medium text-gray-400 transition group-hover:text-gray-900">
                            Go to Studio →
                        </span>
                    </Link>

                    <Link
                        href="/studio"
                        className="group flex flex-col rounded-xl border border-gray-200 p-6 transition hover:border-gray-300 hover:shadow-sm"
                    >
                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-lg">
                            🎨
                        </div>
                        <h3 className="text-base font-semibold text-gray-900">
                            View My Designs
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Browse and manage your{" "}
                            {designCount > 0
                                ? `${designCount} design${designCount > 1 ? "s" : ""}`
                                : "designs"}
                            .
                        </p>
                        <span className="mt-4 text-sm font-medium text-gray-400 transition group-hover:text-gray-900">
                            View Designs →
                        </span>
                    </Link>
                </div>

                {/* ── Recent Designs ── */}
                {existingUser.designs.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Recent Designs
                        </h2>
                        <div className="mt-4 grid gap-4 sm:grid-cols-3">
                            {existingUser.designs.map(
                                (design) => (
                                    <div
                                        key={design.id}
                                        className="overflow-hidden rounded-xl border border-gray-200"
                                    >
                                        {design.imageUrl && (
                                            <img
                                                src={
                                                    design.imageUrl
                                                }
                                                alt={
                                                    design.prompt
                                                }
                                                className="aspect-square w-full object-cover"
                                            />
                                        )}
                                        <div className="p-3">
                                            <p className="truncate text-sm font-medium text-gray-900">
                                                {
                                                    design.prompt
                                                }
                                            </p>
                                            <p className="mt-0.5 text-xs text-gray-400">
                                                {new Date(
                                                    design.createdAt
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}