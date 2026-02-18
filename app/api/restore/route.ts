import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { image } = await req.json();

  // 1. Crea la richiesta all'IA
  const startRes = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: "9283608cc6b7c309b5881f72eb306d30ec241927397ad2d87a4d23d191ed8f77",
      input: { img: image, upscale: 2 },
    }),
  });

  const prediction = await startRes.json();
  const pollUrl = prediction.urls.get;

  // 2. Aspetta che l'IA finisca (Polling)
  let restoredUrl = null;
  while (!restoredUrl) {
    const checkRes = await fetch(pollUrl, {
      headers: { Authorization: `Token ${process.env.REPLICATE_API_TOKEN}` },
    });
    const result = await checkRes.json();
    if (result.status === "succeeded") {
      restoredUrl = result.output;
    } else if (result.status === "failed") {
      return NextResponse.json({ error: "AI Failed" }, { status: 500 });
    } else {
      await new Promise((r) => setTimeout(r, 2000)); // Aspetta 2 secondi e riprova
    }
  }

  return NextResponse.json({ output: restoredUrl });
}
