import { type User, type InsertUser, type TrainingRegistration, type InsertTrainingRegistration } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
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

export const storage = new MemStorage();
