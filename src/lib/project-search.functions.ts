import { createServerFn } from "@tanstack/react-start";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { z } from "zod";

const SearchInput = z.object({ query: z.string().trim().min(3).max(240) });

export const findProjectHelp = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SearchInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env['LOVABLE_API_KEY'];
    if (!key) throw new Error("Die Projekthilfe ist gerade nicht eingerichtet.");
    const { createLovableAiGatewayRunIdFetch } = await import("./ai-gateway.server");
    const gatewayFetch = createLovableAiGatewayRunIdFetch();
    const lovable = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey: key,
      headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
      fetch: gatewayFetch.fetch,
    });
    const result = streamText({
      model: lovable.responses("openai/gpt-6-astra"),
      prompt: `Du bist die kreative Projekthilfe von Hobby Hopper. Eine Person möchte dieses Projekt starten: "${data.query}".
Antworte auf Deutsch, knapp und konkret. Gib exakt diese Abschnitte aus:
IDEEN\n- drei unterschiedliche Beispiele für fertige Projekte, je eine Zeile
MATERIAL\n- vier dafür nötige Materialien, je eine Zeile
ANGEBOTE\n- drei plausible Materialangebote von Community-Mitgliedern, je eine Zeile im Format Material — Ort
ERSTER SCHRITT\n- ein einfacher Satz für den Start.
Keine Einleitung, kein Markdown außer Bindestrichen.`,
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });
    const text = await result.text;
    if (!text.trim()) throw new Error("Die Projekthilfe konnte keine Vorschläge erstellen.");
    return { text };
  });