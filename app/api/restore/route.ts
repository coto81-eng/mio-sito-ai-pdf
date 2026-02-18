import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { image } = await req.json();

  // Iniziamo solo la richiesta, non aspettiamo che finisca qui
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
  // Restituiamo al browser l'ID della previsione per farlo controllare a lui
  return NextResponse.json(prediction);
}

// Nuova funzione per permettere al browser di controllare lo stato
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  const res = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
    headers: { Authorization: `Token ${process.env.REPLICATE_API_TOKEN}` },
  });
  
  const result = await res.json();
  return NextResponse.json(result);
}
