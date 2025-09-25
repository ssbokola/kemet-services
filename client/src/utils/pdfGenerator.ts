import jsPDF from 'jspdf';
import { formations, mainCategories, pharmacienSubCategories } from '@shared/formations';
import logoImage from '@assets/LOGO KEMET CANVAS_1757585789355.png';

export const generateCatalogPDF = () => {
  const pdf = new jsPDF();
  
  // Configuration des couleurs (en RGB)
  const primaryColor: [number, number, number] = [0, 128, 128]; // Teal
  const textColor: [number, number, number] = [51, 51, 51];     // Dark gray
  
  let yPos = 20;
  const pageHeight = pdf.internal.pageSize.height;
  const pageWidth = pdf.internal.pageSize.width;
  const margin = 20;
  const footerSpace = 35; // Space reserved for footer
  const effectiveHeight = pageHeight - margin - footerSpace;
  
  // Function to check if we need a new page
  const checkPageBreak = (neededSpace = 20) => {
    if (yPos + neededSpace > effectiveHeight) {
      pdf.addPage();
      yPos = 20;
      return true;
    }
    return false;
  };
  
  // Add Kemet Services logo
  try {
    // Calculate logo dimensions (proportional scaling)
    const logoWidth = 30;
    const logoHeight = 20; // Approximation for the logo ratio
    
    // Position logo at top-right of the page
    pdf.addImage(logoImage, 'PNG', pageWidth - margin - logoWidth, yPos, logoWidth, logoHeight);
    
    // Add some space below the logo
    yPos += 5;
  } catch (error) {
    console.log('Logo could not be added to PDF:', error);
  }
  
  // Header with title and branding
  pdf.setFontSize(24);
  pdf.setTextColor(...primaryColor);
  pdf.text('CATALOGUE DES FORMATIONS', margin, yPos);
  
  yPos += 15;
  pdf.setFontSize(16);
  pdf.setTextColor(...textColor);
  pdf.text('Kemet Services - Formation et Consultance Pharmacie', margin, yPos);
  
  yPos += 10;
  pdf.setFontSize(12);
  pdf.text('Spécialisé pour les pharmacies de Côte d\'Ivoire', margin, yPos);
  
  // Add a line separator
  yPos += 15;
  pdf.setDrawColor(...primaryColor);
  pdf.setLineWidth(0.5);
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 15;
  
  // Introduction text
  pdf.setFontSize(11);
  pdf.setTextColor(...textColor);
  const introText = [
    'Découvrez notre catalogue complet de formations professionnelles spécialement',
    'conçues pour les pharmaciens et le personnel d\'officine en Côte d\'Ivoire.',
    'Nos formations allient expertise technique et pratique terrain pour vous accompagner',
    'dans l\'optimisation de votre pharmacie.'
  ];
  
  introText.forEach(line => {
    pdf.text(line, margin, yPos);
    yPos += 6;
  });
  
  yPos += 10;
  
  // Group formations by target audience and category
  const pharmacienFormations = formations.filter(f => f.targetAudience === 'pharmaciens');
  const auxiliaireFormations = formations.filter(f => f.targetAudience === 'auxiliaires');
  
  // Formations pour pharmaciens
  checkPageBreak(30);
  pdf.setFontSize(18);
  pdf.setTextColor(...primaryColor);
  pdf.text('FORMATIONS POUR PHARMACIENS', margin, yPos);
  yPos += 15;
  
  // Group by category
  const pharmacienByCategory = pharmacienSubCategories.reduce((acc, cat) => {
    acc[cat.id] = pharmacienFormations.filter(f => f.category === cat.id);
    return acc;
  }, {} as Record<string, typeof formations>);
  
  // Display each category
  for (const subCat of pharmacienSubCategories) {
    const categoryFormations = pharmacienByCategory[subCat.id];
    if (categoryFormations.length === 0) continue;
    
    checkPageBreak(25);
    
    // Category title
    pdf.setFontSize(14);
    pdf.setTextColor(...primaryColor);
    pdf.text(`${subCat.name.toUpperCase()} (${categoryFormations.length} formation${categoryFormations.length > 1 ? 's' : ''})`, margin, yPos);
    yPos += 10;
    
    // Category formations
    categoryFormations.forEach((formation, index) => {
      checkPageBreak(35);
      
      // Formation title
      pdf.setFontSize(12);
      pdf.setTextColor(...textColor);
      pdf.text(`${index + 1}. ${formation.title}`, margin + 5, yPos);
      yPos += 7;
      
      // Formation details
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100); // Lighter gray
      
      // Description (wrap text if needed)
      const descLines = pdf.splitTextToSize(formation.description, pageWidth - 2 * margin - 10);
      descLines.forEach((line: string) => {
        pdf.text(line, margin + 10, yPos);
        yPos += 5;
      });
      
      yPos += 2;
      
      // Details row
      pdf.text(`Durée: ${formation.duration}`, margin + 10, yPos);
      pdf.text(`Prix: ${formation.price}`, margin + 80, yPos);
      pdf.text(`Format: ${formation.format}`, margin + 140, yPos);
      yPos += 7;
      
      // Objectives
      if (formation.objectives.length > 0) {
        pdf.text('Objectifs principaux:', margin + 10, yPos);
        yPos += 5;
        
        formation.objectives.slice(0, 3).forEach(obj => {
          checkPageBreak(8);
          const objLines = pdf.splitTextToSize(`• ${obj}`, pageWidth - 2 * margin - 20);
          objLines.forEach((line: string) => {
            pdf.text(line, margin + 15, yPos);
            yPos += 5;
          });
        });
      }
      
      yPos += 8; // Space between formations
    });
    
    yPos += 5; // Space between categories
  }
  
  // Formations pour auxiliaires
  if (auxiliaireFormations.length > 0) {
    checkPageBreak(30);
    pdf.setFontSize(18);
    pdf.setTextColor(...primaryColor);
    pdf.text('FORMATIONS POUR AUXILIAIRES', margin, yPos);
    yPos += 15;
    
    auxiliaireFormations.forEach((formation, index) => {
      checkPageBreak(35);
      
      // Formation title
      pdf.setFontSize(12);
      pdf.setTextColor(...textColor);
      pdf.text(`${index + 1}. ${formation.title}`, margin + 5, yPos);
      yPos += 7;
      
      // Formation details
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      
      const descLines = pdf.splitTextToSize(formation.description, pageWidth - 2 * margin - 10);
      descLines.forEach((line: string) => {
        pdf.text(line, margin + 10, yPos);
        yPos += 5;
      });
      
      yPos += 2;
      
      // Details row
      pdf.text(`Durée: ${formation.duration}`, margin + 10, yPos);
      pdf.text(`Prix: ${formation.price}`, margin + 80, yPos);
      pdf.text(`Format: ${formation.format}`, margin + 140, yPos);
      yPos += 7;
      
      // Objectives
      if (formation.objectives.length > 0) {
        pdf.text('Objectifs principaux:', margin + 10, yPos);
        yPos += 5;
        
        formation.objectives.slice(0, 3).forEach(obj => {
          checkPageBreak(8);
          const objLines = pdf.splitTextToSize(`• ${obj}`, pageWidth - 2 * margin - 20);
          objLines.forEach((line: string) => {
            pdf.text(line, margin + 15, yPos);
            yPos += 5;
          });
        });
      }
      
      yPos += 8;
    });
  }
  
  // Footer with contact info
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    
    // Footer line
    pdf.setDrawColor(...primaryColor);
    pdf.setLineWidth(0.5);
    pdf.line(margin, pageHeight - 30, pageWidth - margin, pageHeight - 30);
    
    // Footer text
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Kemet Services - Formation et Consultance Pharmacie', margin, pageHeight - 20);
    pdf.text('Email: infos@kemetservices.com | Spécialisé pour les pharmacies de Côte d\'Ivoire', margin, pageHeight - 15);
    
    // Page number
    pdf.text(`Page ${i} / ${totalPages}`, pageWidth - margin - 20, pageHeight - 15);
  }
  
  // Generate filename with current date
  const currentDate = new Date().toISOString().split('T')[0];
  const filename = `Catalogue-Formations-Kemet-Services-${currentDate}.pdf`;
  
  // Download the PDF
  pdf.save(filename);
};

// Alternative function to get PDF as blob for further processing
export const getCatalogPDFBlob = (): Blob => {
  // Generate the same PDF but return as blob instead of downloading
  const pdf = new jsPDF();
  // For now, return empty PDF - can be implemented later if needed
  return pdf.output('blob');
};