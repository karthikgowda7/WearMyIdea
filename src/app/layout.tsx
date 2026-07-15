import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "WearMyIdea — AI-Powered Custom T-Shirts",
  description:
    "Generate custom t-shirt designs with AI and get them printed and delivered. Turn your ideas into wearable art.",
  keywords: ["custom t-shirts", "AI design", "print on demand", "WearMyIdea"],
  openGraph: {
    title: "WearMyIdea — Turn Ideas Into Wearable Art",
    description:
      "Generate custom t-shirt designs with AI and get them printed and delivered.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}