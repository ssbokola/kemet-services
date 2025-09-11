import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PolitiqueCookies() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-serif text-foreground mb-6">
              Politique de Cookies
            </h1>
            <p className="text-xl text-muted-foreground">
              Gestion transparente des cookies et technologies similaires
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-slate max-w-none">
              
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>1. Qu'est-ce qu'un cookie ?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>Un cookie est un petit fichier texte stocké sur votre appareil (ordinateur, tablette, smartphone) lorsque vous visitez un site web. Les cookies permettent au site de se souvenir de vos actions et préférences pendant une durée déterminée.</p>
                  
                  <p>Nous utilisons également d'autres technologies similaires telles que :</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Local Storage :</strong> Stockage local dans votre navigateur</li>
                    <li><strong>Session Storage :</strong> Stockage temporaire pour la durée de votre session</li>
                    <li><strong>Pixels de suivi :</strong> Images invisibles pour mesurer l'engagement (si utilisés)</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>2. Types de cookies utilisés</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  <div>
                    <h4 className="font-semibold text-lg mb-3 text-green-600">Cookies strictement nécessaires (toujours actifs)</h4>
                    <p className="mb-3">Ces cookies sont indispensables au fonctionnement du site et ne peuvent pas être désactivés.</p>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg">
                        <h5 className="font-semibold mb-2">État actuel des cookies</h5>
                        <p className="text-sm"><strong>Note technique :</strong> Ce site utilise actuellement uniquement les cookies techniques de base du navigateur pour la navigation. Aucun cookie personnalisé n'est actuellement défini par notre application.</p>
                        <p className="text-sm mt-2">Les cookies listés ci-dessous seront mis en place lors de l'implémentation des fonctionnalités de sécurité et de consentement :</p>
                      </div>
                      
                      <table className="w-full text-sm mt-4">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Cookie (à venir)</th>
                            <th className="text-left py-2">Finalité</th>
                            <th className="text-left py-2">Durée</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="py-2">connect.sid</td>
                            <td className="py-2">Identification de session Express.js</td>
                            <td className="py-2">Session</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">csrf_token</td>
                            <td className="py-2">Protection contre les attaques CSRF</td>
                            <td className="py-2">Session</td>
                          </tr>
                          <tr>
                            <td className="py-2">cookie_consent</td>
                            <td className="py-2">Mémorisation de vos choix de cookies</td>
                            <td className="py-2">12 mois</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-lg mb-3 text-blue-600">Cookies de fonctionnalité (optionnels)</h4>
                    <p className="mb-3">Ces cookies améliorent votre expérience en mémorisant vos préférences.</p>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Cookie</th>
                            <th className="text-left py-2">Finalité</th>
                            <th className="text-left py-2">Durée</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="py-2">theme_preference</td>
                            <td className="py-2">Mémorisation du thème (clair/sombre)</td>
                            <td className="py-2">12 mois</td>
                          </tr>
                          <tr>
                            <td className="py-2">language_preference</td>
                            <td className="py-2">Mémorisation de la langue choisie</td>
                            <td className="py-2">12 mois</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-lg mb-3 text-orange-600">Cookies d'analyse (nécessitent votre consentement)</h4>
                    <p className="mb-3">Ces cookies nous aident à comprendre comment les visiteurs utilisent notre site pour l'améliorer.</p>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Statut actuel :</strong> Aucun cookie d'analyse n'est actuellement déployé sur ce site.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Si nous décidons d'ajouter des outils d'analyse (comme Plausible Analytics respectueux de la vie privée), nous vous demanderons votre consentement explicite via un banner dédié.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-lg mb-3 text-red-600">Cookies publicitaires (nécessitent votre consentement)</h4>
                    <p className="mb-3">Ces cookies sont utilisés pour personnaliser les publicités selon vos intérêts.</p>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong>Statut actuel :</strong> Aucun cookie publicitaire n'est utilisé sur ce site. Nous ne diffusons pas de publicité personnalisée.
                      </p>
                    </div>
                  </div>

                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>3. Cookies de tiers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">WhatsApp (Meta)</h4>
                    <p>Lorsque vous cliquez sur nos boutons WhatsApp, vous êtes redirigé vers WhatsApp/Meta qui peut déposer ses propres cookies selon sa politique de confidentialité.</p>
                    <p><strong>Gestion :</strong> <a href="https://www.whatsapp.com/legal/privacy-policy" target="_blank" className="text-primary hover:underline">Politique de confidentialité WhatsApp</a></p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Replit (Hébergement)</h4>
                    <p>Notre site est hébergé sur Replit qui peut utiliser des cookies techniques pour le fonctionnement de la plateforme.</p>
                    <p><strong>Gestion :</strong> <a href="https://replit.com/privacy" target="_blank" className="text-primary hover:underline">Politique de confidentialité Replit</a></p>
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>4. Gestion de vos préférences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">💡 Centre de préférences et banner de consentement</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Statut actuel :</strong> Un banner de consentement et un centre de préférences seront implémentés lors de la mise en place des cookies non essentiels.
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Fonctionnalités prévues :</strong>
                    </p>
                    <ul className="text-sm list-disc pl-4 space-y-1">
                      <li>Banner de consentement granulaire (par catégorie de cookies)</li>
                      <li>Centre de préférences accessible via un lien permanent</li>
                      <li>Possibilité de modifier vos choix à tout moment</li>
                      <li>Stockage local de vos préférences avec horodatage</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Via votre navigateur</h4>
                    <p>Vous pouvez à tout moment configurer votre navigateur pour :</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Accepter ou refuser tous les cookies</li>
                      <li>Être notifié avant qu'un cookie soit déposé</li>
                      <li>Supprimer les cookies existants</li>
                    </ul>
                    
                    <div className="mt-4 space-y-2">
                      <p><strong>Guides par navigateur :</strong></p>
                      <ul className="list-disc pl-6 space-y-1 text-sm">
                        <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" className="text-primary hover:underline">Google Chrome</a></li>
                        <li><a href="https://support.mozilla.org/fr/kb/protection-renforcee-contre-pistage-firefox-ordinateur" target="_blank" className="text-primary hover:underline">Firefox</a></li>
                        <li><a href="https://support.apple.com/fr-fr/guide/safari/sfri11471/mac" target="_blank" className="text-primary hover:underline">Safari</a></li>
                        <li><a href="https://support.microsoft.com/fr-fr/microsoft-edge/supprimer-les-cookies-dans-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" className="text-primary hover:underline">Microsoft Edge</a></li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">⚠️ Important</h4>
                    <p className="text-sm">
                      Désactiver certains cookies peut affecter le fonctionnement du site. Les cookies strictement nécessaires ne peuvent pas être désactivés sans compromettre la sécurité et le fonctionnement du site.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>5. Durée de conservation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Cookies de session :</strong> Supprimés à la fermeture du navigateur</li>
                    <li><strong>Cookies persistants :</strong> Conservés selon les durées indiquées dans les tableaux ci-dessus</li>
                    <li><strong>Suppression automatique :</strong> Tous les cookies expirent automatiquement à l'issue de leur durée de vie</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>6. Vos droits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>Conformément au RGPD et à la loi ivoirienne, vous disposez des droits suivants concernant les cookies :</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Droit d'information :</strong> Être informé sur l'utilisation des cookies (cette page)</li>
                    <li><strong>Droit de consentement :</strong> Donner ou retirer votre consentement pour les cookies non essentiels</li>
                    <li><strong>Droit d'accès :</strong> Connaître quels cookies sont stockés sur votre appareil</li>
                    <li><strong>Droit de suppression :</strong> Supprimer les cookies via votre navigateur</li>
                  </ul>
                  
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">Pour exercer vos droits :</h4>
                    <p>Contactez-nous : <strong>infos@kemetservices.com</strong></p>
                    <p>Ou consultez notre <a href="/confidentialite" className="text-primary hover:underline">Politique de Confidentialité</a></p>
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>7. Base légale</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>L'utilisation des cookies sur ce site repose sur :</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Cookies strictement nécessaires :</strong> Exemptés de consentement (Article 82 RGPD)</li>
                    <li><strong>Cookies fonctionnels :</strong> Votre consentement explicite</li>
                    <li><strong>Cookies d'analyse :</strong> Votre consentement explicite (si déployés)</li>
                    <li><strong>Cookies publicitaires :</strong> Votre consentement explicite (non utilisés actuellement)</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>8. Contact et réclamations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>Pour toute question concernant l'utilisation des cookies :</p>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p><strong>Email :</strong> infos@kemetservices.com</p>
                    <p><strong>Objet :</strong> "Question - Politique de cookies"</p>
                  </div>
                  
                  <p>Pour toute réclamation :</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>ARTCI (Côte d'Ivoire) : <a href="https://www.artci.ci" target="_blank" className="text-primary hover:underline">www.artci.ci</a></li>
                    <li>CNIL (France/UE) pour les résidents européens</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>9. Mise à jour de cette politique</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>Cette politique de cookies peut être mise à jour pour refléter les changements dans notre utilisation des cookies ou les évolutions réglementaires.</p>
                  
                  <p>Toute modification substantielle sera communiquée par :</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Un avis sur le site web</li>
                    <li>Une notification par email si vous êtes inscrit à notre newsletter</li>
                    <li>Mise à jour du banner de consentement (le cas échéant)</li>
                  </ul>
                  
                  <p><strong>Version :</strong> 1.0</p>
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