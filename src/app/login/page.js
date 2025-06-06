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
    <div className="min-h-dvh w-full flex flex-col items-center justify-center relative lato-onboarding bg-sky-bg">
      <div className="absolute inset-0 pointer-events-none z-0 bg-sky-overlay" />
      <div className="relative z-10 flex flex-col items-center justify-center w-full px-4 py-8 mx-auto">
        <h1 className="text-4xl sm:text-6xl font-extrabold text-black text-center mb-3 w-full">Welcome to Wave</h1>
        <h2 className="text-lg sm:text-2xl font-medium text-gray-800 text-center mb-6 w-full">A place where you can feel <span className="font-bold text-indigo-600">heard</span> and <span className="font-bold text-indigo-600">understood</span></h2>
        {/* Image + Description Section */}
        <Image
          src="/loginpage.png"
          alt="Calm, emotionally soft illustration"
          width={360}
          height={360}
          priority
          className="w-48 h-48 sm:w-64 sm:h-64 object-contain mx-auto mb-8"
        />
        <ul className="text-gray-700 text-center text-base sm:text-lg space-y-3 mb-16 w-full">
          <li>• Built with <span className="font-bold text-indigo-700">care</span> by therapists & real-life stories</li>
          <li>• <span className="font-bold text-indigo-700">Available 24/7</span> when it's too hard to talk to anyone else</li>
          <li>• No <span className="font-bold text-indigo-700">judgement</span>. Just <span className="font-bold text-indigo-700">presence</span>.</li>
        </ul>
        {/* Testimonial */}
        <div className="italic text-center text-gray-600 text-base sm:text-lg mb-8 flex flex-col items-center w-full">
          <span> "This helped me feel less alone at 2AM." </span>
          <span className="mt-2 text-sm not-italic text-gray-500">— A real user</span>
        </div>
        <button
          className="w-full max-w-xs mx-auto py-4 rounded-xl bg-sky-500 text-white font-bold text-lg shadow-lg hover:bg-sky-600 transition-all focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 mb-2"
          tabIndex={0}
          onClick={handleGoogleLogin}
        >
          Start Talking for Free
        </button>
      </div>
    </div>
  );
} 