"use client";

import { useState, useEffect } from "react";
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


interface StockEntry {
    variantId: number;
    color: string;
    size: string;
    stockStatus: "in_stock" | "out_of_stock";
}


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

    /* ── Stock state ── */
    const [stockData, setStockData] = useState<StockEntry[]>([]);
    const [stockLoading, setStockLoading] = useState(true);
    const [stockError, setStockError] = useState(false);

    /* Fetch stock once when the modal mounts. */
    useEffect(() => {
        let cancelled = false;
        setStockLoading(true);
        setStockError(false);

        fetch("/api/printrove-stock")
            .then((res) => {
                if (!res.ok) throw new Error("fetch failed");
                return res.json() as Promise<StockEntry[]>;
            })
            .then((data) => {
                if (cancelled) return;
                setStockData(data);

                // Auto-switch to first available size for the current color
                // in case the pre-selected size is out of stock.
                const firstAvailable = SIZES.find(
                    (s) =>
                        data.find(
                            (e) =>
                                e.color === selectedColor &&
                                e.size === s &&
                                e.stockStatus === "in_stock"
                        )
                );
                if (
                    firstAvailable &&
                    !data.find(
                        (e) =>
                            e.color === selectedColor &&
                            e.size === selectedSize &&
                            e.stockStatus === "in_stock"
                    )
                ) {
                    onSizeChange(firstAvailable);
                }
            })
            .catch(() => {
                if (!cancelled) setStockError(true);
            })
            .finally(() => {
                if (!cancelled) setStockLoading(false);
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Returns true when a given size is available for the selected color.
     * While loading or on error, every variant is treated as available
     * (optimistic UX — we never over-restrict due to transient failures).
     */
    function isSizeAvailable(size: string): boolean {
        if (stockLoading || stockError || stockData.length === 0)
            return true;
        const entry = stockData.find(
            (e) => e.color === selectedColor && e.size === size
        );
        return !entry || entry.stockStatus === "in_stock";
    }

    /** Returns true when the currently selected color+size is available. */
    const selectedVariantAvailable =
        stockLoading ||
        stockError ||
        stockData.length === 0 ||
        !!stockData.find(
            (e) =>
                e.color === selectedColor &&
                e.size === selectedSize &&
                e.stockStatus === "in_stock"
        );

    /**
     * When the user changes color, auto-switch to the first available size
     * for that new color so they never land on an OOS variant silently.
     */
    function handleColorChange(color: string) {
        onColorChange(color);
        if (stockData.length === 0) return;
        const currentOk = stockData.find(
            (e) =>
                e.color === color &&
                e.size === selectedSize &&
                e.stockStatus === "in_stock"
        );
        if (!currentOk) {
            const first = SIZES.find((s) =>
                stockData.find(
                    (e) =>
                        e.color === color &&
                        e.size === s &&
                        e.stockStatus === "in_stock"
                )
            );
            if (first) onSizeChange(first);
        }
    }

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
                                            handleColorChange(c)
                                        }
                                        title={c}
                                        className={`h-8 w-8 rounded-full border-2 transition ${selectedColor ===
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
                            <div className="mb-2 flex items-center gap-2">
                                <p className="text-sm font-semibold">
                                    Size
                                </p>
                                {stockLoading && (
                                    <span className="text-xs text-gray-400">
                                        Checking availability…
                                    </span>
                                )}
                                {stockError && (
                                    <span className="text-xs text-amber-500">
                                        ⚠ Stock unavailable
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {SIZES.map((s) => {
                                    const available =
                                        isSizeAvailable(s);
                                    return (
                                        <div
                                            key={s}
                                            className="flex flex-col items-center gap-0.5"
                                        >
                                            <button
                                                onClick={() => {
                                                    if (available)
                                                        onSizeChange(
                                                            s
                                                        );
                                                }}
                                                disabled={
                                                    !available
                                                }
                                                title={
                                                    !available
                                                        ? "Out of Stock"
                                                        : s
                                                }
                                                className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${!available
                                                        ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-300 opacity-50"
                                                        : selectedSize ===
                                                            s
                                                            ? "bg-black text-white"
                                                            : "border-gray-300 text-gray-700 hover:border-gray-500"
                                                    }`}
                                            >
                                                {s}
                                            </button>
                                            {!available && (
                                                <span className="text-[10px] leading-none text-red-400">
                                                    Out of Stock
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
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
                            disabled={
                                !selectedVariantAvailable
                            }
                            title={
                                !selectedVariantAvailable
                                    ? "Selected variant is out of stock"
                                    : undefined
                            }
                            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold text-white transition ${selectedVariantAvailable
                                    ? "bg-red-500 hover:bg-red-600"
                                    : "cursor-not-allowed bg-gray-300"
                                }`}
                        >
                            {selectedVariantAvailable
                                ? "Continue"
                                : "Out of Stock"}
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
                            className={`flex-1 py-3 text-center text-sm font-semibold transition ${activeTab === "front"
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
                            className={`flex-1 py-3 text-center text-sm font-semibold transition ${activeTab === "back"
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
