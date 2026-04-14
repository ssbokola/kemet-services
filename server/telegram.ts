// Notification Telegram pour les inscriptions Kemet Services
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8630686186:AAGosKo7PsJ2hgSeVXpBe5cVptPBIjh8PIs';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '6772935071';

export async function sendTelegramNotification(message: string): Promise<boolean> {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });

    if (!response.ok) {
      console.error('[Telegram] Erreur:', await response.text());
      return false;
    }

    console.log('[Telegram] Notification envoyée');
    return true;
  } catch (error) {
    console.error('[Telegram] Erreur:', error);
    return false;
  }
}

export function formatRegistrationNotification(data: {
  participantName: string;
  email: string;
  phone: string;
  trainingTitle: string;
  role?: string;
  officine?: string;
}): string {
  const lines = [
    `🎓 <b>Nouvelle inscription !</b>`,
    ``,
    `📋 <b>${data.trainingTitle}</b>`,
    `👤 ${data.participantName}`,
    `📧 ${data.email}`,
    `📱 ${data.phone}`,
  ];

  if (data.role) lines.push(`💼 ${data.role}`);
  if (data.officine) lines.push(`🏥 ${data.officine}`);

  lines.push(``, `⏰ ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Abidjan' })}`);

  return lines.join('\n');
}
