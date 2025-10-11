import { 
  type User, 
  type UpsertUser, 
  type TrainingRegistration, 
  type InsertTrainingRegistration,
  type Course,
  type InsertCourse,
} from "@shared/schema";
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
  
  // Courses (Formations en ligne)
  getCourses(): Promise<Course[]>;
  getPublishedCourses(): Promise<Course[]>;
  getCourseById(id: string): Promise<Course | undefined>;
  getCourseBySlug(slug: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, updates: Partial<InsertCourse>): Promise<Course | undefined>;
  deleteCourse(id: string): Promise<boolean>;
  
  // Enrollments (Inscriptions)
  enrollUser(userId: string, courseId: string): Promise<any>;
  getUserEnrollments(userId: string): Promise<any[]>;
  getEnrollment(userId: string, courseId: string): Promise<any | undefined>;
  updateEnrollmentProgress(enrollmentId: string, progressPercent: number): Promise<void>;
}

import { db } from "./db";
import { users, trainingRegistrations, courses, enrollments } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  // User operations - Required for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Chercher d'abord un utilisateur existant par email
    let existingUser: User | null = null;
    
    if (userData.email) {
      const results = await db.select().from(users).where(eq(users.email, userData.email as string)).limit(1);
      existingUser = results[0] || null;
    }
    
    // Si pas trouvé par email et qu'on a un ID, chercher par ID
    if (!existingUser && userData.id) {
      const results = await db.select().from(users).where(eq(users.id, userData.id as string)).limit(1);
      existingUser = results[0] || null;
    }
    
    if (existingUser) {
      // Mettre à jour l'utilisateur existant
      const [updatedUser] = await db
        .update(users)
        .set({
          ...userData,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingUser.id))
        .returning();
      return updatedUser;
    } else {
      // Créer un nouvel utilisateur
      const [newUser] = await db
        .insert(users)
        .values(userData)
        .returning();
      return newUser;
    }
  }

  // Training registrations methods
  async createTrainingRegistration(insertRegistration: InsertTrainingRegistration): Promise<TrainingRegistration> {
    const [registration] = await db
      .insert(trainingRegistrations)
      .values(insertRegistration)
      .returning();
    return registration;
  }

  async getTrainingRegistrations(): Promise<TrainingRegistration[]> {
    return await db.select().from(trainingRegistrations);
  }

  async getTrainingRegistrationById(id: string): Promise<TrainingRegistration | undefined> {
    const [registration] = await db
      .select()
      .from(trainingRegistrations)
      .where(eq(trainingRegistrations.id, id));
    return registration;
  }

  // Courses (Formations en ligne)
  async getCourses(): Promise<Course[]> {
    return await db.select().from(courses);
  }

  async getPublishedCourses(): Promise<Course[]> {
    return await db.select().from(courses).where(eq(courses.isPublished, true));
  }

  async getCourseById(id: string): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async getCourseBySlug(slug: string): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.slug, slug));
    return course;
  }

  async createCourse(courseData: InsertCourse): Promise<Course> {
    const [course] = await db
      .insert(courses)
      .values(courseData)
      .returning();
    return course;
  }

  async updateCourse(id: string, updates: Partial<InsertCourse>): Promise<Course | undefined> {
    const [course] = await db
      .update(courses)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return course;
  }

  async deleteCourse(id: string): Promise<boolean> {
    const result = await db.delete(courses).where(eq(courses.id, id)).returning();
    return result.length > 0;
  }

  // Enrollments (Inscriptions)
  async enrollUser(userId: string, courseId: string): Promise<any> {
    const [enrollment] = await db
      .insert(enrollments)
      .values({
        userId,
        courseId,
        status: 'active',
        progressPercent: 0,
      })
      .returning();
    return enrollment;
  }

  async getUserEnrollments(userId: string): Promise<any[]> {
    return await db
      .select({
        enrollment: enrollments,
        course: courses,
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(enrollments.userId, userId));
  }

  async getEnrollment(userId: string, courseId: string): Promise<any | undefined> {
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(and(
        eq(enrollments.userId, userId),
        eq(enrollments.courseId, courseId)
      ));
    return enrollment;
  }

  async updateEnrollmentProgress(enrollmentId: string, progressPercent: number): Promise<void> {
    await db
      .update(enrollments)
      .set({ 
        progressPercent,
        completedAt: progressPercent >= 100 ? new Date() : null,
      })
      .where(eq(enrollments.id, enrollmentId));
  }
}

export const storage = new DatabaseStorage();
