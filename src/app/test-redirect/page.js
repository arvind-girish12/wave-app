"use client";

import { useEffect, useState } from "react";

export default function TestRedirect() {
  const [origin, setOrigin] = useState("");
  const [possibleRedirects, setPossibleRedirects] = useState([]);

  useEffect(() => {
    // Only run in browser
    if (typeof window !== "undefined") {
      const currentOrigin = window.location.origin;
      setOrigin(currentOrigin);
      
      // Generate possible redirect URIs that might be needed
      setPossibleRedirects([
        `${currentOrigin}`,
        `${currentOrigin}/auth/callback`,
        `${currentOrigin}/api/auth/callback`,
        `${currentOrigin}/auth/v1/callback`,
        "https://ivtyyhdcxmbrqahwwkve.supabase.co/auth/v1/callback"
      ]);
    }
  }, []);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Google OAuth Redirect URI Tester</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Your Site Origin</h2>
        <code className="block bg-gray-100 p-3 rounded">{origin}</code>
        <p className="mt-2 text-sm text-gray-600">This is your site's base URL that Google needs to know about.</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Possible Redirect URIs</h2>
        <p className="mb-3 text-sm text-gray-600">
          Add ALL of these URLs to your Google Cloud Console &gt; OAuth 2.0 Client IDs &gt; 
          Authorized redirect URIs to cover all possible configurations:
        </p>
        <ul className="space-y-2">
          {possibleRedirects.map((uri, i) => (
            <li key={i} className="bg-gray-100 p-3 rounded flex justify-between items-center">
              <code>{uri}</code>
              <button 
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                onClick={() => {
                  navigator.clipboard.writeText(uri);
                  alert("Copied to clipboard!");
                }}
              >
                Copy
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h3 className="font-semibold text-yellow-800">Important:</h3>
        <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
          <li>After adding these URIs to Google Cloud Console, you may need to wait a few minutes for changes to propagate.</li>
          <li>Make sure your Supabase project's Authentication settings are also configured with the correct site URL.</li>
          <li>Your Supabase anon key must be correctly set in the supabaseClient.js file.</li>
        </ul>
      </div>
    </div>
  );
} 