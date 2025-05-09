"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../utils/supabaseClient";
import OnboardingModal from "../../components/OnboardingModal";
import DashboardSidebar from "../../components/DashboardSidebar";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
        return;
      }
      
      setUser(session.user);
      setLoading(false);
    };

    checkUser();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          router.push("/login");
        } else if (session) {
          setUser(session.user);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('hasSeenOnboarding', 'true');
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
      if (hasSeenOnboarding === 'true') {
        setShowOnboarding(false);
      }
    }
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-wave-offwhite">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wave-forest"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-wave-offwhite">
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-2xl flex flex-col items-center">
          <h1 className="text-2xl font-bold text-wave-forest mb-8">Perfect timing!</h1>
          <div className="w-48 h-48 rounded-full bg-yellow-400 mb-8 flex items-center justify-center shadow-lg"></div>
          <div className="flex flex-col gap-4 w-full max-w-md">
            <button className="bg-wave-teal text-white font-semibold py-3 rounded-lg shadow hover:bg-wave-forest transition-colors">Begin session</button>
            <div className="flex gap-2 justify-center">
              <button className="bg-gray-100 text-wave-forest px-4 py-1 rounded font-medium">Classic</button>
              <button className="bg-gray-200 text-wave-forest px-4 py-1 rounded font-medium opacity-60 cursor-not-allowed">Guided</button>
            </div>
          </div>
        </div>
      </main>
      {showOnboarding && <OnboardingModal onClose={handleCloseOnboarding} />}
    </div>
  );
} 