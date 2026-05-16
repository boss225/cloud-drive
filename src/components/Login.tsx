"use client";

import { createClient } from "@/utils/supabase/client";
import { FcGoogle } from "react-icons/fc";
import Image from "next/image";

export default function Login() {
  const handleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center gap-6">
        <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center text-3xl font-bold">
          <Image
            src="/logo_tcd.png"
            alt="Top Cloud Drive"
            width={36}
            height={36}
            className="rounded-lg object-contain"
          />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Top Cloud Drive
          </h1>
          <p className="text-gray-500">
            Sign in to access your unlimited storage
          </p>
        </div>
        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors focus:ring-4 focus:ring-gray-100"
        >
          <FcGoogle size={24} />
          Continue with Google
        </button>
      </div>
    </div>
  );
}
