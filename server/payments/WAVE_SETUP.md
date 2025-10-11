# Configuration Wave Mobile Money (PayDunya SOFTPAY)

## Vue d'ensemble

L'intégration Wave utilise **PayDunya SOFTPAY** pour collecter les paiements Wave Mobile Money en FCFA (XOF) au Sénégal et en Côte d'Ivoire.

## Prérequis

1. **Compte PayDunya Business**
   - Créer un compte sur [PayDunya](https://paydunya.com)
   - Activer le service SOFTPAY Wave dans votre tableau de bord

2. **Informations d'API PayDunya**
   - Master Key
   - Private Key
   - Public Key (optionnel pour frontend)
   - Token

## Variables d'environnement requises

Ajoutez ces variables à votre fichier `.env` :

```bash
# PayDunya API Credentials
PAYDUNYA_MASTER_KEY=your_master_key_here
PAYDUNYA_PRIVATE_KEY=your_private_key_here
PAYDUNYA_PUBLIC_KEY=your_public_key_here
PAYDUNYA_TOKEN=your_token_here

# Mode: 'test' pour sandbox, 'live' pour production
PAYDUNYA_MODE=test

# Pays: 'SN' pour Sénégal, 'CI' pour Côte d'Ivoire
WAVE_COUNTRY=SN

# Secret pour vérifier les webhooks (optionnel)
PAYDUNYA_WEBHOOK_SECRET=your_webhook_secret

# URL de base de votre application (pour callbacks)
APP_BASE_URL=http://localhost:5000
```

## Mode Test vs Production

### Mode Test (Sandbox)
- `PAYDUNYA_MODE=test`
- API Base URL: `https://app.paydunya.com/sandbox-api/v1`
- Utiliser les numéros de test PayDunya pour simuler les paiements

### Mode Production (Live)
- `PAYDUNYA_MODE=live`
- API Base URL: `https://app.paydunya.com/api/v1`
- Utiliser de vrais numéros Wave pour les paiements réels

## Différences par pays

### Sénégal (`WAVE_COUNTRY=SN`)
- Endpoint: `/softpay/wave-senegal`
- Préfixe téléphone: +221
- Champs payload:
  - `wave_senegal_fullName`
  - `wave_senegal_email`
  - `wave_senegal_phone` (sans le +221)
  - `wave_senegal_payment_token`

### Côte d'Ivoire (`WAVE_COUNTRY=CI`)
- Endpoint: `/softpay/wave-ci`
- Préfixe téléphone: +225
- Champs payload:
  - `wave_ci_fullName`
  - `wave_ci_email`
  - `wave_ci_phone` (sans le +225)
  - `wave_ci_payment_token`

**Important:** Le payload est automatiquement adapté selon la valeur de `WAVE_COUNTRY`.

## Flow de paiement

1. **Création du checkout**
   - L'utilisateur clique sur "Payer avec Wave"
   - Backend crée une invoice PayDunya
   - Backend crée une session Wave SOFTPAY avec le payload adapté au pays
   - Backend retourne l'URL de paiement Wave

2. **Redirection vers Wave**
   - L'utilisateur est redirigé vers `pay.wave.com`
   - L'utilisateur entre son numéro Wave et confirme
   - Wave traite le paiement

3. **Callback/Webhook**
   - Wave notifie PayDunya du statut
   - PayDunya envoie un webhook à votre API
   - Votre API met à jour la commande et déverrouille le cours

4. **Retour utilisateur**
   - L'utilisateur est redirigé vers la page de succès
   - Il peut accéder à sa formation

## Routes API créées

### POST /api/payments/wave/checkout
Créer une session de paiement Wave

**Body:**
```json
{
  "courseId": "course-uuid",
  "userId": "user-uuid",
  "amount": 15000,
  "returnUrl": "/mon-compte",
  "cancelUrl": "/formations"
}
```

**Response:**
```json
{
  "success": true,
  "paymentUrl": "https://pay.wave.com/c/...",
  "orderId": "order-uuid",
  "checkoutId": "checkout-token",
  "fees": 150
}
```

### POST /api/payments/wave/webhook
Recevoir les notifications de paiement de PayDunya

**Headers:**
- `X-PayDunya-Signature`: Signature du webhook (si configuré)

**Body:**
```json
{
  "status": "completed",
  "transaction_id": "wave-tx-123",
  "custom_data": "order-uuid",
  "amount": 15000,
  "fees": 150
}
```

### GET /api/payments/wave/status/:orderId
Vérifier le statut d'une commande

**Response:**
```json
{
  "success": true,
  "status": "completed",
  "transactionId": "wave-tx-123"
}
```

## Numéros de test

### Sénégal (Test)
- **Numéro Wave valide:** 77 123 45 67
- **Code PIN:** 1234

### Côte d'Ivoire (Test)
- **Numéro Wave valide:** 07 XX XX XX XX
- **Code PIN:** 1234

## Tarification Wave

- **Frais Wave standard:** ~1-2% du montant
- **Minimum:** 25 FCFA
- **Maximum:** Selon le plafond Wave

Les frais sont automatiquement calculés et retournés dans la réponse.

## Sécurité

### Vérification des webhooks

⚠️ **IMPORTANT pour la production** : La fonction `verifyWaveWebhook()` utilise une implémentation HMAC-SHA256 par défaut. **Vous devez vérifier le mécanisme exact de signature PayDunya avant de déployer en production**.

**Méthodes de vérification (par ordre de priorité)** :

1. **Signature HMAC (préférée)** :
   - Header: `X-PayDunya-Signature` (ou selon docs PayDunya)
   - Algorithme: HMAC-SHA256 (à confirmer avec PayDunya)
   - Secret: `PAYDUNYA_WEBHOOK_SECRET` ou `PAYDUNYA_PRIVATE_KEY`

2. **Token PayDunya (fallback)** :
   - Header: `PAYDUNYA-TOKEN`
   - Vérifie que le token correspond à `PAYDUNYA_TOKEN`
   - Moins sécurisé mais mieux qu'aucune vérification

3. **Rejet automatique** :
   - Si ni signature ni token valide → webhook rejeté
   - Logs d'erreur générés pour audit

**Actions requises pour production** :
1. Consulter la documentation officielle PayDunya sur les webhooks
2. Vérifier avec le support PayDunya :
   - L'algorithme de signature exact (SHA256, SHA512, etc.)
   - Le nom exact du header de signature
   - Le format du payload à signer (raw body, JSON stringifié, etc.)
3. Mettre à jour `verifyWaveWebhook()` en conséquence
4. Configurer `PAYDUNYA_WEBHOOK_SECRET` pour production

### Autres mesures de sécurité

1. **Ne jamais exposer les clés privées côté client**
2. **Toujours vérifier la signature des webhooks en production**
3. **Utiliser HTTPS en production**
4. **Implémenter l'idempotence pour les webhooks** (éviter double traitement)
5. **Valider les montants côté serveur** (ne pas faire confiance au client)

## Support

- **PayDunya Support:** support@paydunya.com
- **Wave Sénégal:** 200600 (gratuit)
- **Wave Côte d'Ivoire:** 1315 (gratuit)

## Ressources

- [Documentation PayDunya](https://developers.paydunya.com)
- [Documentation Wave Business](https://docs.wave.com/business)
- [Wave SOFTPAY API](https://developers.paydunya.com/doc/FR/softpay)
