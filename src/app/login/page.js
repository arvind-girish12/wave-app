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
          redirectTo: `${redirectUrl}/dashboard`
        }
      });
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-wave-offwhite">
      <div className="bg-white shadow-2xl rounded-2xl px-8 py-12 w-full max-w-md flex flex-col items-center">
        <h1 className="text-3xl font-bold text-wave-forest mb-2">Welcome to Wave</h1>
        <p className="text-wave-forest mb-8 text-center">Sign in to continue</p>
        <button
          className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-wave-teal text-white font-semibold text-lg shadow-md hover:bg-wave-forest transition-colors mb-4"
          onClick={handleGoogleLogin}
        >
          <Image src="/google-logo.png" alt="Google logo" width={24} height={24} />
          Log in with Google
        </button>
      </div>
    </div>
  );
} 