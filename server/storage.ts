import { type User, type UpsertUser, type TrainingRegistration, type InsertTrainingRegistration } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User operations - Required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Training registrations methods
  createTrainingRegistration(registration: InsertTrainingRegistration): Promise<TrainingRegistration>;
  getTrainingRegistrations(): Promise<TrainingRegistration[]>;
  getTrainingRegistrationById(id: string): Promise<TrainingRegistration | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private trainingRegistrations: Map<string, TrainingRegistration>;

  constructor() {
    this.users = new Map();
    this.trainingRegistrations = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id!);
    const now = new Date();
    
    if (existingUser) {
      // Update existing user
      const updatedUser: User = {
        ...existingUser,
        ...userData,
        updatedAt: now,
      };
      this.users.set(userData.id!, updatedUser);
      return updatedUser;
    } else {
      // Create new user
      const id = userData.id || randomUUID();
      const user: User = {
        id,
        // Legacy fields for compatibility
        username: null,
        password: null,
        // Replit Auth fields
        email: userData.email || null,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        profileImageUrl: userData.profileImageUrl || null,
        role: userData.role || 'participant',
        createdAt: now,
        updatedAt: now,
      };
      this.users.set(id, user);
      return user;
    }
  }

  // Training registrations methods
  async createTrainingRegistration(insertRegistration: InsertTrainingRegistration): Promise<TrainingRegistration> {
    const id = randomUUID();
    const createdAt = new Date();
    const registration: TrainingRegistration = { 
      ...insertRegistration,
      id,
      createdAt,
      // Handle optional fields - convert undefined to null for database compatibility
      preferredDate: insertRegistration.preferredDate ?? null,
      message: insertRegistration.message ?? null,
      marketingConsent: insertRegistration.marketingConsent ?? false
    };
    this.trainingRegistrations.set(id, registration);
    return registration;
  }

  async getTrainingRegistrations(): Promise<TrainingRegistration[]> {
    return Array.from(this.trainingRegistrations.values());
  }

  async getTrainingRegistrationById(id: string): Promise<TrainingRegistration | undefined> {
    return this.trainingRegistrations.get(id);
  }
}

// Ensure storage persists across hot-reloads in development
const globalForStorage = globalThis as any;
globalForStorage.__memStorage ||= new MemStorage();
export const storage = globalForStorage.__memStorage;
