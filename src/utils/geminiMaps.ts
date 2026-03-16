export interface GroundedSource {
  title: string;
  uri: string;
}

export async function groundedDealerSearch(query: string, lat?: number, lng?: number) {
  const key = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (!key) throw new Error("VITE_GEMINI_API_KEY missing");
  const envModel = (import.meta as any).env?.VITE_GEMINI_MODEL;

  const body: any = {
    contents: [{ role: "user", parts: [{ text: query }]}],
    tools: [ { google_maps: {} } ],
    tool_config: {
      retrieval_config: (typeof lat === 'number' && typeof lng === 'number')
        ? { lat_lng: { latitude: lat, longitude: lng } }
        : {},
    },
  };

  const tryModels = [envModel, 'gemini-2.5-flash', 'gemini-2.5-pro'].filter(Boolean) as string[];
  let lastErr: any = null;
  for (const model of tryModels) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${key}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const t = await res.text();
        lastErr = new Error(`Gemini error for ${model}: ${res.status} ${res.statusText}: ${t}`);
        continue;
      }
      const data = await res.json();
      const parts = data.candidates?.[0]?.content?.parts || [];
      const text = parts.map((p: any) => p.text || '').join('');
      const sources: GroundedSource[] = [];
      const grounding = data.candidates?.[0]?.groundingMetadata || data.candidates?.[0]?.grounding_metadata;
      const chunks = grounding?.groundingChunks || grounding?.grounding_chunks || [];
      for (const ch of chunks) {
        const maps = ch.maps || ch.MAPS || ch.map;
        if (maps && maps.title && maps.uri) sources.push({ title: maps.title, uri: maps.uri });
      }
      return { text, sources } as { text: string; sources: GroundedSource[] };
    } catch (e: any) {
      lastErr = e;
      continue;
    }
  }
  throw lastErr || new Error('Gemini request failed');
}
