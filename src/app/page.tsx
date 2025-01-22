"use client";
import Image from "next/image";
import { useState } from "react";

interface ComicPanel {
  prompt: string;
  caption: string;
  imageUrl?: string;
}

export default function Home() {
  const [panels, setPanels] = useState<ComicPanel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(
    "Tell a story about TNH, a medical student in Myanmar, and her journey to meet her boyfriend at MIT"
  );

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);
      setPanels([]);

      // First, get the story and prompts from OpenAI
      const storyResponse = await fetch("/api/generate_plot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const storyData = await storyResponse.json();
      if (!storyData.success) {
        throw new Error(storyData.error || "Failed to generate story");
      }

      // Generate images for each panel
      const panelsWithImages = await Promise.all(
        storyData.comics.map(async (panel: ComicPanel) => {
          const imageResponse = await fetch("/api/generate_imgs", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt: panel.prompt }),
          });

          const imageData = await imageResponse.json();
          return {
            ...panel,
            imageUrl: imageData.imageUrl,
          };
        })
      );

      setPanels(panelsWithImages);
    } catch (error: any) {
      console.error("Error:", error);
      setError(error.message || "Failed to generate comic");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-2xl font-bold">TNH's Medical Journey Comic Generator</h1>
        
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full max-w-[500px] h-[100px] p-4 border rounded-lg bg-transparent border-black/[.08] dark:border-white/[.145] resize-none"
          placeholder="Enter your story prompt here..."
          rows={3}
        />

        <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2">
            Story will feature TNH, a medical student in Myanmar
          </li>
          <li className="mb-2">Each panel will be generated in cute Chibi style</li>
          <li>The story follows her journey to meet her MIT boyfriend</li>
        </ol>

        <button
          className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
        >
          {loading ? "Generating Comic..." : "Generate Comic"}
        </button>

        {error && (
          <div className="text-red-500 mt-4">
            Error: {error}
          </div>
        )}

        {loading && (
          <div className="mt-4">
            Generating your comic panels...
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
          {panels.map((panel, index) => (
            <div key={index} className="flex flex-col items-center gap-4">
              <div className="relative w-[300px] h-[300px]">
                {panel.imageUrl && (
                  <Image
                    src={panel.imageUrl}
                    alt={`Panel ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                    onError={() => {
                      setError(`Failed to load image for panel ${index + 1}`);
                    }}
                  />
                )}
              </div>
              <p className="text-center text-sm italic max-w-[300px]">
                {panel.caption}
              </p>
            </div>
          ))}
        </div>
      </main>

      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <span className="text-sm text-gray-500">
          Generate a 3-panel comic about TNH's journey from Myanmar to MIT
        </span>
      </footer>
    </div>
  );
}
