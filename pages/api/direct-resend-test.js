export default async function handler(req, res) {
  const apiKey = process.env.RESEND_API_KEY
  
  console.log('🧪 Direct Resend Test')
  console.log('Key:', apiKey?.substring(0, 10))
  
  try {
    // Direct fetch to Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Test <onboarding@resend.dev>',
        to: ['energetekk@proton.me'],
        subject: 'Direct API Test',
        html: '<p>Direct API call works!</p>'
      })
    })
    
    const data = await response.json()
    
    console.log('Response status:', response.status)
    console.log('Response data:', data)
    
    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Resend API failed',
        details: data
      })
    }
    
    res.status(200).json({
      success: true,
      emailId: data.id,
      fullResponse: data
    })
    
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: error.message })
  }
}

