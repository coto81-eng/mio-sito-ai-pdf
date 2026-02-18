"use client";
import { useState } from "react";

export default function FotoRestorer() {
  const [image, setImage] = useState<string | null>(null);
  const [restoredImage, setRestoredImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64data = reader.result as string;
      setImage(base64data);
      setLoading(true);
      setRestoredImage(null);

      const response = await fetch("/api/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64data }),
      });
      
      const data = await response.json();
      if (data.output) {
        setRestoredImage(data.output);
      } else {
        alert("Errore durante il restauro. Riprova.");
      }
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial, sans-serif", maxWidth: "800px", margin: "auto", textAlign: "center" }}>
      <h1 style={{ color: "#333" }}>Restauro Foto AI & HD 📸</h1>
      <p style={{ color: "#666" }}>Carica una foto rovinata o in bianco e nero per migliorarla</p>
      
      <div style={{ border: "2px dashed #ccc", padding: "20px", borderRadius: "10px", marginBottom: "20px" }}>
        <input type="file" onChange={handleUpload} accept="image/*" />
      </div>
      
      {loading && <div style={{ fontSize: "18px", fontWeight: "bold", color: "#007bff" }}>⏳ L'IA sta lavorando... attendi circa 20 secondi.</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" }}>
        {image && (
          <div>
            <h3>Originale</h3>
            <img src={image} style={{ width: "100%", borderRadius: "10px" }} />
          </div>
        )}
        {restoredImage && (
          <div>
            <h3>Restaurata HD</h3>
            <img src={restoredImage} style={{ width: "100%", borderRadius: "10px", border: "3px solid #4CAF50" }} />
            <a href={restoredImage} download="restored.png" target="_blank">
              <button style={{ marginTop: "10px", padding: "10px 20px", background: "#4CAF50", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                Scarica Foto HD
              </button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
