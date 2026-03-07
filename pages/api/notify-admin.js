import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userName, userEmail, skillLevel, projectPhase, module, projectIdea } = req.body

  console.log('📧 Sending admin notification:', { userName, userEmail, module })

  // Formatiere Skill Level für Email
  const skillLabels = {
    'anfänger': 'Anfänger - Erste Schritte',
    'fortgeschritten': 'Fortgeschritten - Selbstständig',
    'profi': 'Profi - Mehrere Projekte'
  }

  // Formatiere Projektphase für Email
  const phaseLabels = {
    'nur_idee': 'Nur Idee - Noch kein Code',
    'konzept': 'Konzept vorhanden',
    'begonnen': 'Begonnen - Erste Features',
    'fast_fertig': 'Fast fertig - Finaler Push'
  }

  // Formatiere Modul für Email
  const moduleLabels = {
    'bronze': 'Bronze (13 Tage)',
    'silber': 'Silber (21 Tage)',
    'gold': 'Gold (30 Tage)'
  }

  try {
    await resend.emails.send({
      from: 'MVP Buildr <onboarding@resend.dev>',
      to: 'energetekk@proton.me',
      subject: `🎯 Neue Bewerbung: ${userName}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Neue Sprint-Bewerbung</h2>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Bewerber-Info</h3>
            <p><strong>Name:</strong> ${userName}</p>
            <p><strong>Email:</strong> ${userEmail}</p>
          </div>

          <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <h3 style="margin-top: 0;">Automatisches Matching</h3>
            <p><strong>Skill Level:</strong> ${skillLabels[skillLevel] || skillLevel}</p>
            <p><strong>Projektphase:</strong> ${phaseLabels[projectPhase] || projectPhase}</p>
            <p style="font-size: 18px; color: #2563eb;"><strong>→ Zugewiesenes Modul:</strong> ${moduleLabels[module] || module}</p>
          </div>

          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Projekt-Idee</h3>
            <p>${projectIdea}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3000/admin" 
               style="background: #2563eb; color: white; padding: 14px 28px; 
                      text-decoration: none; border-radius: 8px; display: inline-block;">
              → Zum Admin Panel
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Das Modul wurde automatisch basierend auf Skill-Level und Projektphase berechnet.
            Du kannst es bei Bedarf im Admin Panel manuell anpassen.
          </p>
        </div>
      `
    })

    console.log('✅ Admin notification sent')
    res.status(200).json({ success: true })
  } catch (error) {
    console.error('❌ Email error:', error)
    res.status(500).json({ error: error.message })
  }
}
