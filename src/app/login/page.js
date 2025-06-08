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
      const redirectUrl =
        typeof window !== "undefined" ? window.location.origin : "";
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: redirectUrl },
      });
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  if (shouldBypassAuthClient()) {
    return null;
  }

  return (
    <div className="h-screen w-full flex flex-col items-center relative lato-onboarding">
      {/* overlay */}
      <div className="absolute inset-0 pointer-events-none" />

      {/* content container */}
      <div className="relative z-10 w-full max-w-md px-4 mx-auto flex flex-col h-full">
        {/* top padding */}
        <div className="pt-8" />

        {/* Logo */}
        <div className="flex justify-start mb-4">
          <Image src="/logo.png" alt="wave logo" width={80} height={24} />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl mt-6 px-6 pt-6 pb-10 space-y-12 md:space-y-8 relative overflow-visible">
          {/* top-right avatars */}
          <div className="absolute -top-6 right-4 flex space-x-2 items-center">
            {["/avatar1.jpeg", "/avatar2.jpeg", "/avatar3.jpeg"].map((src, idx) => (
              <div key={idx} className="relative w-12 h-12 rounded-full overflow-hidden">
                <Image
                  src={src}
                  alt={`Avatar ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          {/* Feature wrapper */}
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-3 flex flex-col items-end space-y-6">
            {/* First box */}
            <div className="flex bg-white rounded-xl p-2 w-[72%]">
              <div className="relative w-8 h-8 mr-2">
                <Image
                  src="/illone.jpeg"
                  alt="Feature 1"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-medium text-gray-800">
                    Rant. Release. Refresh.
                  </span>
                  <span className="text-[8px] text-green-600">
                    Judgement Free
                  </span>
                </div>
                <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-full" />
                </div>
                <div className="text-[8px] text-gray-600">
                  12.6 MB of 12.6 MB
                </div>
                <div className="flex space-x-2">
                  <div className="text-[10px] text-gray-600">Change</div>
                  <div className="text-[10px] text-red-500">Remove</div>
                </div>
              </div>
            </div>

            {/* Second box */}
            <div className="flex items-center bg-white rounded-xl px-2 py-1 w-[84%]">
              <div className="relative w-8 h-8 mr-2">
                <Image
                  src="/illtwo.jpeg"
                  alt="Feature 2"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="border-r border-gray-300 h-4 mr-2" />
              <span className="text-[10px] text-gray-800">
                Talk From Anywhere, Anytime With All Over The World
              </span>
            </div>

            {/* Third box */}
            <div className="flex items-center bg-white rounded-xl px-2 py-1 w-[96%]">
              <div className="relative w-8 h-8 mr-2">
                <Image
                  src="/illthree.jpeg"
                  alt="Feature 3"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="border-r border-gray-300 h-4 mr-2" />
              <span className="text-[10px] text-gray-800">
                Find Someone For Every Emotion. No Social Energy Required
              </span>
            </div>
          </div>

          {/* “We care” section */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-base font-bold text-black">
                We deeply care about you
              </h3>
              <p className="text-sm text-gray-600 mt-1">and your data.</p>
            </div>
            <Image
              src="/illdata.jpeg"
              alt="Data illustration"
              width={128}
              height={128}
              className="rounded-lg"
            />
          </div>

          {/* bottom-left avatars */}
          <div className="absolute -bottom-6 left-4 flex space-x-2 items-center">
            {["/avatar4.jpeg", "/avatar5.jpeg", "/avatar6.jpeg"].map((src, idx) => (
              <div key={idx} className="relative w-12 h-12 rounded-full overflow-hidden">
                <Image
                  src={src}
                  alt={`Avatar ${idx + 4}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* spacer */}
        <div className="flex-grow" />

        {/* CTA */}
        <button
          onClick={handleGoogleLogin}
          className="mb-24 md:mb-0 w-full py-4 cta-color text-white text-base font-bold rounded-xl shadow-lg hover:bg-sky-600 transition focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2"
        >
          Talk to your AI friend, now
        </button>
      </div>
    </div>
  );
}
