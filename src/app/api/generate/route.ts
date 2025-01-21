import { NextResponse } from 'next/server';
import Replicate from "replicate";

const replicate = new Replicate({
   auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: Request) {
  try {
    // Get the prompt from the request body
    const { prompt } = await req.json();
    
    // This is how you make the API call to Replicate
    const output = await replicate.run(
      // This is the model ID for SDXL
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          prompt: prompt
        }
      }
    );

    // Return the result
    return NextResponse.json({ images: output });
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
