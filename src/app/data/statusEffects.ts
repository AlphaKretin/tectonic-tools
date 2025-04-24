export const statusEffects = ["Burn", "Frostbite", "Numb", "Dizzy", "Leech", "Waterlog", "Jinx", "Fracture"] as const;

export type StatusEffect = (typeof statusEffects)[number] | "None";

export const volatileStatusEffects = ["Jinx", "Fracture"] as const; // others exist but are not relevant to damage calculation

export type VolatileStatusEffect = (typeof volatileStatusEffects)[number];
