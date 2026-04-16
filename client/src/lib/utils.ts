import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format price in CFA francs (for online courses).
//
// Historiquement cette fonction divisait par 100 car le champ `price` était
// censé être en centimes. Dans les faits, la DB stocke `courses.price` en FCFA
// unitaires (voir shared/schema.ts). Le nom du paramètre reste `priceInCentimes`
// pour compat, mais la valeur est traitée comme FCFA direct.
export function formatPriceCFA(priceInCentimes: number | null | undefined): string {
  const price = priceInCentimes ?? 0;
  if (price === 0) {
    return 'Gratuit';
  }

  // Format with spaces as thousands separator (French style)
  return `${price.toLocaleString('fr-FR')} F`;
}

// Format price already in CFA francs (for onsite trainings)
export function formatCFA(priceInCFA: number): string {
  if (priceInCFA === 0) {
    return 'Gratuit';
  }
  
  // Format with spaces as thousands separator (French style)
  return `${priceInCFA.toLocaleString('fr-FR')} F`;
}
