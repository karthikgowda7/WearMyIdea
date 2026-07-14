"use client";

import { useEffect, useState } from "react";
import {
    resolveVariantId,
} from "@/lib/printrove-variants";
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

    const [selectedColor, setSelectedColor] =
        useState("White");
    const [selectedSize, setSelectedSize] =
        useState("M");
    const [variantId, setVariantId] =
        useState<number | null>(null);
    const [showProductConfig, setShowProductConfig] =
        useState(false);

    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [designs, setDesigns] = useState<Design[]>([]);
    const [selectedDesignId, setSelectedDesignId] =
        useState<string | null>(null);

    const [showAddressForm, setShowAddressForm] =
        useState(false);

    const [shipping, setShipping] = useState({
        customerName: "",
        phone: "",
        addressLine1: "",
        city: "",
        state: "",
        pincode: "",
    });

    useEffect(() => {
        loadDesigns();
    }, []);

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
        if (
            !shipping.customerName ||
            !shipping.phone ||
            !shipping.addressLine1 ||
            !shipping.city ||
            !shipping.state ||
            !shipping.pincode
        ) {
            alert("Please fill all fields");
            return;
        }

        if (!selectedDesignId) return;

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

                        const result =
                            await verifyResponse.json();

                        console.log(result);

                        if (result.success) {
                            alert(
                                "Payment Verified ✅"
                            );
                        } else {
                            alert(
                                "Payment Verification Failed ❌"
                            );
                        }
                    },
                });

            razorpay.open();
        } catch (error) {
            console.error(error);

            alert(
                "Failed to start payment"
            );
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
                                    <button
                                        onClick={() => handleBuy(design.id)}
                                        className="mt-4 ml-2 rounded border px-3 py-1 text-sm"
                                    >
                                        BUY
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {showProductConfig && selectedDesignId && (
                <ProductDesigner
                    designImageUrl={
                        designs.find(
                            (d) =>
                                d.id ===
                                selectedDesignId
                        )?.imageUrl ?? ""
                    }
                    selectedColor={selectedColor}
                    selectedSize={selectedSize}
                    onColorChange={setSelectedColor}
                    onSizeChange={setSelectedSize}
                    onContinue={
                        handleProductContinue
                    }
                    onCancel={() =>
                        setShowProductConfig(false)
                    }
                />
            )}
            {showAddressForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 text-black">
                        <h2 className="mb-4 text-xl font-bold">
                            Shipping Details
                        </h2>

                        <input
                            placeholder="Full Name"
                            className="mb-3 w-full border p-2"
                            value={shipping.customerName}
                            onChange={(e) =>
                                setShipping({
                                    ...shipping,
                                    customerName:
                                        e.target.value,
                                })
                            }
                        />

                        <input
                            placeholder="Phone"
                            className="mb-3 w-full border p-2"
                            value={shipping.phone}
                            onChange={(e) =>
                                setShipping({
                                    ...shipping,
                                    phone:
                                        e.target.value,
                                })
                            }
                        />

                        <input
                            placeholder="Address"
                            className="mb-3 w-full border p-2"
                            value={shipping.addressLine1}
                            onChange={(e) =>
                                setShipping({
                                    ...shipping,
                                    addressLine1:
                                        e.target.value,
                                })
                            }
                        />

                        <input
                            placeholder="City"
                            className="mb-3 w-full border p-2"
                            value={shipping.city}
                            onChange={(e) =>
                                setShipping({
                                    ...shipping,
                                    city:
                                        e.target.value,
                                })
                            }
                        />

                        <input
                            placeholder="State"
                            className="mb-3 w-full border p-2"
                            value={shipping.state}
                            onChange={(e) =>
                                setShipping({
                                    ...shipping,
                                    state:
                                        e.target.value,
                                })
                            }
                        />

                        <input
                            placeholder="Pincode"
                            className="mb-4 w-full border p-2"
                            value={shipping.pincode}
                            onChange={(e) =>
                                setShipping({
                                    ...shipping,
                                    pincode:
                                        e.target.value,
                                })
                            }
                        />

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddressForm(false);
                                    setShowProductConfig(true);
                                }}
                                className="flex-1 rounded border border-gray-300 py-2 font-semibold text-gray-700 transition hover:bg-gray-50"
                            >
                                Back
                            </button>
                            <button
                                onClick={
                                    handleAddressSubmit
                                }
                                className="flex-1 rounded bg-black py-2 font-semibold text-white transition hover:bg-neutral-800"
                            >
                                Continue To Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}