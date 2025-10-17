import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format price from centimes to CFA francs (for online courses)
export function formatPriceCFA(priceInCentimes: number): string {
  if (priceInCentimes === 0) {
    return 'Gratuit';
  }
  
  const priceInCFA = priceInCentimes / 100;
  
  // Format with spaces as thousands separator (French style)
  return `${priceInCFA.toLocaleString('fr-FR')} F`;
}

// Format price already in CFA francs (for onsite trainings)
export function formatCFA(priceInCFA: number): string {
  if (priceInCFA === 0) {
    return 'Gratuit';
  }
  
  // Format with spaces as thousands separator (French style)
  return `${priceInCFA.toLocaleString('fr-FR')} F`;
}
