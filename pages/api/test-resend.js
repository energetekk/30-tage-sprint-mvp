import { Resend } from 'resend'

export default async function handler(req, res) {
  console.log('🧪 Testing Resend...')
  
  const apiKey = process.env.RESEND_API_KEY
  
  console.log('🔑 API Key exists:', !!apiKey)
  console.log('🔑 API Key length:', apiKey?.length)
  console.log('🔑 API Key starts with:', apiKey?.substring(0, 10))
  
  if (!apiKey) {
    return res.status(500).json({ error: 'API Key missing' })
  }
  
  try {
    const resend = new Resend(apiKey)
    
    console.log('📧 Attempting to send test email...')
    
    const result = await resend.emails.send({
      from: 'Test <onboarding@resend.dev>',
      to: 'igilepic@gmail.com', // ← Deine Gmail hier
      subject: 'Test Email',
      html: '<h1>Test funktioniert!</h1><p>Wenn du das siehst, funktioniert Resend!</p>'
    })
    
    console.log('✅ Success! Email ID:', result.id)
    
    res.status(200).json({ 
      success: true, 
      id: result.id,
      message: 'Check your email and Resend dashboard!'
    })
  } catch (error) {
    console.error('❌ Error:', error)
    res.status(500).json({ 
      error: error.message,
      stack: error.stack 
    })
  }
}

