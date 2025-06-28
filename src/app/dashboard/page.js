"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import CharacterReveal from '../../components/CharacterReveal';
import OnboardingModal from '../../components/OnboardingModal';

const SHOW_ONBOARDING_KEY = 'showOnboardingKey2';

export default function Dashboard() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasKey = localStorage.getItem(SHOW_ONBOARDING_KEY);
      setShowOnboarding(!hasKey);
    }
  }, []);

  const handleCloseOnboarding = () => {
    localStorage.setItem(SHOW_ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  };

  return (
    <>
      {showOnboarding && <OnboardingModal onClose={handleCloseOnboarding} />}
      <main className="flex-1 w-full h-full h-dvh">
        <CharacterReveal />
      </main>
    </>
  );
} 