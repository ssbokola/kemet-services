import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format price from centimes to CFA francs
export function formatPriceCFA(priceInCentimes: number): string {
  if (priceInCentimes === 0) {
    return 'Gratuit';
  }
  
  const priceInCFA = priceInCentimes / 100;
  
  // Format with spaces as thousands separator (French style)
  return `${priceInCFA.toLocaleString('fr-FR')} F`;
}
