import {
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-5xl font-bold">
        WearMyIdea 🚀
      </h1>

      <p className="text-gray-400">
        AI Powered Custom T-Shirt Platform
      </p>

      <div className="flex gap-4">
        <SignInButton mode="redirect">
          <button className="rounded-md border px-4 py-2 hover:bg-white hover:text-black transition">
            Sign In
          </button>
        </SignInButton>

        <SignUpButton mode="redirect">
          <button className="rounded-md border px-4 py-2 hover:bg-white hover:text-black transition">
            Sign Up
          </button>
        </SignUpButton>
      </div>
    </main>
  );
}