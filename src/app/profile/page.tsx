"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserButton, useClerk } from "@clerk/nextjs";

export default function ProfilePage() {
    const { signOut } = useClerk();
    const [profile, setProfile] = useState({
        email: "",
        name: "",
        phone: "",
        addressLine1: "",
        city: "",
        state: "",
        pincode: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    useEffect(() => {
        loadProfile();
    }, []);

    async function loadProfile() {
        try {
            setLoading(true);
            const response = await fetch("/api/profile");
            if (response.ok) {
                const data = await response.json();
                setProfile({
                    email: data.email || "",
                    name: data.name || "",
                    phone: data.phone || "",
                    addressLine1: data.addressLine1 || "",
                    city: data.city || "",
                    state: data.state || "",
                    pincode: data.pincode || "",
                });
            }
        } catch (error) {
            console.error("Failed to load profile", error);
            showNotification("error", "Failed to load profile data.");
        } finally {
            setLoading(false);
        }
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        try {
            setSaving(true);
            const response = await fetch("/api/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(profile),
            });

            if (response.ok) {
                showNotification("success", "Profile updated successfully!");
            } else {
                throw new Error("Failed to save");
            }
        } catch (error) {
            console.error("Failed to save profile", error);
            showNotification("error", "Failed to save profile data.");
        } finally {
            setSaving(false);
        }
    }

    function showNotification(type: "success" | "error", message: string) {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 5000);
    }

    const inputClass = "w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-1 focus:ring-gray-200";

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
                            className="text-sm font-medium text-gray-500 transition hover:text-gray-900"
                        >
                            Studio
                        </Link>
                        <Link
                            href="/profile"
                            className="text-sm font-medium text-gray-900"
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
                    className={`fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-full px-6 py-2.5 text-sm font-medium shadow-lg transition-all ${
                        notification.type === "success"
                            ? "bg-gray-900 text-white"
                            : "bg-red-500 text-white"
                    }`}
                >
                    {notification.message}
                </div>
            )}

            <div className="mx-auto max-w-2xl px-6 py-12">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        My Profile
                    </h1>
                    <p className="mt-2 text-gray-500">
                        Manage your personal information and default shipping address.
                    </p>
                </div>

                <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    {loading ? (
                        <div className="flex h-40 items-center justify-center">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
                        </div>
                    ) : (
                        <form onSubmit={handleSave} className="space-y-5">
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    placeholder="john@example.com"
                                    className={inputClass}
                                    value={profile.email}
                                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-gray-600">
                                        Full Name
                                    </label>
                                    <input
                                        placeholder="John Doe"
                                        className={inputClass}
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-gray-600">
                                        Phone Number
                                    </label>
                                    <input
                                        placeholder="9876543210"
                                        className={inputClass}
                                        value={profile.phone}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                                    Address Line 1
                                </label>
                                <input
                                    placeholder="123 Lane, Area"
                                    className={inputClass}
                                    value={profile.addressLine1}
                                    onChange={(e) => setProfile({ ...profile, addressLine1: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-gray-600">
                                        City
                                    </label>
                                    <input
                                        placeholder="Bangalore"
                                        className={inputClass}
                                        value={profile.city}
                                        onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-gray-600">
                                        State
                                    </label>
                                    <input
                                        placeholder="Karnataka"
                                        className={inputClass}
                                        value={profile.state}
                                        onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                                    Pincode
                                </label>
                                <input
                                    placeholder="560001"
                                    className={inputClass}
                                    value={profile.pincode}
                                    onChange={(e) => setProfile({ ...profile, pincode: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex flex-col gap-3">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full rounded-lg bg-black py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-70"
                                >
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => signOut({ redirectUrl: '/' })}
                                    className="w-full rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                                >
                                    Logout
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </main>
    );
}
