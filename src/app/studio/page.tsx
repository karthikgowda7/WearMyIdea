"use client";

import { useEffect, useState } from "react";

type Design = {
    id: string;
    prompt: string;
    enhancedPrompt?: string;
    imageUrl?: string;
    createdAt: string;
};

export default function StudioPage() {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [designs, setDesigns] = useState<Design[]>([]);

    useEffect(() => {
        loadDesigns();
    }, []);

    async function loadDesigns() {
        try {
            const response = await fetch(
                "/api/generate-design"
            );

            const data = await response.json();

            setDesigns(data);
        } catch (error) {
            console.error(error);
        }
    }

    async function handleGenerate() {
        if (!prompt.trim()) return;

        try {
            setLoading(true);

            const response = await fetch(
                "/api/generate-design",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        prompt,
                    }),
                }
            );

            const data = await response.json();

            console.log(data);

            await loadDesigns();

            setPrompt("");
        } catch (error) {
            console.error(error);

            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(
        designId: string
    ) {
        try {
            await fetch(
                "/api/generate-design",
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        designId,
                    }),
                }
            );

            await loadDesigns();
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <main className="mx-auto min-h-screen max-w-6xl p-6">
            <h1 className="text-4xl font-bold">
                Design Studio 🎨
            </h1>

            <p className="mt-2 text-gray-500">
                Describe the t-shirt design you
                want.
            </p>

            <textarea
                value={prompt}
                onChange={(e) =>
                    setPrompt(e.target.value)
                }
                rows={6}
                placeholder="A samurai cat riding a skateboard..."
                className="mt-6 w-full rounded-lg border p-4"
            />

            <button
                onClick={handleGenerate}
                disabled={loading}
                className="mt-4 rounded-lg bg-white px-6 py-3 font-semibold text-black"
            >
                {loading
                    ? "Generating..."
                    : "Generate Design"}
            </button>

            <div className="mt-12">
                <h2 className="mb-6 text-2xl font-bold">
                    My Designs
                </h2>

                {designs.length === 0 ? (
                    <p className="text-gray-500">
                        No designs yet.
                    </p>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {designs.map((design) => (
                            <div
                                key={design.id}
                                className="overflow-hidden rounded-xl border"
                            >
                                {design.imageUrl && (
                                    <img
                                        src={
                                            design.imageUrl
                                        }
                                        alt={
                                            design.prompt
                                        }
                                        className="h-72 w-full object-cover"
                                    />
                                )}

                                <div className="p-4">
                                    <p className="font-medium">
                                        {
                                            design.prompt
                                        }
                                    </p>

                                    <p className="mt-2 text-xs text-gray-500">
                                        {new Date(
                                            design.createdAt
                                        ).toLocaleString()}
                                    </p>

                                    <button
                                        onClick={() =>
                                            handleDelete(
                                                design.id
                                            )
                                        }
                                        className="mt-4 rounded border px-3 py-1 text-sm"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}