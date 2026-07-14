"use client";

import { useState } from "react";
import TShirtPreview from "./TShirtPreview";

interface ProductDesignerProps {
    designImageUrl: string;
    selectedColor: string;
    selectedSize: string;
    onColorChange: (color: string) => void;
    onSizeChange: (size: string) => void;
    onContinue: () => void;
    onCancel: () => void;
}

const COLORS = ["White", "Black"] as const;
const SIZES = ["S", "M", "L", "XL"] as const;

/** Swatch hex values for the visual color dots */
const COLOR_HEX: Record<string, string> = {
    White: "#ffffff",
    Black: "#1a1a1a",
};

export default function ProductDesigner({
    designImageUrl,
    selectedColor,
    selectedSize,
    onColorChange,
    onSizeChange,
    onContinue,
    onCancel,
}: ProductDesignerProps) {
    const [activeTab, setActiveTab] = useState<
        "front" | "back"
    >("front");

    return (
        /* ── Full-screen overlay ── */
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div
                className="relative flex w-full overflow-hidden rounded-2xl bg-white text-gray-900 shadow-2xl"
                style={{ maxWidth: 960, maxHeight: "90vh" }}
            >
                {/* ────────── Close button ────────── */}
                <button
                    onClick={onCancel}
                    className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                    aria-label="Close"
                >
                    ✕
                </button>

                {/* ────────── Left panel ────────── */}
                <div
                    className="flex flex-col justify-between overflow-y-auto border-r border-gray-200 p-6"
                    style={{ width: "40%", minWidth: 300 }}
                >
                    {/* Header */}
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                            Men&apos;s Clothing
                        </p>
                        <h2 className="mt-1 text-lg font-bold leading-tight">
                            Half Sleeve Round Neck T-Shirt
                        </h2>
                        <p className="mt-0.5 text-xs text-gray-400">
                            Maximum print area: 15.60 in ×
                            19.60 in
                        </p>

                        {/* ── Color picker ── */}
                        <div className="mt-6">
                            <p className="mb-2 text-sm font-semibold">
                                Color
                            </p>
                            <div className="flex gap-3">
                                {COLORS.map((c) => (
                                    <button
                                        key={c}
                                        onClick={() =>
                                            onColorChange(c)
                                        }
                                        title={c}
                                        className={`h-8 w-8 rounded-full border-2 transition ${
                                            selectedColor ===
                                            c
                                                ? "border-black ring-2 ring-black/20"
                                                : "border-gray-300 hover:border-gray-500"
                                        }`}
                                        style={{
                                            backgroundColor:
                                                COLOR_HEX[c],
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* ── Design thumbnail ── */}
                        <div className="mt-6">
                            <p className="mb-2 text-sm font-semibold">
                                Your Design
                            </p>
                            <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
                                <img
                                    src={designImageUrl}
                                    alt="Design preview"
                                    className="h-16 w-16 rounded object-cover"
                                />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">
                                        AI Generated
                                        Design
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Drag &amp; resize
                                        on preview →
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* ── Size selector ── */}
                        <div className="mt-6">
                            <p className="mb-2 text-sm font-semibold">
                                Size
                            </p>
                            <div className="flex gap-2">
                                {SIZES.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() =>
                                            onSizeChange(s)
                                        }
                                        className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                                            selectedSize ===
                                            s
                                                ? "bg-black text-white"
                                                : "border-gray-300 text-gray-700 hover:border-gray-500"
                                        }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Bottom actions ── */}
                    <div className="mt-8 flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onContinue}
                            className="flex-1 rounded-lg bg-red-500 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
                        >
                            Continue
                        </button>
                    </div>
                </div>

                {/* ────────── Right panel ────────── */}
                <div
                    className="flex flex-col bg-gray-50"
                    style={{ width: "60%" }}
                >
                    {/* Front / Back tabs */}
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() =>
                                setActiveTab("front")
                            }
                            className={`flex-1 py-3 text-center text-sm font-semibold transition ${
                                activeTab === "front"
                                    ? "border-b-2 border-red-500 text-red-500"
                                    : "text-gray-400 hover:text-gray-600"
                            }`}
                        >
                            FRONT
                        </button>
                        <button
                            onClick={() =>
                                setActiveTab("back")
                            }
                            className={`flex-1 py-3 text-center text-sm font-semibold transition ${
                                activeTab === "back"
                                    ? "border-b-2 border-red-500 text-red-500"
                                    : "text-gray-400 hover:text-gray-600"
                            }`}
                        >
                            BACK
                        </button>
                    </div>

                    {/* Preview area */}
                    <div className="flex flex-1 items-center justify-center overflow-hidden p-6">
                        {activeTab === "front" ? (
                            <TShirtPreview
                                color={selectedColor}
                                designImageUrl={
                                    designImageUrl
                                }
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-3 text-gray-400">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-2xl">
                                    🔒
                                </div>
                                <p className="text-sm font-medium">
                                    Back Printing
                                </p>
                                <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Coming Soon
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
