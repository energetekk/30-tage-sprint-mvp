import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userEmail, userName, sprintDay, adminNotes } = req.body

  console.log('✅ Approving proof:', { userEmail, sprintDay })

  try {
    await resend.emails.send({
      from: 'MVP Buildr <onboarding@resend.dev>',
      to: userEmail,
      subject: `✅ Proof freigegeben - Tag ${sprintDay}!`,
      html: `
        <h2>🎉 Dein Proof wurde freigegeben!</h2>
        <p>Hallo ${userName},</p>
        <p>Glückwunsch! Dein Proof von <strong>Tag ${sprintDay}</strong> wurde geprüft und freigegeben.</p>
        
        ${adminNotes ? `
          <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 16px; margin: 20px 0;">
            <p><strong>Feedback:</strong></p>
            <p>${adminNotes}</p>
          </div>
        ` : ''}

        <p>Du kannst jetzt mit dem nächsten Schritt weitermachen!</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://mvpbuildr.com/dashboard" 
             style="background: #10b981; color: white; padding: 14px 28px; 
                    text-decoration: none; border-radius: 8px; display: inline-block;">
            → Zum Dashboard
          </a>
        </div>

        <p>Weiter so! 💪</p>
        <p>Dein MVP Buildr Team</p>
      `
    })

    console.log('✅ Approval email sent')
    res.status(200).json({ success: true })
  } catch (error) {
    console.error('❌ Error:', error)
    res.status(500).json({ error: error.message })
  }
}
