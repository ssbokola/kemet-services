// Utilitaires pour la gestion des mots de passe
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

// Génère un mot de passe temporaire cryptographiquement sécurisé
export function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$%&*!';
  const length = 16;
  let password = '';
  
  // Utiliser randomBytes pour une génération sécurisée
  const randomBytesArray = randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    password += chars[randomBytesArray[i] % chars.length];
  }
  
  return password;
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