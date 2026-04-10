import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Confidentialite() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Politique de Confidentialite"
        description="Politique de confidentialite et protection des donnees personnelles de Kemet Services. RGPD, traitement des donnees, droits des utilisateurs."
        canonical="/confidentialite"
      />
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-serif text-foreground mb-6">
              Politique de Confidentialité
            </h1>
            <p className="text-xl text-muted-foreground">
              Protection de vos données personnelles selon le RGPD et la loi ivoirienne
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-slate max-w-none">
              
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>1. Identité du responsable de traitement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p><strong>Kemet Services</strong></p>
                  <p>Cabinet de formation et consultance pharmaceutique</p>
                  <p>Mamie Adjoua, Yopougon - Abidjan, Côte d'Ivoire</p>
                  <p>Email : infos@kemetservices.com</p>
                  <p>Téléphone : +225 0759 068 xxx</p>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>2. Données collectées et finalités</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Données collectées via le diagnostic gratuit :</h4>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Nom de la pharmacie et du responsable</li>
                      <li>Adresse email et numéro de téléphone</li>
                      <li>Localisation de la pharmacie</li>
                      <li>Informations sur l'activité (années d'opération, taille équipe)</li>
                      <li>Défis opérationnels identifiés</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Finalités du traitement :</h4>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Réalisation du diagnostic gratuit demandé</li>
                      <li>Préparation de recommandations personnalisées</li>
                      <li>Contact pour planifier le diagnostic</li>
                      <li><strong>Communications marketing :</strong> Proposition de services adaptés (formations, consulting) basée sur notre intérêt légitime à développer notre activité, avec possibilité d'opposition à tout moment</li>
                    </ul>
                    
                    <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg mt-4">
                      <h4 className="font-semibold mb-1">Opt-out marketing</h4>
                      <p className="text-sm">Pour vous désinscrire des communications marketing : <strong>envoyez "STOP" à infos@kemetservices.com</strong> ou cliquez sur le lien de désinscription dans nos emails.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>3. Base légale et consentement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>Le traitement de vos données repose sur :</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Votre consentement explicite</strong> pour le traitement de vos données via nos formulaires</li>
                    <li><strong>L'exécution de mesures précontractuelles</strong> pour la réalisation du diagnostic gratuit</li>
                    <li><strong>Notre intérêt légitime</strong> pour l'amélioration de nos services</li>
                  </ul>
                  <p>Vous pouvez retirer votre consentement à tout moment en nous contactant.</p>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>4. Destinataires des données et processeurs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>Vos données peuvent être partagées avec les destinataires suivants :</p>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Destinataires internes :</h4>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Équipe Kemet Services</strong> (consultants, formateurs) pour la réalisation des diagnostics et formations</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Processeurs de données (sous-traitants) :</h4>
                    <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                      <div>
                        <p><strong>Replit, Inc. (Hébergement web)</strong></p>
                        <p className="text-sm text-muted-foreground">Localisation : États-Unis</p>
                        <p className="text-sm text-muted-foreground">Rôle : Hébergement du site web et stockage des données</p>
                        <p className="text-sm"><a href="https://replit.com/privacy" target="_blank" className="text-primary hover:underline">Politique de confidentialité Replit</a></p>
                      </div>
                      
                      
                      <div>
                        <p><strong>Fournisseur d'email (Gmail/Google)</strong></p>
                        <p className="text-sm text-muted-foreground">Localisation : États-Unis / Multiples centres de données</p>
                        <p className="text-sm text-muted-foreground">Rôle : Réception et envoi des emails de contact</p>
                        <p className="text-sm"><a href="https://policies.google.com/privacy" target="_blank" className="text-primary hover:underline">Politique de confidentialité Google</a></p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Responsables de traitement indépendants :</h4>
                    <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-lg">
                      <div>
                        <p><strong>Meta Platforms (WhatsApp)</strong></p>
                        <p className="text-sm text-muted-foreground">Statut : Responsable de traitement indépendant (contrôleur)</p>
                        <p className="text-sm text-muted-foreground">Quand : Si vous nous contactez via WhatsApp</p>
                        <p className="text-sm text-muted-foreground">Données : Celles que vous choisissez de partager via WhatsApp</p>
                        <p className="text-sm text-muted-foreground">Régime : Traitement régi par la politique de confidentialité de Meta</p>
                        <p className="text-sm"><a href="https://www.whatsapp.com/legal/privacy-policy" target="_blank" className="text-primary hover:underline">Politique de confidentialité WhatsApp</a></p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">⚠️ Important</h4>
                    <p className="text-sm">WhatsApp agit comme responsable de traitement indépendant. Vos données WhatsApp sont traitées selon leur propre politique, hors de notre contrôle direct. Nous ne sommes pas responsables du traitement effectué par Meta/WhatsApp.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>5. Durée de conservation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Données de diagnostic :</strong> 24 mois maximum après le dernier contact</li>
                    <li><strong>Données de contact :</strong> Supprimées à votre demande ou automatiquement après 12 mois d'inactivité</li>
                    <li><strong>Données marketing :</strong> Conservées jusqu'à votre désinscription</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>6. Vos droits (RGPD)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>Conformément au RGPD et à la loi ivoirienne n°2013-450, vous disposez des droits suivants :</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Droit d'accès :</strong> Obtenir une copie de vos données</li>
                    <li><strong>Droit de rectification :</strong> Corriger des données inexactes</li>
                    <li><strong>Droit à l'effacement :</strong> Supprimer vos données ("droit à l'oubli")</li>
                    <li><strong>Droit à la limitation :</strong> Restreindre le traitement</li>
                    <li><strong>Droit à la portabilité :</strong> Récupérer vos données dans un format structuré</li>
                    <li><strong>Droit d'opposition :</strong> Vous opposer au traitement pour motifs légitimes</li>
                  </ul>
                  
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">Pour exercer vos droits :</h4>
                    <p>Contactez-nous par email : <strong>infos@kemetservices.com</strong></p>
                    <p>Délai de réponse : <strong>30 jours maximum</strong></p>
                    <p>Une pièce d'identité pourra être demandée pour vérifier votre identité.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>7. Transferts internationaux</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>Certains de nos processeurs de données sont situés en dehors de la Côte d'Ivoire, notamment :</p>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Transferts vers les États-Unis :</h4>
                      <ul className="list-disc pl-6 space-y-1">
                        <li><strong>Replit, Inc.</strong> - Hébergement web (soumis aux lois américaines sur la protection des données)</li>
                        <li><strong>Meta Platforms</strong> - Messagerie WhatsApp (participant au Data Privacy Framework UE-US)</li>
                        <li><strong>Google LLC</strong> - Services email (participant au Data Privacy Framework UE-US)</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Garanties légales (Article 46 RGPD) :</h4>
                      <ul className="list-disc pl-6 space-y-1">
                        <li><strong>Clauses contractuelles types (CCT)</strong> - Décision d'exécution UE 2021/914 de la Commission européenne</li>
                        <li><strong>Accords de traitement (DPA)</strong> avec garanties de protection équivalente</li>
                        <li><strong>Mesures supplémentaires :</strong> Chiffrement AES-256, contrôles d'accès stricts</li>
                        <li><strong>Certifications :</strong> ISO 27001, SOC 2 Type II chez nos processeurs</li>
                      </ul>
                      
                      <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                        <h5 className="font-semibold mb-1">📋 WhatsApp - Contrôleur indépendant</h5>
                        <p className="text-sm"><strong>Important :</strong> Meta/WhatsApp agit comme contrôleur indépendant (pas sous-traitant). Vos données WhatsApp sont traitées selon leur propre politique, hors de notre contrôle direct.</p>
                      </div>
                      
                      <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                        <h5 className="font-semibold mb-1">🇨🇮 Conformité Côte d'Ivoire</h5>
                        <p className="text-sm"><strong>Article 24 de la loi n°2013-450 :</strong> Conformément à cette disposition sur les transferts transfrontaliers, nous avons effectué la déclaration requise auprès de l'ARTCI.</p>
                        <p className="text-sm"><strong>Numéro de déclaration :</strong> <em>En cours d'attribution par l'ARTCI</em></p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">📄 Accès aux garanties et droits</h4>
                    <p className="text-sm mb-2">Vous pouvez demander :</p>
                    <ul className="text-sm list-disc pl-4 space-y-1">
                      <li>Une copie des Clauses Contractuelles Types (CCT)</li>
                      <li>Les détails des mesures supplémentaires</li>
                      <li>Une évaluation des risques résiduels</li>
                      <li>L'opposition aux transferts (sous conditions légales)</li>
                    </ul>
                    <p className="text-sm mt-2"><strong>Contact :</strong> infos@kemetservices.com (objet : "Transferts - Article 46 RGPD")</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>8. Sécurité des données</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Chiffrement des communications</li>
                    <li>Accès restreint aux données aux seuls personnels autorisés</li>
                    <li>Sauvegarde sécurisée des données</li>
                    <li>Suppression automatique après expiration des délais de conservation</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>9. Cookies et technologies similaires</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>Notre site utilise des cookies techniques nécessaires au fonctionnement. 
                  Aucun cookie de suivi ou publicitaire n'est utilisé sans votre consentement.</p>
                  <p>Consultez notre <a href="/politique-cookies" className="text-primary hover:underline">Politique de Cookies</a> pour plus de détails.</p>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>10. Réclamations et autorités de contrôle</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>Si vous estimez que vos droits ne sont pas respectés, vous pouvez :</p>
                  
                  <div>
                    <h4 className="font-semibold mb-2">1. Nous contacter directement</h4>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p><strong>Email :</strong> infos@kemetservices.com</p>
                      <p><strong>Objet :</strong> "Réclamation - Protection des données"</p>
                      <p><strong>Délai de réponse :</strong> 30 jours maximum</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">2. Saisir l'autorité de contrôle ivoirienne</h4>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p><strong>ARTCI (Autorité de Régulation des Télécommunications/TIC de Côte d'Ivoire)</strong></p>
                      <p><strong>Adresse :</strong> Immeuble CAISTAB, Plateau, 01 BP 2775 Abidjan 01, Côte d'Ivoire</p>
                      <p><strong>Téléphone :</strong> +225 20 21 61 00</p>
                      <p><strong>Email :</strong> contact@artci.ci</p>
                      <p><strong>Site web :</strong> <a href="https://www.artci.ci" target="_blank" className="text-primary hover:underline">www.artci.ci</a></p>
                      <p className="text-sm text-muted-foreground mt-2"><strong>Droit de recours :</strong> Vous avez le droit de déposer une plainte auprès de l'ARTCI si vous estimez que le traitement de vos données personnelles constitue une violation de vos droits.</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">3. Pour les résidents européens</h4>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p><strong>CNIL (France) :</strong> <a href="https://www.cnil.fr" target="_blank" className="text-primary hover:underline">www.cnil.fr</a></p>
                      <p><strong>Autres autorités UE :</strong> Votre autorité nationale de protection des données</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>11. Modifications de cette politique</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 p-3 rounded-lg mb-4">
                    <h4 className="font-semibold mb-1">Délégué à la Protection des Données (DPO)</h4>
                    <p className="text-sm"><strong>Statut :</strong> Aucun DPO n'est désigné pour le moment (non obligatoire selon l'Article 37 RGPD pour notre type d'activité). Pour toute question relative à la protection des données, contactez directement : infos@kemetservices.com</p>
                  </div>
                  
                  <p>Cette politique peut être mise à jour. Toute modification substantielle vous sera notifiée par email ou via un avis sur notre site.</p>
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