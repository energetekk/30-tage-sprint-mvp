import { Resend } from 'resend'

export default async function handler(req, res) {
  const apiKey = process.env.RESEND_API_KEY
  
  console.log('🔑 Verifying Resend API Key...')
  console.log('Key:', apiKey?.substring(0, 15) + '...')
  
  if (!apiKey) {
    return res.status(500).json({ error: 'No API key' })
  }
  
  try {
    const resend = new Resend(apiKey)
    
    // Try to list domains (simple API call to verify key)
    const domains = await resend.domains.list()
    
    console.log('✅ API Key is VALID!')
    console.log('Domains:', domains)
    
    res.status(200).json({ 
      valid: true,
      domains: domains.data
    })
  } catch (error) {
    console.error('❌ API Key INVALID:', error.message)
    
    res.status(401).json({ 
      valid: false,
      error: error.message 
    })
  }
}
