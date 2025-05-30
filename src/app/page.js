"use client";

import CharacterMatch from '../components/CharacterMatch';
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/dashboard');
} 