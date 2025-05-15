"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../utils/supabaseClient";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
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
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-purple-100 via-purple-200 to-purple-300">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  );
} 