import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userName, userEmail, sprintDay, module } = req.body

  console.log('🔔 Proof Review Notification:', { userName, sprintDay, module })

  try {
    await resend.emails.send({
      from: 'MVP Buildr <onboarding@resend.dev>',
      to: 'energetekk@proton.me',
      subject: `🎯 Proof Review: ${userName} - Tag ${sprintDay}`,
      html: `
        <h2>Neuer Proof wartet auf Review!</h2>
        <p><strong>User:</strong> ${userName} (${userEmail})</p>
        <p><strong>Modul:</strong> ${module.toUpperCase()}</p>
        <p><strong>Sprint-Tag:</strong> ${sprintDay}</p>
        <p><strong>Status:</strong> Wartet auf manuelle Freigabe</p>
        <br/>
        <p>
          <a href="http://localhost:3000/admin/reviews" 
             style="background: #2563eb; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 8px; display: inline-block;">
            → Zum Review Panel
          </a>
        </p>
      `
    })

    console.log('✅ Notification sent')
    res.status(200).json({ success: true })
  } catch (error) {
    console.error('❌ Error:', error)
    res.status(500).json({ error: error.message })
  }
}
