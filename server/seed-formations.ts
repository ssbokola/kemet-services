// Script pour insérer les formations de démonstration dans la base de données
import { db } from "./db";
import { courses, courseModules, courseLessons } from "@shared/schema";
import { demoFormations } from "../client/src/data/formations";

async function seedFormations() {
  console.log("🌱 Début de l'insertion des formations de démonstration...");
  
  try {
    // Vérifier si des formations existent déjà
    const existingCourses = await db.select().from(courses);
    
    if (existingCourses.length > 0) {
      console.log(`ℹ️  ${existingCourses.length} formation(s) déjà présente(s) dans la base de données`);
      console.log("⏭️  Ajout des nouvelles formations uniquement...");
    }
    
    // Insérer chaque formation
    for (const formation of demoFormations) {
      const { modules, ...courseData } = formation;
      
      // Insérer le cours
      const [insertedCourse] = await db.insert(courses).values({
        id: courseData.id,
        title: courseData.title,
        slug: courseData.slug,
        description: courseData.description,
        category: courseData.category,
        level: courseData.level,
        duration: courseData.duration,
        price: courseData.price,
        isPublished: courseData.isPublished,
        thumbnail: courseData.thumbnail,
        objectives: courseData.objectives,
        prerequisites: courseData.prerequisites,
        targetAudience: courseData.targetAudience,
      }).returning();
      
      console.log(`✅ Formation créée: ${insertedCourse.title}`);
      
      // Insérer les modules
      for (const [moduleIndex, module] of modules.entries()) {
        const [insertedModule] = await db.insert(courseModules).values({
          courseId: insertedCourse.id,
          title: module.title,
          description: module.description,
          order: moduleIndex + 1,
          isPublished: true,
        }).returning();
        
        console.log(`  📚 Module créé: ${insertedModule.title}`);
        
        // Insérer les leçons
        for (const [lessonIndex, lesson] of module.lessons.entries()) {
          await db.insert(courseLessons).values({
            moduleId: insertedModule.id,
            title: lesson.title,
            content: `# ${lesson.title}\n\nContenu de la leçon à venir...`,
            duration: lesson.duration,
            order: lessonIndex + 1,
            isPublished: true,
            isFree: lesson.isFree || false,
          });
          
          console.log(`    📝 Leçon créée: ${lesson.title}`);
        }
      }
    }
    
    console.log("\n✨ Insertion des formations terminée avec succès!");
    console.log(`📊 Total: ${demoFormations.length} formations créées`);
    
  } catch (error) {
    console.error("❌ Erreur lors de l'insertion des formations:", error);
    throw error;
  }
}

// Exécuter le script
seedFormations()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
