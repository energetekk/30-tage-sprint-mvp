import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userEmail, userName, sprintDay, reason } = req.body

  console.log('❌ Rejecting proof:', { userEmail, sprintDay })

  try {
    // Send rejection email
    await resend.emails.send({
      from: 'MVP Buildr <onboarding@resend.dev>',
      to: userEmail,
      subject: `Proof Tag ${sprintDay} - Feedback`,
      html: `
        <h2>Feedback zu deinem Proof (Tag ${sprintDay})</h2>
        <p>Hallo ${userName},</p>
        <p>Dein Proof von Tag ${sprintDay} benötigt noch etwas Arbeit.</p>
        
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0;">
          <p><strong>Feedback:</strong></p>
          <p>${reason}</p>
        </div>

        <p><strong>Nächste Schritte:</strong></p>
        <ul>
          <li>Überarbeite deinen Proof basierend auf dem Feedback</li>
          <li>Reiche den Proof erneut im Dashboard ein</li>
          <li>Wir schauen uns das dann nochmal an</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://mvpbuildr.com/dashboard" 
             style="background: #2563eb; color: white; padding: 14px 28px; 
                    text-decoration: none; border-radius: 8px; display: inline-block;">
            → Zum Dashboard
          </a>
        </div>

        <p>Lass dich nicht entmutigen - du schaffst das! 💪</p>
        <p>Bei Fragen melde dich in der Telegram Gruppe.</p>
        <p>Dein MVP Buildr Team</p>
      `
    })

    console.log('✅ Rejection email sent')
    res.status(200).json({ success: true })
  } catch (error) {
    console.error('❌ Error:', error)
    res.status(500).json({ error: error.message })
  }
}
