import { 
  type User, 
  type UpsertUser, 
  type TrainingRegistration, 
  type InsertTrainingRegistration,
  type Course,
  type InsertCourse,
  type Module,
  type InsertModule,
  type Lesson,
  type InsertLesson,
  type Quiz,
  type InsertQuiz,
  type QuizQuestion,
  type InsertQuizQuestion,
  type QuizResult,
  type InsertQuizResult,
  type CourseResource,
  type InsertCourseResource,
  type Order,
  type InsertOrder,
  type Enrollment,
  type InsertEnrollment,
} from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User operations - Required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
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
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  enrollUser(userId: string, courseId: string): Promise<any>;
  getUserEnrollments(userId: string): Promise<any[]>;
  getEnrollment(userId: string, courseId: string): Promise<any | undefined>;
  updateEnrollmentProgress(enrollmentId: string, progressPercent: number): Promise<void>;
  
  // Orders (Commandes/Paiements)
  createOrder(order: InsertOrder): Promise<Order>;
  getOrderById(id: string): Promise<Order | undefined>;
  updateOrder(id: string, updates: Partial<InsertOrder>): Promise<Order | undefined>;
  
  // Modules
  createModule(module: InsertModule): Promise<Module>;
  getModulesByCourseId(courseId: string): Promise<Module[]>;
  getModuleById(id: string): Promise<Module | undefined>;
  updateModule(id: string, updates: Partial<InsertModule>): Promise<Module | undefined>;
  deleteModule(id: string): Promise<boolean>;
  
  // Lessons
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  getLessonsByModuleId(moduleId: string): Promise<Lesson[]>;
  getLessonById(id: string): Promise<Lesson | undefined>;
  updateLesson(id: string, updates: Partial<InsertLesson>): Promise<Lesson | undefined>;
  deleteLesson(id: string): Promise<boolean>;
  isLessonAccessible(userId: string, lessonId: string): Promise<boolean>;
  
  // Quizzes
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  getQuizById(id: string): Promise<Quiz | undefined>;
  getQuizByLessonId(lessonId: string): Promise<Quiz | undefined>;
  getQuizByCourseId(courseId: string): Promise<Quiz | undefined>;
  updateQuiz(id: string, updates: Partial<InsertQuiz>): Promise<Quiz | undefined>;
  deleteQuiz(id: string): Promise<boolean>;
  
  // Quiz Questions
  createQuestion(question: InsertQuizQuestion): Promise<QuizQuestion>;
  getQuestionsByQuizId(quizId: string): Promise<QuizQuestion[]>;
  updateQuestion(id: string, updates: Partial<InsertQuizQuestion>): Promise<QuizQuestion | undefined>;
  deleteQuestion(id: string): Promise<boolean>;
  
  // Quiz Results
  createQuizResult(result: InsertQuizResult): Promise<QuizResult>;
  getQuizResultsByUserId(userId: string, quizId: string): Promise<QuizResult[]>;
  getBestQuizResult(userId: string, quizId: string): Promise<QuizResult | undefined>;
  getUserQuizResults(userId: string): Promise<any[]>;
  
  // Course Resources
  createResource(resource: InsertCourseResource): Promise<CourseResource>;
  getResourcesByCourseId(courseId: string): Promise<CourseResource[]>;
  deleteResource(id: string): Promise<boolean>;
  
  // Lesson Progress
  updateLessonProgress(userId: string, lessonId: string, data: Partial<any>): Promise<void>;
  getLessonProgress(userId: string, lessonId: string): Promise<any | undefined>;
}

