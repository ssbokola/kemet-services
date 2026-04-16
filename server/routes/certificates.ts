/**
 * Routes certificats — Lot 3.
 *
 *   GET /api/certificates/verify/:code    — PUBLIC, retourne les infos sanitisées
 *                                           (nom, formation, date, score) pour la
 *                                           page de vérification publique
 *                                           /certificats/:code.
 *
 *   GET /api/certificates/:code/download  — AUTH requis ; seul le titulaire peut
 *                                           télécharger son PDF. PDF généré à
 *                                           la volée (pas de persistance disque).
 *
 * Les certificats sont créés dans server/routes/final-quiz.ts quand le
 * participant réussit le quiz (≥ 70 %). On ne stocke que les métadonnées
 * en DB ; le PDF est régénéré à la demande par certificate-pdf.ts.
 */
import { Router } from 'express';
import { isAuthenticated } from '../replitAuth';
import { storage } from '../storage';
import { generateCertificatePdf } from '../services/certificate-pdf';

const router = Router();

/** Format lisible du nom : "Prénom Nom", fallback sur email local-part. */
function formatHolderName(holder: {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
}): string {
  const first = (holder.firstName || '').trim();
  const last = (holder.lastName || '').trim();
  const full = `${first} ${last}`.trim();
  if (full) return full;
  // Fallback : partie locale de l'email capitalisée
  if (holder.email) {
    const local = holder.email.split('@')[0];
    return local
      .split(/[._-]/)
      .filter(Boolean)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(' ');
  }
  return 'Apprenant Kemet Services';
}

/** Renvoie l'URL publique du certificat (pour le lien "vérifier" sur le PDF). */
function buildVerificationUrl(verificationCode: string): string {
  const base =
    process.env.APP_BASE_URL ||
    (process.env.NODE_ENV === 'production'
      ? 'https://kemetservices.com'
      : 'http://localhost:5000');
  return `${base.replace(/\/$/, '')}/certificats/${verificationCode}`;
}

// ----------------------------------------------------------------------
// GET /api/certificates/verify/:code
// PUBLIC — toute personne (employeur, régulateur, etc.) peut entrer le
// code de vérification et s'assurer de son authenticité. On retourne
// uniquement des infos minimales pour ne pas fuiter de données perso.
// ----------------------------------------------------------------------

router.get('/verify/:code', async (req, res) => {
  try {
    const code = req.params.code.trim();
    if (!/^KMT-\d{4}-\d{4}$/.test(code)) {
      return res.status(400).json({
        valid: false,
        error: 'Format de code invalide. Attendu : KMT-AAAA-XXXX',
      });
    }

    const data = await storage.getCertificateWithContext(code);
    if (!data) {
      return res.status(404).json({
        valid: false,
        error: "Certificat introuvable. Vérifiez le code saisi.",
      });
    }

    res.json({
      valid: true,
      certificate: {
        verificationCode: data.certificate.verificationCode,
        certificateNumber: data.certificate.certificateNumber,
        finalScore: data.certificate.finalScore,
        completedAt: data.certificate.completedAt.toISOString(),
        issuedAt: data.certificate.issuedAt.toISOString(),
      },
      holder: {
        name: formatHolderName(data.holder),
      },
      course: {
        title: data.course.title,
        slug: data.course.slug,
      },
    });
  } catch (err) {
    console.error('[CERTIFICATES] Verify error:', err);
    res.status(500).json({ valid: false, error: 'Erreur interne du serveur.' });
  }
});

// ----------------------------------------------------------------------
// GET /api/certificates/:code/download
// AUTH requis ; seul le titulaire peut télécharger son propre PDF.
// Le PDF est généré à la volée et streamé directement dans la réponse.
// ----------------------------------------------------------------------

router.get('/:code/download', isAuthenticated, async (req: any, res) => {
  try {
    const code = req.params.code.trim();
    if (!/^KMT-\d{4}-\d{4}$/.test(code)) {
      return res.status(400).json({ error: 'Format de code invalide.' });
    }

    const data = await storage.getCertificateWithContext(code);
    if (!data) {
      return res.status(404).json({ error: 'Certificat introuvable.' });
    }

    // Seul le titulaire peut télécharger. Les admins peuvent aussi pour
    // l'instant (pratique pour support) — on relâche si jamais il y a un
    // concern de leak.
    const requesterId = req.user?.claims?.sub;
    const isHolder = requesterId === data.holder.id;
    // On pourrait lire req.user.role ici pour laisser passer les admins,
    // mais la session locale n'a pas toujours le rôle. Pour l'instant :
    // stricte (holder-only).
    if (!isHolder) {
      return res.status(403).json({
        error: "Vous n'êtes pas autorisé à télécharger ce certificat.",
      });
    }

    // En-têtes HTTP : forcer le téléchargement avec un nom de fichier propre
    const safeCourse = data.course.slug.replace(/[^a-z0-9-]/gi, '').slice(0, 40);
    const filename = `certificat-kemet-${safeCourse}-${data.certificate.verificationCode}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'private, no-cache');

    generateCertificatePdf(
      {
        holderName: formatHolderName(data.holder),
        courseTitle: data.course.title,
        finalScore: data.certificate.finalScore,
        completedAt: data.certificate.completedAt,
        verificationCode: data.certificate.verificationCode,
        verificationUrl: buildVerificationUrl(data.certificate.verificationCode),
      },
      res,
    );
  } catch (err) {
    console.error('[CERTIFICATES] Download error:', err);
    // Si on n'a pas encore écrit dans la réponse on renvoie un 500 JSON,
    // sinon il est trop tard (le stream PDF a commencé).
    if (!res.headersSent) {
      res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
  }
});

export default router;
