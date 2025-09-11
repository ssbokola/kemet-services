import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MentionsLegales() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-serif text-foreground mb-6">
              Mentions Légales
            </h1>
            <p className="text-xl text-muted-foreground">
              Informations légales et conditions d'utilisation
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-slate max-w-none">
              
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>1. Identification de l'entreprise</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p><strong>Dénomination sociale :</strong> Kemet Services</p>
                    <p><strong>Forme juridique :</strong> Entreprise individuelle / Cabinet de formation et consultance</p>
                    <p><strong>Siège social :</strong> Abidjan, Côte d'Ivoire</p>
                    <p><strong>Email :</strong> infos@kemetservices.com</p>
                    <p><strong>Téléphone :</strong> +225 0759 068 xxx</p>
                  </div>
                  
                  <div>
                    <p><strong>Directeur de la publication :</strong> Dr. Bokola N'Guessan</p>
                    <p><strong>Domaine d'activité :</strong> Formation et consultance spécialisées dans l'optimisation des pharmacies d'officine</p>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Informations administratives</h4>
                    <p><strong>Statut ARTCI :</strong> Déclaration en cours pour activités de formation professionnelle</p>
                    <p><strong>Note :</strong> Les informations d'enregistrement commercial (RCCM) et d'identification fiscale (NIF) seront ajoutées dès l'obtention des documents officiels.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>2. Hébergement du site</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p><strong>Hébergeur :</strong> Replit, Inc.</p>
                  <p><strong>Adresse :</strong> 767 Bryant St. #203, San Francisco, CA 94107, États-Unis</p>
                  <p><strong>Site web :</strong> https://replit.com</p>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>3. Propriété intellectuelle</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>L'ensemble du contenu de ce site (textes, images, logos, graphismes, vidéos, etc.) est protégé par le droit d'auteur et appartient à Kemet Services ou à ses partenaires.</p>
                  
                  <p>Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de Kemet Services.</p>
                  
                  <p><strong>Marques :</strong> "Kemet Services" est une marque de commerce. Toute utilisation non autorisée de cette marque est interdite.</p>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>4. Conditions d'utilisation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Accès au site :</h4>
                    <p>L'accès au site est gratuit. Kemet Services se réserve le droit de suspendre, modifier ou supprimer l'accès au site à tout moment sans préavis.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Utilisation appropriée :</h4>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Utilisation conforme aux lois en vigueur</li>
                      <li>Respect des droits d'autrui</li>
                      <li>Interdiction de toute utilisation malveillante</li>
                      <li>Interdiction de collecter des données automatiquement</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>5. Services proposés</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Formations professionnelles :</h4>
                    <p>Formations spécialisées pour pharmaciens et auxiliaires en pharmacie, conformes aux standards de formation continue.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Services de consulting :</h4>
                    <p>Audit, diagnostic et accompagnement personnalisé pour l'optimisation des pharmacies d'officine.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Diagnostic gratuit :</h4>
                    <p>Évaluation préliminaire gratuite des besoins de votre officine, sans engagement.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>6. Limitation de responsabilité</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>Kemet Services s'efforce de fournir des informations exactes et mises à jour sur ce site. Cependant, nous ne pouvons garantir l'exactitude, la complétude ou l'actualité de toutes les informations.</p>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Kemet Services ne saurait être tenu responsable :</h4>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Des dommages directs ou indirects résultant de l'utilisation du site</li>
                      <li>De l'interruption temporaire du service</li>
                      <li>De la perte de données</li>
                      <li>Des virus ou programmes malveillants qui pourraient affecter votre équipement</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>7. Liens externes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>Ce site peut contenir des liens vers des sites externes. Kemet Services n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu ou leur politique de confidentialité.</p>
                  
                  <p><strong>Réseaux sociaux :</strong> Nos liens vers WhatsApp et autres plateformes externes sont soumis aux conditions d'utilisation de ces plateformes.</p>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>8. Protection des données personnelles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>Le traitement de vos données personnelles est régi par notre <a href="/confidentialite" className="text-primary hover:underline">Politique de Confidentialité</a>, conforme au RGPD et à la loi ivoirienne n°2013-450 sur la protection des données à caractère personnel.</p>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>9. Droit applicable et juridiction</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p><strong>Droit applicable :</strong> Les présentes mentions légales sont régies par le droit ivoirien.</p>
                  
                  <p><strong>Juridiction compétente :</strong> En cas de litige, et après recherche d'une solution amiable, les tribunaux d'Abidjan seront seuls compétents.</p>
                  
                  <p><strong>Langue :</strong> En cas de traduction des présentes mentions légales, seule la version française fait foi.</p>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>10. Contact et réclamations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>Pour toute question relative aux présentes mentions légales ou au fonctionnement du site :</p>
                  
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p><strong>Email :</strong> infos@kemetservices.com</p>
                    <p><strong>Téléphone :</strong> +225 0759 068 xxx</p>
                    <p><strong>WhatsApp :</strong> +225 0759 068 xxx</p>
                    <p><strong>Horaires :</strong> Lundi à Vendredi, 8h00 - 17h00 (GMT)</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>11. Modification des mentions légales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>Kemet Services se réserve le droit de modifier les présentes mentions légales à tout moment. Les modifications prennent effet dès leur publication sur le site.</p>
                  
                  <p>Il est conseillé de consulter régulièrement cette page pour prendre connaissance des éventuelles modifications.</p>
                  
                  <p><strong>Dernière mise à jour :</strong> 11 septembre 2025</p>
                </CardContent>
              </Card>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}