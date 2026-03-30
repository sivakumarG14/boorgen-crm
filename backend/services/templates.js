/**
 * Email templates for all 8 flows.
 * Each template is a function returning { subject, text }.
 * Language: 'de' (German) or 'en' (English)
 */

const templates = {
  // FLOW 1 — Cold Contact (Day 0)
  cold_contact: {
    de: ({ name, hotel, location }) => ({
      subject: `Kurze Idee für ${hotel}`,
      text: `Hallo ${name},

ich bin auf ${hotel} in ${location} aufmerksam geworden und wollte kurz Ihre Perspektive einholen.

Viele Hoteliers in Ihrer Region entdecken gerade stille Expansionsmöglichkeiten – ohne großen Aufwand, aber mit messbarem ROI.

Ich würde Ihnen gerne in 2–3 Sätzen zeigen, was ich meine. Hätten Sie kurz Interesse?

Mit freundlichen Grüßen,
BOORGEN Team`,
    }),
    en: ({ name, hotel, location }) => ({
      subject: `Quick idea for ${hotel}`,
      text: `Hi ${name},

I came across ${hotel} in ${location} and wanted to share a quick thought.

Many hoteliers in your area are discovering quiet expansion opportunities — low effort, measurable ROI.

I'd love to show you what I mean in 2–3 sentences. Would you be open to it?

Best regards,
BOORGEN Team`,
    }),
  },

  // FLOW 1/2 — Cold Exit
  cold_exit: {
    de: ({ name, hotel }) => ({
      subject: `Kein Problem, ${name}`,
      text: `Hallo ${name},

verstanden – kein Interesse an ${hotel} im Moment. Ich respektiere das vollständig.

Falls sich das ändert, stehe ich gerne zur Verfügung.

Alles Gute,
BOORGEN Team`,
    }),
    en: ({ name, hotel }) => ({
      subject: `No problem, ${name}`,
      text: `Hi ${name},

Understood — no interest for ${hotel} at the moment. I completely respect that.

If anything changes, feel free to reach out.

All the best,
BOORGEN Team`,
    }),
  },

  // FLOW 2 — Reminder 1 (Day 4-5)
  reminder_1: {
    de: ({ name, hotel }) => ({
      subject: `Kurze Nachfrage – ${hotel}`,
      text: `Hallo ${name},

ich wollte kurz nachfragen, ob meine letzte Nachricht angekommen ist.

Es geht um eine konkrete Möglichkeit für ${hotel} – kein Pitch, nur eine kurze Idee.

Ja oder Nein reicht völlig.

Mit freundlichen Grüßen,
BOORGEN Team`,
    }),
    en: ({ name, hotel }) => ({
      subject: `Quick follow-up — ${hotel}`,
      text: `Hi ${name},

Just checking if my last message reached you.

It's about a specific opportunity for ${hotel} — no pitch, just a quick idea.

A simple yes or no is enough.

Best regards,
BOORGEN Team`,
    }),
  },

  // FLOW 3 — Trust Building (Day 8-10)
  trust_building: {
    de: ({ name, hotel, location }) => ({
      subject: `Was andere Hotels in ${location} gerade tun`,
      text: `Hallo ${name},

ich möchte Ihnen etwas zeigen, das für ${hotel} relevant sein könnte.

Hotels in ${location} nutzen aktuell ungenutzte Flächen, um zusätzliche Einheiten zu schaffen – ohne Neubau, ohne großen Aufwand.

Die Ergebnisse: 20–40% mehr Kapazität, bessere Auslastung, höherer Umsatz.

Darf ich Ihnen zeigen, wie das konkret für ${hotel} aussehen könnte? Ich brauche dafür nur kurz Ihre Adresse oder einen Google Maps Link.

Mit freundlichen Grüßen,
BOORGEN Team`,
    }),
    en: ({ name, hotel, location }) => ({
      subject: `What other hotels in ${location} are doing right now`,
      text: `Hi ${name},

I want to show you something that could be relevant for ${hotel}.

Hotels in ${location} are currently using unused space to create additional units — no new construction, minimal effort.

Results: 20–40% more capacity, better occupancy, higher revenue.

May I show you what this could look like specifically for ${hotel}? I just need your address or a Google Maps link.

Best regards,
BOORGEN Team`,
    }),
  },

  // FLOW 4 — Reminder 2 / Self-Service (Day 15-20)
  reminder_2: {
    de: ({ name, hotel }) => ({
      subject: `Selbst prüfen: Potenzial für ${hotel}`,
      text: `Hallo ${name},

falls Sie lieber selbst einen ersten Eindruck gewinnen möchten – kein Problem.

Hier können Sie das Potenzial für ${hotel} in wenigen Minuten selbst einschätzen:
👉 [Konfigurator öffnen]

Ich bin da, wenn Sie Fragen haben.

Mit freundlichen Grüßen,
BOORGEN Team`,
    }),
    en: ({ name, hotel }) => ({
      subject: `Check it yourself: potential for ${hotel}`,
      text: `Hi ${name},

If you'd prefer to get a first impression on your own — no problem.

Here you can assess the potential for ${hotel} in just a few minutes:
👉 [Open Configurator]

I'm here if you have questions.

Best regards,
BOORGEN Team`,
    }),
  },

  // FLOW 4 — Behavior trigger (link clicked)
  behavior_trigger: {
    de: ({ name, hotel }) => ({
      subject: `Ich habe gesehen, dass Sie sich ${hotel} angeschaut haben`,
      text: `Hallo ${name},

ich habe gesehen, dass Sie sich die Möglichkeiten für ${hotel} angeschaut haben.

Ich würde gerne kurz mit Ihnen sprechen – nicht um etwas zu verkaufen, sondern um zu verstehen, was für Sie relevant wäre.

Hätten Sie 15 Minuten diese Woche?

Mit freundlichen Grüßen,
BOORGEN Team`,
    }),
    en: ({ name, hotel }) => ({
      subject: `I saw you looked at the options for ${hotel}`,
      text: `Hi ${name},

I noticed you took a look at the possibilities for ${hotel}.

I'd love to have a quick chat — not to sell anything, but to understand what would be relevant for you.

Do you have 15 minutes this week?

Best regards,
BOORGEN Team`,
    }),
  },

  // FLOW 5 — Qualification: guide to address
  qualification_address: {
    de: ({ name }) => ({
      subject: `Kurze Bitte, ${name}`,
      text: `Hallo ${name},

um Ihnen eine konkrete Einschätzung geben zu können, brauche ich nur kurz Ihre Adresse oder einen Google Maps Link.

Das dauert 30 Sekunden – und ich kann Ihnen dann zeigen, was wirklich möglich ist.

Mit freundlichen Grüßen,
BOORGEN Team`,
    }),
    en: ({ name }) => ({
      subject: `Quick request, ${name}`,
      text: `Hi ${name},

To give you a concrete assessment, I just need your address or a Google Maps link.

It takes 30 seconds — and then I can show you what's really possible.

Best regards,
BOORGEN Team`,
    }),
  },

  // FLOW 5 — SPIN qualification
  qualification_spin: {
    de: ({ name, hotel }) => ({
      subject: `Fragen zu ${hotel} – kurze Einschätzung`,
      text: `Hallo ${name},

danke für Ihre Fragen. Bevor ich konkrete Zahlen nenne, würde ich gerne kurz verstehen:

• Wie ist Ihre aktuelle Auslastung bei ${hotel}?
• Wo stoßen Sie aktuell an Grenzen (Kapazität, Personal, Umsatz)?
• Was würde es für Sie bedeuten, wenn Sie 20–30% mehr Einheiten hätten?

Diese Antworten helfen mir, Ihnen etwas wirklich Relevantes zu zeigen – kein Standard-Pitch.

Mit freundlichen Grüßen,
BOORGEN Team`,
    }),
    en: ({ name, hotel }) => ({
      subject: `Questions about ${hotel} — quick assessment`,
      text: `Hi ${name},

Thank you for your questions. Before I give specific numbers, I'd like to briefly understand:

• What is your current occupancy at ${hotel}?
• Where are you hitting limits right now (capacity, staff, revenue)?
• What would it mean for you to have 20–30% more units?

These answers help me show you something truly relevant — no standard pitch.

Best regards,
BOORGEN Team`,
    }),
  },

  // FLOW 6 — Call Warm-up (1 day before)
  call_warmup: {
    de: ({ name, hotel }) => ({
      subject: `Morgen unser Gespräch – kurze Vorbereitung`,
      text: `Hallo ${name},

ich freue mich auf unser Gespräch morgen.

Zur Vorbereitung: Ich werde Ihnen eine kurze Analyse für ${hotel} zeigen – konkrete Zahlen, keine Theorie.

Falls Sie vorab noch etwas wissen möchten, schreiben Sie mir gerne.

Bis morgen,
BOORGEN Team`,
    }),
    en: ({ name, hotel }) => ({
      subject: `Tomorrow's call — quick prep`,
      text: `Hi ${name},

Looking forward to our call tomorrow.

To prepare: I'll show you a brief analysis for ${hotel} — concrete numbers, no theory.

If you have any questions beforehand, feel free to reach out.

See you tomorrow,
BOORGEN Team`,
    }),
  },

  // FLOW 8 — Re-engagement (90 days)
  re_engagement: {
    de: ({ name, hotel, location }) => ({
      subject: `Update für ${hotel} – neue Möglichkeiten`,
      text: `Hallo ${name},

es ist eine Weile her, seit wir zuletzt gesprochen haben.

Seitdem hat sich einiges getan – Hotels in ${location} haben neue Wege gefunden, ihre Kapazität zu erweitern.

Ich wollte kurz fragen, ob das Thema für ${hotel} jetzt relevanter geworden ist.

Mit freundlichen Grüßen,
BOORGEN Team`,
    }),
    en: ({ name, hotel, location }) => ({
      subject: `Update for ${hotel} — new opportunities`,
      text: `Hi ${name},

It's been a while since we last spoke.

Since then, things have moved — hotels in ${location} have found new ways to expand their capacity.

I wanted to check if this topic has become more relevant for ${hotel} now.

Best regards,
BOORGEN Team`,
    }),
  },
};

/**
 * Get email content for a given template and language.
 */
function getTemplate(type, lang = 'de', data = {}) {
  const tmpl = templates[type];
  if (!tmpl) throw new Error(`Unknown template: ${type}`);
  const langFn = tmpl[lang] || tmpl['de'];
  return langFn(data);
}

module.exports = { getTemplate, templates };
