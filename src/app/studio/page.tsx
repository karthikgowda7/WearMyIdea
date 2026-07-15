"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { resolveVariantId } from "@/lib/printrove-variants";
import ProductDesigner from "@/components/ProductDesigner";

declare global {
    interface Window {
        Razorpay: any;
    }
}

type Design = {
    id: string;
    prompt: string;
    enhancedPrompt?: string;
    imageUrl?: string;
    createdAt: string;
};

export default function StudioPage() {
    const [selectedColor, setSelectedColor] = useState("White");
    const [selectedSize, setSelectedSize] = useState("M");
    const [variantId, setVariantId] = useState<number | null>(null);
    const [showProductConfig, setShowProductConfig] = useState(false);

    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [designs, setDesigns] = useState<Design[]>([]);
    const [designsLoading, setDesignsLoading] = useState(true);
    const [selectedDesignId, setSelectedDesignId] = useState<string | null>(null);

    const [showAddressForm, setShowAddressForm] = useState(false);
    const [addressErrors, setAddressErrors] = useState<Record<string, boolean>>({});

    // Inline notification banner (replaces alert())
    const [notification, setNotification] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    function showNotification(type: "success" | "error", message: string) {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 5000);
    }

    const [shipping, setShipping] = useState({
        customerName: "",
        phone: "",
        addressLine1: "",
        city: "",
        state: "",
        pincode: "",
    });
    const [saveAddress, setSaveAddress] = useState(true);

    useEffect(() => {
        loadDesigns();
        loadProfile();
    }, []);

    async function loadProfile() {
        try {
            const response = await fetch("/api/profile");
            if (response.ok) {
                const profile = await response.json();
                setShipping((prev) => ({
                    ...prev,
                    customerName: profile.name || prev.customerName,
                    phone: profile.phone || prev.phone,
                    addressLine1: profile.addressLine1 || prev.addressLine1,
                    city: profile.city || prev.city,
                    state: profile.state || prev.state,
                    pincode: profile.pincode || prev.pincode,
                }));
            }
        } catch (error) {
            console.error("Failed to load profile", error);
        }
    }

    useEffect(() => {
        const script = document.createElement("script");

        script.src =
            "https://checkout.razorpay.com/v1/checkout.js";

        script.async = true;

        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    async function loadDesigns() {
        try {
            setDesignsLoading(true);
            const response = await fetch("/api/generate-design");
            const data = await response.json();
            setDesigns(data);
        } catch (error) {
            console.error(error);
        } finally {
            setDesignsLoading(false);
        }
    }

    async function handleGenerate() {
        if (!prompt.trim()) return;

        try {
            setLoading(true);
            const response = await fetch("/api/generate-design", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }),
            });

            await response.json();
            await loadDesigns();
            setPrompt("");
        } catch (error) {
            console.error(error);
            showNotification("error", "Failed to generate design. Please try again.");
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

    function handleBuy(designId: string) {
        setSelectedDesignId(designId);

        setSelectedColor("White");
        setSelectedSize("M");

        setVariantId(
            resolveVariantId(
                "White",
                "M"
            )
        );

        setShowProductConfig(true);
    }

    function handleProductContinue() {
        const id =
            resolveVariantId(
                selectedColor,
                selectedSize
            );

        setVariantId(id);

        setShowProductConfig(false);

        setShowAddressForm(true);
    }

    async function handleAddressSubmit() {
        const errors: Record<string, boolean> = {};
        if (!shipping.customerName) errors.customerName = true;
        if (!shipping.phone) errors.phone = true;
        if (!shipping.addressLine1) errors.addressLine1 = true;
        if (!shipping.city) errors.city = true;
        if (!shipping.state) errors.state = true;
        if (!shipping.pincode) errors.pincode = true;

        if (Object.keys(errors).length > 0) {
            setAddressErrors(errors);
            return;
        }

        setAddressErrors({});
        if (!selectedDesignId) return;

        if (saveAddress) {
            try {
                await fetch("/api/profile", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: shipping.customerName,
                        phone: shipping.phone,
                        addressLine1: shipping.addressLine1,
                        city: shipping.city,
                        state: shipping.state,
                        pincode: shipping.pincode,
                    }),
                });
            } catch (error) {
                console.error("Failed to update profile", error);
            }
        }

        setShowAddressForm(false);
        await startPayment(selectedDesignId);
    }

    async function startPayment(designId: string) {
        try {
            const response = await fetch(
                "/api/create-order",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        amount: 499,
                        designId,
                        shipping,
                    }),
                }
            );

            const order =
                await response.json();

            const razorpay =
                new window.Razorpay({
                    key:
                        process.env
                            .NEXT_PUBLIC_RAZORPAY_KEY_ID,

                    amount: order.amount,

                    currency:
                        order.currency,

                    order_id: order.id,

                    name: "WearMyIdea",

                    description:
                        "Custom AI T-Shirt",

                    handler: async function (
                        response: any
                    ) {
                        const verifyResponse =
                            await fetch(
                                "/api/verify-payment",
                                {
                                    method: "POST",
                                    headers: {
                                        "Content-Type":
                                            "application/json",
                                    },
                                    body: JSON.stringify({
                                        ...response,
                                        designId,
                                        amount: 499,
                                        shipping,
                                        color: selectedColor,
                                        size: selectedSize,
                                        variantId,
                                    }),
                                }
                            );

                        const result = await verifyResponse.json();

                        if (result.success) {
                            showNotification("success", "Payment verified! Your order is being processed.");
                        } else {
                            showNotification("error", "Payment verification failed. Please contact support.");
                        }
                    },
                });

            razorpay.open();
        } catch (error) {
            console.error(error);
            showNotification("error", "Failed to start payment. Please try again.");
        }
    }

    const inputClass = (field: string) =>
        `w-full rounded-lg border bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-200 ${
            addressErrors[field] ? "border-red-300 bg-red-50" : "border-gray-200"
        }`;

    return (
        <main className="min-h-screen bg-white">
            {/* ── Nav ── */}
            <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
                    <Link href="/dashboard" className="text-lg font-bold tracking-tight">
                        WearMyIdea
                    </Link>
                    <div className="flex items-center gap-6">
                        <Link
                            href="/dashboard"
                            className="text-sm font-medium text-gray-500 transition hover:text-gray-900"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/studio"
                            className="text-sm font-medium text-gray-900"
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

            {/* ── Notification banner ── */}
            {notification && (
                <div
                    className={`toast-enter border-b px-6 py-3 text-center text-sm font-medium ${
                        notification.type === "success"
                            ? "border-green-100 bg-green-50 text-green-700"
                            : "border-red-100 bg-red-50 text-red-700"
                    }`}
                >
                    {notification.message}
                    <button
                        onClick={() => setNotification(null)}
                        className="ml-3 text-xs opacity-60 hover:opacity-100"
                    >
                        ✕
                    </button>
                </div>
            )}

            <div className="mx-auto max-w-5xl px-6 py-10">
                {/* ── Header ── */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        Design Studio
                    </h1>
                    <p className="mt-2 text-gray-500">
                        Describe your idea and let AI generate a unique t-shirt design.
                    </p>
                </div>

                {/* ── Prompt Area ── */}
                <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50/50 p-6">
                    <label
                        htmlFor="design-prompt"
                        className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                        What do you want on your t-shirt?
                    </label>
                    <textarea
                        id="design-prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={4}
                        placeholder="A samurai cat riding a skateboard through a neon-lit Tokyo street..."
                        className="w-full resize-none rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
                    />
                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                            Be descriptive — the more detail, the better the result.
                        </p>
                        <button
                            onClick={handleGenerate}
                            disabled={loading || !prompt.trim()}
                            className="rounded-lg bg-black px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                    Generating…
                                </span>
                            ) : (
                                "Generate Design"
                            )}
                        </button>
                    </div>
                </div>

                {/* ── Skeleton while generating ── */}
                {loading && (
                    <div className="mt-8">
                        <div className="animate-pulse rounded-xl border border-gray-200 bg-gray-50">
                            <div className="aspect-square w-full rounded-t-xl bg-gray-200" />
                            <div className="p-4">
                                <div className="h-4 w-3/4 rounded bg-gray-200" />
                                <div className="mt-2 h-3 w-1/3 rounded bg-gray-200" />
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Designs Grid ── */}
                <div className="mt-12">
                    <h2 className="text-xl font-bold text-gray-900">
                        My Designs
                    </h2>

                    {designsLoading ? (
                        /* Skeleton loading state */
                        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="animate-pulse overflow-hidden rounded-xl border border-gray-200"
                                >
                                    <div className="aspect-square bg-gray-100" />
                                    <div className="p-4">
                                        <div className="h-4 w-3/4 rounded bg-gray-100" />
                                        <div className="mt-2 h-3 w-1/3 rounded bg-gray-100" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : designs.length === 0 ? (
                        /* Empty state */
                        <div className="mt-10 flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl">
                                🎨
                            </div>
                            <p className="mt-4 text-sm font-medium text-gray-900">
                                No designs yet
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                                Describe an idea above and hit Generate to create your first design.
                            </p>
                        </div>
                    ) : (
                        /* Design cards */
                        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {designs.map((design) => (
                                <div
                                    key={design.id}
                                    className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:shadow-md"
                                >
                                    {design.imageUrl && (
                                        <div className="relative overflow-hidden">
                                            <img
                                                src={design.imageUrl}
                                                alt={design.prompt}
                                                className="aspect-square w-full object-cover transition group-hover:scale-[1.02]"
                                            />
                                        </div>
                                    )}

                                    <div className="p-4">
                                        <p className="line-clamp-2 text-sm font-medium text-gray-900">
                                            {design.prompt}
                                        </p>
                                        <p className="mt-1.5 text-xs text-gray-400">
                                            {new Date(design.createdAt).toLocaleDateString(
                                                "en-IN",
                                                { day: "numeric", month: "short", year: "numeric" }
                                            )}
                                        </p>

                                        <div className="mt-4 flex gap-2">
                                            <button
                                                onClick={() => handleBuy(design.id)}
                                                className="flex-1 rounded-lg bg-black py-2 text-xs font-semibold text-white transition hover:bg-gray-800"
                                            >
                                                Order This
                                            </button>
                                            <button
                                                onClick={() => handleDelete(design.id)}
                                                className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Product Designer Modal ── */}
            {showProductConfig && selectedDesignId && (
                <ProductDesigner
                    designImageUrl={
                        designs.find((d) => d.id === selectedDesignId)?.imageUrl ?? ""
                    }
                    selectedColor={selectedColor}
                    selectedSize={selectedSize}
                    onColorChange={setSelectedColor}
                    onSizeChange={setSelectedSize}
                    onContinue={handleProductContinue}
                    onCancel={() => setShowProductConfig(false)}
                />
            )}

            {/* ── Address Form Modal ── */}
            {showAddressForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 text-gray-900 shadow-2xl sm:p-8">
                        {/* Header */}
                        <div className="mb-6">
                            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                                Step 2 of 3
                            </p>
                            <h2 className="mt-1 text-xl font-bold">
                                Shipping Details
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Where should we deliver your t-shirt?
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                                    Full Name *
                                </label>
                                <input
                                    placeholder="John Doe"
                                    className={inputClass("customerName")}
                                    value={shipping.customerName}
                                    onChange={(e) => {
                                        setShipping({ ...shipping, customerName: e.target.value });
                                        setAddressErrors((p) => ({ ...p, customerName: false }));
                                    }}
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                                    Phone Number *
                                </label>
                                <input
                                    placeholder="9876543210"
                                    className={inputClass("phone")}
                                    value={shipping.phone}
                                    onChange={(e) => {
                                        setShipping({ ...shipping, phone: e.target.value });
                                        setAddressErrors((p) => ({ ...p, phone: false }));
                                    }}
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                                    Address *
                                </label>
                                <input
                                    placeholder="123 Lane, Area"
                                    className={inputClass("addressLine1")}
                                    value={shipping.addressLine1}
                                    onChange={(e) => {
                                        setShipping({ ...shipping, addressLine1: e.target.value });
                                        setAddressErrors((p) => ({ ...p, addressLine1: false }));
                                    }}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-gray-600">
                                        City *
                                    </label>
                                    <input
                                        placeholder="Bangalore"
                                        className={inputClass("city")}
                                        value={shipping.city}
                                        onChange={(e) => {
                                            setShipping({ ...shipping, city: e.target.value });
                                            setAddressErrors((p) => ({ ...p, city: false }));
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-gray-600">
                                        State *
                                    </label>
                                    <input
                                        placeholder="Karnataka"
                                        className={inputClass("state")}
                                        value={shipping.state}
                                        onChange={(e) => {
                                            setShipping({ ...shipping, state: e.target.value });
                                            setAddressErrors((p) => ({ ...p, state: false }));
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                                    Pincode *
                                </label>
                                <input
                                    placeholder="560001"
                                    className={inputClass("pincode")}
                                    value={shipping.pincode}
                                    onChange={(e) => {
                                        setShipping({ ...shipping, pincode: e.target.value });
                                        setAddressErrors((p) => ({ ...p, pincode: false }));
                                    }}
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="saveAddress"
                                checked={saveAddress}
                                onChange={(e) => setSaveAddress(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                            />
                            <label htmlFor="saveAddress" className="text-sm text-gray-600">
                                Save this address to my profile
                            </label>
                        </div>

                        {Object.values(addressErrors).some(Boolean) && (
                            <p className="mt-4 text-xs text-red-500">
                                Please fill in all required fields.
                            </p>
                        )}

                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddressForm(false);
                                    setShowProductConfig(true);
                                    setAddressErrors({});
                                }}
                                className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={handleAddressSubmit}
                                className="flex-1 rounded-lg bg-black py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                            >
                                Continue to Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}