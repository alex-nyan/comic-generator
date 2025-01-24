"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";

interface HistoryEntry {
  prompt: string;
  image_url: string;
  created_at: string;
}

export default function History() {
  const [images, setImages] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      const backendUrl = `https://sundai-backend-1005351512003.us-east4.run.app/history`;
      const response = await fetch(backendUrl, {
        headers: { 'Accept': 'application/json' },
      });
      
      if (!response.ok) throw new Error(`Failed to fetch history: ${response.status}`);
      const data = await response.json();
      setImages(data || []);
    } catch (error: any) {
      console.error("Error fetching history:", error);
      setError(error.message || "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#16213e]">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-white/90 text-lg font-medium">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
              Sundai
            </span>
          </Link>
          <Link 
            href="/" 
            className="px-6 py-2 bg-gradient-to-r from-blue-400 to-purple-400 
                     text-white text-sm font-medium rounded-full
                     hover:opacity-90 transition-all duration-300 hover:scale-105"
          >
            Create New ✨
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-medium bg-gradient-to-r from-blue-400 to-purple-400 
                       text-transparent bg-clip-text">
            Your Magical Creations ✨
          </h1>
          <p className="mt-1 text-sm text-white/60">A gallery of your AI-generated masterpieces</p>
        </header>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-blue-400/20 border-t-purple-400 
                          rounded-full animate-spin"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-red-400 text-sm">✨ Oops! {error}</p>
          </div>
        )}

        {!loading && !error && images.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 
                        border border-white/10 rounded-xl bg-white/5 backdrop-blur-xl">
            <p className="text-white/60">No creations yet ✨</p>
            <Link 
              href="/" 
              className="mt-3 text-sm text-blue-400 hover:text-blue-300 hover:scale-105 
                       transition-all duration-300"
            >
              Create your first masterpiece
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((entry, index) => (
            <div
              key={index}
              className="group rounded-xl overflow-hidden bg-white/5 border border-white/10 
                       backdrop-blur-xl hover:border-white/20 transition-all duration-300 
                       hover:scale-[1.02]"
            >
              <div className="relative aspect-square">
                <Image
                  src={entry.image_url}
                  alt={entry.prompt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="p-4 space-y-2">
                <p className="text-xs text-white/40">
                  ✨ {new Date(entry.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-white/80 line-clamp-2">
                  {entry.prompt}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
} 