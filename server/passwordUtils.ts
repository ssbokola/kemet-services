// Utilitaires pour la gestion des mots de passe
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

// Génère un mot de passe temporaire sécurisé
export function generateTemporaryPassword(): string {
  const adjectives = ['Fort', 'Rapid', 'Sage', 'Noble', 'Vif', 'Clair', 'Brave', 'Douce'];
  const nouns = ['Pharma', 'Expert', 'Medic', 'Sante', 'Care', 'Plus', 'Pro', 'Elite'];
  const numbers = Math.floor(Math.random() * 999) + 100;
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  
  return `${adjective}${noun}${numbers}!`;
}

// Hash un mot de passe avec bcrypt
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// Vérifie un mot de passe contre son hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Génère un token de réinitialisation sécurisé
export function generateResetToken(): string {
  return randomBytes(32).toString('hex');
}