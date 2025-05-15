"use client";

import Image from "next/image";
import { supabase } from "../../utils/supabaseClient";

export default function Login() {
  const handleGoogleLogin = async () => {
    try {
      const redirectUrl = typeof window !== 'undefined' ? window.location.origin : '';
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${redirectUrl}`
        }
      });
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A0613] via-[#2B176B] to-[#3B2BFF]">
      <div className="bg-[#1a1333]/80 shadow-2xl rounded-2xl px-8 py-12 w-full max-w-md flex flex-col items-center border-2 border-[#6B4EFF]">
        <h1 className="text-3xl font-bold text-white mb-2 drop-shadow">Welcome to Wave</h1>
        <p className="text-[#D1D5DB] mb-8 text-center">Sign in to continue</p>
        <button
          className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-[#6B4EFF] text-white font-semibold text-lg shadow-lg hover:bg-[#3B2BFF] transition-colors mb-4 border border-[#6B4EFF] focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:ring-offset-2"
          onClick={handleGoogleLogin}
        >
          <Image src="/google-logo.png" alt="Google logo" width={24} height={24} />
          Log in with Google
        </button>
      </div>
    </div>
  );
} 