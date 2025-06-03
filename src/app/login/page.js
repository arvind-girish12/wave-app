"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";
import { shouldBypassAuthClient } from "../../utils/environment";

export default function Login() {
  const router = useRouter();

  useEffect(() => {
    if (shouldBypassAuthClient()) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleGoogleLogin = async () => {
    try {
      if (shouldBypassAuthClient()) {
        router.push("/dashboard");
        return;
      }
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

  if (shouldBypassAuthClient()) {
    return null;
  }

  return (
    <div className="min-h-dvh w-full flex flex-col items-center justify-center relative lato-onboarding">
      <div className="absolute inset-0 pointer-events-none z-0" />
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-lg px-4 py-8 mx-auto">
        <Image
          src="/loginpage.png"
          alt="Login Illustration"
          width={480}
          height={480}
          priority
          className="sm:w-64 sm:h-64 object-contain mx-auto mt-8"
        />
        <h1 className="text-3xl sm:text-5xl font-bold text-black text-center mb-4">Talk To Emotionally Intelligent</h1>
        <h2 className="text-base sm:text-lg font-medium text-black text-center tracking-widest mb-6">AI STRANGERS</h2>
        <p className="text-gray-700 text-center mb-10 text-sm sm:text-base max-w-m mx-auto leading-relaxed">
          <span className="block mb-3">Trained by Therapists and Transcripts</span>
          <span className="block mb-3">100% Unbiased and Judgement Free</span>
          <span className="block mb-3">Inspired by Actual Human Lives</span>
        </p>
        <button
          className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-sky-400 text-white font-semibold text-lg shadow-lg hover:bg-sky-500 transition-colors mb-4 border border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2"
          onClick={handleGoogleLogin}
        >
          <Image src="/google-logo.png" alt="Google logo" width={24} height={24} />
          Log in with Google
        </button>
      </div>
    </div>
  );
} 