"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Home() {

  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          router.push("/dashboard");
        } else {
          setLoading(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/dashboard",
      },
    });
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      {loading ? (<h2 className="text-white text-xl mb-6 font-semibold">Loading...</h2>) :
        <div className="bg-gray-800 p-10 rounded-2xl shadow-xl text-center flex flex-col items-center">
          <h1 className="text-white text-2xl mb-6 font-semibold">
            Smart Bookmark Manager
          </h1>
          <button
            onClick={handleLogin}
            className="flex items-center gap-3 px-6 py-3 bg-white text-black rounded-lg shadow-md hover:shadow-lg transition cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              width="20px"
              height="20px"
            >
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c10 0 19-7.3 19-20 0-1.3-.1-2.3-.4-3.5z"
              />
              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.6 16 19 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.1 29.3 4 24 4c-7.7 0-14.3 4.3-17.7 10.7z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.2 0 10-2 13.6-5.3l-6.3-5.2C29.3 36 26.8 37 24 37c-5.2 0-9.6-3.3-11.2-8l-6.6 5C9.7 39.7 16.3 44 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-1 2.7-3 5-5.7 6.5l6.3 5.2C39.9 36.6 44 30.8 44 24c0-1.3-.1-2.3-.4-3.5z"
              />
            </svg>

            <span className="font-medium">Sign in with Google</span>
          </button>
        </div>
      }

    </div>
  );
}
