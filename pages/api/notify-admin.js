import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  console.log('\n=== NOTIFY ADMIN API CALLED ===')
  console.log('Method:', req.method)
  
  if (req.method !== 'POST') {
    console.log('❌ Wrong method')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, email, projectIdea } = req.body
  
  console.log('📝 Request body:', { name, email, projectIdea: projectIdea?.substring(0, 30) })
  console.log('🔑 API Key exists:', !!process.env.RESEND_API_KEY)
  console.log('🔑 API Key preview:', process.env.RESEND_API_KEY?.substring(0, 15) + '...')

  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not set!')
    return res.status(500).json({ error: 'API Key missing' })
  }

  try {
    console.log('📧 Sending email...')
    
    const result = await resend.emails.send({
      from: 'MVP Buildr <onboarding@resend.dev>',
      to: 'igilepic@gmail.com', // ← DEINE EMAIL HIER
      subject: '🔔 Neue Beta-Bewerbung - TEST',
      html: `
        <h2>Neue Bewerbung eingegangen!</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Projekt:</strong> ${projectIdea}</p>
        <p><em>Dies ist ein Test</em></p>
      `
    })

    console.log('✅ Email sent!')
    console.log('📬 Email ID:', result.id)
    console.log('=== END ===\n')
    
    return res.status(200).json({ 
      success: true, 
      id: result.id,
      message: 'Email sent via Resend'
    })
    
  } catch (error) {
    console.error('❌ ERROR sending email:')
    console.error('Message:', error.message)
    console.error('Stack:', error.stack)
    console.log('=== END ===\n')
    
    return res.status(500).json({ 
      success: false,
      error: error.message,
      details: error.toString()
    })
  }
}
