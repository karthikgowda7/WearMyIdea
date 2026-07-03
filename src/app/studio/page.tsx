"use client";

import { useEffect, useState } from "react";

export default function StudioPage() {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [designs, setDesigns] = useState<any[]>([]);

    async function handleGenerate() {
        if (!prompt.trim()) return;

        try {
            setLoading(true);

            const response = await fetch("/api/designs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    prompt,
                }),
            });

            const data = await response.json();

            console.log(data);

            alert("Design saved successfully!");
            await loadDesigns();

            setPrompt("");
        } catch (error) {
            console.error(error);

            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadDesigns();
    }, []);

    async function loadDesigns() {
        try {
            const response = await fetch("/api/designs");

            const data = await response.json();

            setDesigns(data);
        } catch (error) {
            console.error(error);
        }
    }

    async function handleDelete(designId: string) {
        try {
            await fetch("/api/designs", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    designId,
                }),
            });

            await loadDesigns();
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center p-6">
            <h1 className="text-4xl font-bold">
                Design Studio 🎨
            </h1>

            <p className="mt-2 text-gray-500">
                Describe the t-shirt design you want.
            </p>

            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                placeholder="A samurai cat riding a skateboard..."
                className="mt-6 w-full rounded-lg border p-4"
            />

            <button
                onClick={handleGenerate}
                disabled={loading}
                className="mt-4 rounded-lg bg-white px-6 py-3 font-semibold text-black"
            >
                {loading ? "Saving..." : "Generate Design"}
            </button>

            <div className="mt-10 w-full">
                <h2 className="mb-4 text-2xl font-bold">
                    My Designs
                </h2>

                <div className="space-y-3">
                    {designs.map((design) => (
                        <div
                            key={design.id}
                            className="rounded-lg border p-4"
                        >
                            <p>{design.prompt}</p>

                            <p className="mt-2 text-xs text-gray-500">
                                {new Date(design.createdAt).toLocaleString()}
                            </p>
                            <button
                                onClick={() => handleDelete(design.id)}
                                className="mt-3 rounded border px-3 py-1 text-sm"
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}