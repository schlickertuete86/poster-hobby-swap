import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { categories, colors, conditions, deliveryModes, levels, materials, offerKinds, sizes } from "./catalog";

const listingInput = z.object({
  title: z.string().trim().min(3).max(100),
  description: z.string().trim().min(10).max(1200),
  category: z.enum(categories),
  listingType: z.enum(["Angebot", "Gesuch"]),
  place: z.string().trim().min(2).max(100),
  postalCode: z.string().regex(/^\d{5}$/),
  condition: z.enum(conditions),
  offerKind: z.enum(offerKinds),
  delivery: z.array(z.enum(deliveryModes)).min(1),
  level: z.enum(levels),
  color: z.enum(colors),
  size: z.enum(sizes),
  materials: z.array(z.enum(materials)).min(1).max(8),
  imagePath: z.string().regex(/^[0-9a-f-]{36}\/[a-zA-Z0-9._-]+$/).max(240),
  notes: z.string().trim().max(500).optional(),
});

function publicClient() {
  const key = process.env['SUPABASE_PUBLISHABLE_KEY']!;
  return createClient<Database>(process.env['SUPABASE_URL']!, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
      headers.set("apikey", key);
      return fetch(input, { ...init, headers });
    } },
  });
}

export const getPublishedListings = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const { data, error } = await supabase.from("listings").select("id,title,description,category,listing_type,place,postal_code,condition,offer_kind,delivery,level,color,size,materials,image_url,created_at").order("created_at", { ascending: false });
  if (error) throw new Error("Inserate konnten nicht geladen werden.");
  const withImages = await Promise.all((data ?? []).map(async (item) => {
    const { data: signed } = await supabase.storage.from("listing-photos").createSignedUrl(item.image_url, 3600);
    return { ...item, image_url: signed?.signedUrl ?? "" };
  }));
  return withImages;
});

export const createListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => listingInput.parse(input))
  .handler(async ({ data, context }) => {
    if (!data.imagePath.startsWith(`${context.userId}/`)) throw new Error("Ungültiger Bildpfad.");
    await context.supabase.from("profiles").upsert({ id: context.userId }, { onConflict: "id" });
    const { data: created, error } = await context.supabase.from("listings").insert({
      user_id: context.userId,
      title: data.title,
      description: data.description,
      category: data.category,
      listing_type: data.listingType,
      place: data.place,
      postal_code: data.postalCode,
      condition: data.condition,
      offer_kind: data.offerKind,
      delivery: data.delivery,
      level: data.level,
      color: data.color,
      size: data.size,
      materials: data.materials,
      image_url: data.imagePath,
      notes: data.notes || null,
    }).select("id").single();
    if (error) throw new Error("Das Inserat konnte nicht veröffentlicht werden.");
    return created;
  });