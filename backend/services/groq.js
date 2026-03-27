const axios = require('axios');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const WORD_LIMITS = { initial: 120, followup: 80, reminder: 60 };

const SYSTEM_PROMPT = `Du bist ein professioneller Outreach-Spezialist, der E-Mails an Hotelbesitzer im Namen von BOORGEN schreibt.
Stil: Professionell, ruhig, selbstbewusst. Kein aggressives Verkaufen. Fokus auf Expansion, ROI und ungenutztes Potenzial.
Sprache: Deutsch.
Struktur: 1. Begrüßung 2. Einleitung 3. Personalisierte Beobachtung 4. Mehrwert (ROI/Expansion) 5. Stichpunkte 6. Sanfter CTA.
Regeln: Keine Platzhalter. Keine Erklärungen. Nur den finalen E-Mail-Text ausgeben.`;

function buildUserPrompt(name, hotel, location, type) {
  const limit = WORD_LIMITS[type] || 120;
  const instructions = {
    initial: `Stelle BOORGEN vor. Erwähne Expansionspotenzial. CTA = kurzes Gespräch. Max ${limit} Wörter.`,
    followup: `Erwähne ROI oder verpasste Chance. CTA = ROI-Beispiel anbieten. Max ${limit} Wörter.`,
    reminder: `Sehr kurz. Höfliche Nachfrage. CTA = Ja/Nein-Antwort. Max ${limit} Wörter.`,
  };

  return `Name: ${name}, Hotel: ${hotel}, Standort: ${location}, Typ: ${type}. ${instructions[type] || instructions.initial}`;
}

function fallbackTemplate(name, hotel, location) {
  return `Hallo ${name},\n\nIch bin auf ${hotel} in ${location} aufmerksam geworden und wollte Ihnen eine kurze Idee mitteilen, wie Sie Ihr Geschäft weiter ausbauen könnten.\n\nHätten Sie kurz Zeit für ein Gespräch?\n\nMit freundlichen Grüßen,\nBOORGEN Team`;
}

async function generateEmail({ name, hotel, location, type = 'initial' }) {
  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(name, hotel, location, type) },
        ],
        temperature: 0.7,
        max_tokens: 300,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (err) {
    const detail = err.response?.data ? JSON.stringify(err.response.data) : err.message;
    console.error('Groq API error:', detail);
    return fallbackTemplate(name, hotel, location);
  }
}

module.exports = { generateEmail, fallbackTemplate };

