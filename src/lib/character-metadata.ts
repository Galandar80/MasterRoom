export type CharacterMetadata = {
  archetype: string;
  origin: string;
  traits: string[];
  private_secret: string;
  bio: string;
  appearance: string;
  alignment: string;
  bond: string;
};

export function parseCharacterMetadata(rawPublicBackground: string | null | undefined): CharacterMetadata {
  const raw = rawPublicBackground?.trim() ?? "";
  try {
    if (raw.startsWith("{") && raw.endsWith("}")) {
      const parsed = JSON.parse(raw);
      return {
        archetype: parsed.archetype ?? "",
        origin: parsed.origin ?? "",
        traits: Array.isArray(parsed.traits) ? parsed.traits : [],
        private_secret: parsed.private_secret ?? "",
        bio: parsed.bio ?? "",
        appearance: parsed.appearance ?? "",
        alignment: parsed.alignment ?? "Neutrale",
        bond: parsed.bond ?? ""
      };
    }
  } catch (e) {
    // Fallback if JSON parsing fails
  }

  return {
    archetype: "",
    origin: "",
    traits: [],
    private_secret: "",
    bio: raw,
    appearance: "",
    alignment: "Neutrale",
    bond: ""
  };
}

export function stringifyCharacterMetadata(metadata: CharacterMetadata): string {
  return JSON.stringify(metadata);
}