import { db } from "./db";
import { 
  users, 
  trainingRegistrations, 
  courses, 
  enrollments,
  courseModules,
  courseLessons,
  lessonProgress,
  quizzes,
  quizQuestions,
  quizResults,
  courseResources,
  orders,
} from "@shared/schema";
import { eq, and, desc, asc } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  // User operations - Required for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserById(id: string): Promise<User | undefined> {
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
    // Retourne uniquement les formations EN LIGNE publiées (pas les formations en présentiel)
    return await db.select().from(courses).where(
      and(
        eq(courses.isPublished, true),
        eq(courses.deliveryMode, 'online')
      )
    );
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
  async createEnrollment(enrollmentData: InsertEnrollment): Promise<Enrollment> {
    const [enrollment] = await db
      .insert(enrollments)
      .values(enrollmentData)
      .returning();
    return enrollment;
  }

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

  // Modules
  async createModule(moduleData: InsertModule): Promise<Module> {
    const [module] = await db
      .insert(courseModules)
      .values(moduleData)
      .returning();
    return module;
  }

  async getModulesByCourseId(courseId: string): Promise<Module[]> {
    return await db
      .select()
      .from(courseModules)
      .where(eq(courseModules.courseId, courseId))
      .orderBy(asc(courseModules.order));
  }

  async getModuleById(id: string): Promise<Module | undefined> {
    const [module] = await db
      .select()
      .from(courseModules)
      .where(eq(courseModules.id, id));
    return module;
  }

  async updateModule(id: string, updates: Partial<InsertModule>): Promise<Module | undefined> {
    const [module] = await db
      .update(courseModules)
      .set(updates)
      .where(eq(courseModules.id, id))
      .returning();
    return module;
  }

  async deleteModule(id: string): Promise<boolean> {
    const result = await db.delete(courseModules).where(eq(courseModules.id, id)).returning();
    return result.length > 0;
  }

  // Lessons
  async createLesson(lessonData: InsertLesson): Promise<Lesson> {
    const [lesson] = await db
      .insert(courseLessons)
      .values(lessonData)
      .returning();
    return lesson;
  }

  async getLessonsByModuleId(moduleId: string): Promise<Lesson[]> {
    return await db
      .select()
      .from(courseLessons)
      .where(eq(courseLessons.moduleId, moduleId))
      .orderBy(asc(courseLessons.order));
  }

  async getLessonById(id: string): Promise<Lesson | undefined> {
    const [lesson] = await db
      .select()
      .from(courseLessons)
      .where(eq(courseLessons.id, id));
    return lesson;
  }

  async updateLesson(id: string, updates: Partial<InsertLesson>): Promise<Lesson | undefined> {
    const [lesson] = await db
      .update(courseLessons)
      .set(updates)
      .where(eq(courseLessons.id, id))
      .returning();
    return lesson;
  }

  async deleteLesson(id: string): Promise<boolean> {
    const result = await db.delete(courseLessons).where(eq(courseLessons.id, id)).returning();
    return result.length > 0;
  }

  async isLessonAccessible(userId: string, lessonId: string): Promise<boolean> {
    // Get the lesson
    const lesson = await this.getLessonById(lessonId);
    if (!lesson) return false;

    // If lesson is free, it's accessible
    if (lesson.isFree) return true;

    // Get the module to find the course
    const module = await this.getModuleById(lesson.moduleId);
    if (!module) return false;

    // Check if user is enrolled in the course
    const enrollment = await this.getEnrollment(userId, module.courseId);
    if (!enrollment || enrollment.status !== 'active') return false;

    // Get all lessons in the module ordered by order
    const lessons = await this.getLessonsByModuleId(lesson.moduleId);
    
    // Find the current lesson index
    const currentIndex = lessons.findIndex(l => l.id === lessonId);
    if (currentIndex === -1) return false;

    // If it's the first lesson, it's accessible
    if (currentIndex === 0) return true;

    // Check if previous lesson is completed
    const previousLesson = lessons[currentIndex - 1];
    const previousProgress = await this.getLessonProgress(userId, previousLesson.id);
    
    if (!previousProgress || previousProgress.status !== 'completed') return false;

    // Check if previous lesson has a quiz and if it's passed
    const previousQuiz = await this.getQuizByLessonId(previousLesson.id);
    if (previousQuiz) {
      const bestResult = await this.getBestQuizResult(userId, previousQuiz.id);
      if (!bestResult || !bestResult.passed) return false;
    }

    return true;
  }

  // Quizzes
  async createQuiz(quizData: InsertQuiz): Promise<Quiz> {
    const [quiz] = await db
      .insert(quizzes)
      .values(quizData)
      .returning();
    return quiz;
  }

  async getQuizById(id: string): Promise<Quiz | undefined> {
    const [quiz] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, id));
    return quiz;
  }

  async getQuizByLessonId(lessonId: string): Promise<Quiz | undefined> {
    const [quiz] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.lessonId, lessonId));
    return quiz;
  }

  async getQuizByCourseId(courseId: string): Promise<Quiz | undefined> {
    const [quiz] = await db
      .select()
      .from(quizzes)
      .where(and(
        eq(quizzes.courseId, courseId),
        eq(quizzes.isFinalQuiz, true)
      ));
    return quiz;
  }

  async updateQuiz(id: string, updates: Partial<InsertQuiz>): Promise<Quiz | undefined> {
    const [quiz] = await db
      .update(quizzes)
      .set(updates)
      .where(eq(quizzes.id, id))
      .returning();
    return quiz;
  }

  async deleteQuiz(id: string): Promise<boolean> {
    const result = await db.delete(quizzes).where(eq(quizzes.id, id)).returning();
    return result.length > 0;
  }

  // Quiz Questions
  async createQuestion(questionData: InsertQuizQuestion): Promise<QuizQuestion> {
    const [question] = await db
      .insert(quizQuestions)
      .values(questionData)
      .returning();
    return question;
  }

  async getQuestionsByQuizId(quizId: string): Promise<QuizQuestion[]> {
    return await db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.quizId, quizId))
      .orderBy(asc(quizQuestions.order));
  }

  async updateQuestion(id: string, updates: Partial<InsertQuizQuestion>): Promise<QuizQuestion | undefined> {
    const [question] = await db
      .update(quizQuestions)
      .set(updates)
      .where(eq(quizQuestions.id, id))
      .returning();
    return question;
  }

  async deleteQuestion(id: string): Promise<boolean> {
    const result = await db.delete(quizQuestions).where(eq(quizQuestions.id, id)).returning();
    return result.length > 0;
  }

  // Quiz Results
  async createQuizResult(resultData: InsertQuizResult): Promise<QuizResult> {
    const [result] = await db
      .insert(quizResults)
      .values(resultData)
      .returning();
    return result;
  }

  async getQuizResultsByUserId(userId: string, quizId: string): Promise<QuizResult[]> {
    return await db
      .select()
      .from(quizResults)
      .where(and(
        eq(quizResults.userId, userId),
        eq(quizResults.quizId, quizId)
      ))
      .orderBy(desc(quizResults.completedAt));
  }

  async getBestQuizResult(userId: string, quizId: string): Promise<QuizResult | undefined> {
    const [result] = await db
      .select()
      .from(quizResults)
      .where(and(
        eq(quizResults.userId, userId),
        eq(quizResults.quizId, quizId)
      ))
      .orderBy(desc(quizResults.score))
      .limit(1);
    return result;
  }

  async getUserQuizResults(userId: string): Promise<any[]> {
    // Get all quiz results for a user with quiz and course info
    const results = await db
      .select({
        result: quizResults,
        quiz: quizzes,
        lesson: courseLessons,
        module: courseModules,
      })
      .from(quizResults)
      .innerJoin(quizzes, eq(quizResults.quizId, quizzes.id))
      .leftJoin(courseLessons, eq(quizzes.lessonId, courseLessons.id))
      .leftJoin(courseModules, eq(courseLessons.moduleId, courseModules.id))
      .where(eq(quizResults.userId, userId))
      .orderBy(desc(quizResults.completedAt));
    
    return results;
  }

  // Course Resources
  async createResource(resourceData: InsertCourseResource): Promise<CourseResource> {
    const [resource] = await db
      .insert(courseResources)
      .values(resourceData)
      .returning();
    return resource;
  }

  async getResourcesByCourseId(courseId: string): Promise<CourseResource[]> {
    return await db
      .select()
      .from(courseResources)
      .where(eq(courseResources.courseId, courseId))
      .orderBy(asc(courseResources.order));
  }

  async deleteResource(id: string): Promise<boolean> {
    const result = await db.delete(courseResources).where(eq(courseResources.id, id)).returning();
    return result.length > 0;
  }

  // Lesson Progress
  async updateLessonProgress(userId: string, lessonId: string, data: Partial<any>): Promise<void> {
    // Check if progress exists
    const [existing] = await db
      .select()
      .from(lessonProgress)
      .where(and(
        eq(lessonProgress.userId, userId),
        eq(lessonProgress.lessonId, lessonId)
      ));

    if (existing) {
      // Update existing progress
      await db
        .update(lessonProgress)
        .set({
          ...data,
          lastAccessedAt: new Date(),
        })
        .where(and(
          eq(lessonProgress.userId, userId),
          eq(lessonProgress.lessonId, lessonId)
        ));
    } else {
      // Create new progress
      await db
        .insert(lessonProgress)
        .values({
          userId,
          lessonId,
          ...data,
          status: data.status || 'in_progress',
          timeSpent: data.timeSpent || 0,
          lastAccessedAt: new Date(),
        });
    }
  }

  async getLessonProgress(userId: string, lessonId: string): Promise<any | undefined> {
    const [progress] = await db
      .select()
      .from(lessonProgress)
      .where(and(
        eq(lessonProgress.userId, userId),
        eq(lessonProgress.lessonId, lessonId)
      ));
    return progress;
  }

  // Orders (Commandes/Paiements)
  async createOrder(orderData: InsertOrder): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values(orderData)
      .returning();
    return order;
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id));
    return order;
  }

  async updateOrder(id: string, updates: Partial<InsertOrder>): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }
}

export const storage = new DatabaseStorage();
