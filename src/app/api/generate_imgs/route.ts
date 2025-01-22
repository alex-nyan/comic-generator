import { NextResponse } from 'next/server';
import Replicate from "replicate";

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    console.log("Running the model...");
    const output = await replicate.run(
      "sundai-club/girl_generation:aa01251fbdeef86f73d85141805c40c1bcbe4c8d48ab102ba3116a5b887b6471",
      {
        input: {
          prompt: prompt,
          num_inference_steps: 4,
          model: "schnell"
        }
      }
    );

    const img_url = String(output);
    return NextResponse.json({ imageUrl: img_url });

  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
} 