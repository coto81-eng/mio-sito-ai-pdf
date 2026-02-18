"use client";
import { useState } from "react";

export default function FotoRestorer() {
  const [image, setImage] = useState<string | null>(null);
  const [restoredImage, setRestoredImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64data = reader.result as string;
      setImage(base64data);
      setLoading(true);
      setRestoredImage(null);
      setStatus("Inviando la foto all'IA...");

      // 1. Inizia il processo
      const response = await fetch("/api/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64data }),
      });
      
      const prediction = await response.json();
      const id = prediction.id;

      // 2. Controlla ogni 2 secondi se è pronto
      const checkStatus = setInterval(async () => {
        setStatus("L'IA sta lavorando... (può volerci un minuto)");
        const res = await fetch(`/api/restore?id=${id}`);
        const result = await res.json();

        if (result.status === "succeeded") {
          setRestoredImage(result.output);
          setLoading(false);
          setStatus("");
          clearInterval(checkStatus);
        } else if (result.status === "failed") {
          alert("Errore IA");
          setLoading(false);
          clearInterval(checkStatus);
        }
      }, 2000);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial, sans-serif", maxWidth: "900px", margin: "auto", textAlign: "center" }}>
      <h1 style={{ color: "#333" }}>Restauro Foto AI & HD 📸</h1>
      
      <div style={{ border: "2px dashed #ccc", padding: "20px", borderRadius: "10px", marginBottom: "20px" }}>
        <input type="file" onChange={handleUpload} accept="image/*" />
      </div>
      
      {loading && (
        <div style={{ margin: "20px", padding: "10px", background: "#e1f5fe", borderRadius: "5px" }}>
          <p style={{ color: "#0288d1", fontWeight: "bold" }}>⏳ {status}</p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {image && (
          <div>
            <h3 style={{ color: "#666" }}>Prima</h3>
            <img src={image} style={{ width: "100%", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }} />
          </div>
        )}
        {restoredImage && (
          <div>
            <h3 style={{ color: "#4CAF50" }}>Dopo (Restaurata)</h3>
            <img src={restoredImage} style={{ width: "100%", borderRadius: "10px", border: "3px solid #4CAF50", boxShadow: "0 4px 15px rgba(0,0,0,0.2)" }} />
            <br />
            <a href={restoredImage} target="_blank" download="foto_restaurata.png">
              <button style={{ marginTop: "15px", padding: "12px 25px", background: "#4CAF50", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
                ⬇️ SCARICA FOTO HD
              </button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
