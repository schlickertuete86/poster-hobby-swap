import { createServerFn } from "@tanstack/react-start";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, Output } from "ai";
import { z } from "zod";
import { listings, communityProjects } from "./catalog";

const SearchInput = z.object({ query: z.string().trim().min(3).max(240) });

const ResultSchema = z.object({
  ideen: z.array(z.string()).max(3),
  material: z.array(z.string()).max(5),
  ersterSchritt: z.string(),
  listingTitles: z.array(z.string()).max(4),
  projectTitles: z.array(z.string()).max(4),
});

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

    const listingCatalog = listings
      .map((item) => `- ${item.title} | ${item.type} | ${item.category} | Material: ${item.materials.join(", ")} | Zustand: ${item.condition} | ${item.offerKind} | ${item.place} (${item.postalCode}) | ${item.delivery.join("/")} | Level: ${item.level} | ${item.description}`)
      .join("\n");
    const projectCatalog = communityProjects
      .map((project) => `- ${project.title} | ${project.tag} | von ${project.maker} | Material: ${project.materials}`)
      .join("\n");

    const result = streamText({
      model: lovable.responses("openai/gpt-6-astra"),
      output: Output.object({ schema: ResultSchema }),
      prompt: `Du bist der Projektfinder von Hobby Hopper. Eine Person möchte dieses Projekt starten: "${data.query}".

Aktuelle Materialinserate auf der Plattform:
${listingCatalog}

Fertige Community-Projekte aus der Inspiration:
${projectCatalog}

Antworte auf Deutsch, knapp und konkret.
- "ideen": drei unterschiedliche Projektvarianten, je ein kurzer Satz.
- "material": vier bis fünf nötige Materialien, je ein Stichwort.
- "ersterSchritt": ein einfacher Satz für den Start.
- "listingTitles": Titel der passenden Inserate aus der Liste oben, exakt übernommen, nur wirklich passende, sonst leer.
- "projectTitles": Titel der passenden Community-Projekte aus der Liste oben, exakt übernommen, nur wirklich passende, sonst leer.
Erfinde keine Titel, die nicht in den Listen stehen.`,
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

    const output = await result.output;
    const known = new Set(listings.map((item) => item.title));
    const knownProjects = new Set(communityProjects.map((project) => project.title));
    return {
      ...output,
      listingTitles: output.listingTitles.filter((title) => known.has(title)),
      projectTitles: output.projectTitles.filter((title) => knownProjects.has(title)),
    };
  });
