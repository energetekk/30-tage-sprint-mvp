import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  console.log('\n=== REJECT APPLICATION ===')
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId, email, name } = req.body
  console.log('User ID:', userId)
  console.log('Email:', email)

  try {
    // 1. Update database
    console.log('📝 Updating database...')
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        application_status: 'rejected',
        reviewed_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('❌ DB Update Error:', updateError)
      throw updateError
    }

    console.log('✅ Database updated')

    // 2. Send rejection email
    console.log('📧 Sending rejection email...')
    
    try {
      await resend.emails.send({
        from: 'MVP Buildr <onboarding@resend.dev>',
        to: email,
        subject: 'Deine Beta-Bewerbung - Update',
        html: `
          <h2>Hallo ${name},</h2>
          <p>vielen Dank für deine Bewerbung zum 30-Tage Sprint Beta-Programm!</p>
          <p>Leider können wir dich für diese Beta-Runde nicht berücksichtigen. Die Plätze sind begrenzt und wir mussten eine Auswahl treffen.</p>
          <p>Das bedeutet aber nicht, dass deine Idee nicht gut ist! Wir ermutigen dich, trotzdem mit deinem Projekt zu starten.</p>
          <p><strong>Was du tun kannst:</strong></p>
          <ul>
            <li>Starte selbstständig mit deinem Projekt</li>
            <li>Bewerbe dich für die nächste Beta-Runde</li>
            <li>Folge uns für Updates: <a href="https://mvpbuildr.com">mvpbuildr.com</a></li>
          </ul>
          <p>Viel Erfolg mit deinem Projekt! 🚀</p>
          <p>Beste Grüße,<br/>Dein MVP Buildr Team</p>
        `
      })
      
      console.log('✅ Rejection email sent')
    } catch (emailError) {
      console.error('⚠️ Email error (non-critical):', emailError)
    }

    console.log('=== SUCCESS ===\n')
    
    res.status(200).json({ 
      success: true, 
      message: 'User rejected and notified'
    })

  } catch (error) {
    console.error('❌ ERROR:', error)
    console.log('=== END ===\n')
    
    res.status(500).json({ 
      error: error.message
    })
  }
}
