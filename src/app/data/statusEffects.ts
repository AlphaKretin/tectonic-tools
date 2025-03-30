export const statusEffects = ["Burn", "Frostbite", "Numb", "Dizzy", "Leech", "Waterlog", "Jinx", "Fracture"] as const;

export type StatusEffect = (typeof statusEffects)[number] | "None";
