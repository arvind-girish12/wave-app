"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const character = searchParams.get('character');
    
    if (character) {
      // Redirect to dashboard with character parameter
      router.push(`/dashboard?character=${character}`);
    } else {
      // Redirect to dashboard without character parameter
      router.push('/dashboard');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );
} 