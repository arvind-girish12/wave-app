"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../utils/supabaseClient";
import { shouldBypassAuthClient } from '../utils/environment';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      if (shouldBypassAuthClient()) {
        router.push("/dashboard");
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // User is signed in, redirect to dashboard
        router.push("/dashboard");
      } else {
        // No user, redirect to login
        router.push("/login");
      }
    };

    checkUser();
  }, [router]);

  // This will briefly show while checking authentication and redirecting
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-sky-bg">
      <div className="bg-sky-overlay" />
      <div className="relative z-20 w-full flex flex-col items-center justify-center">
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-[#6B4EFF] shadow-lg"></div>
        </div>
      </div>
    </div>
  );
} 