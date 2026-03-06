import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  console.log('=== ACCEPT APPLICATION ===')
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId, email, name } = req.body
  console.log('User ID:', userId)
  console.log('Email:', email)

  try {
    const acceptedAt = new Date()

    console.log('Updating database...')
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        application_status: 'accepted',
        accepted_at: acceptedAt.toISOString(),
      })
      .eq('id', userId)

    if (updateError) {
      console.error('DB Update Error:', updateError)
      throw updateError
    }

    console.log('Database updated successfully')

    console.log('Creating auth user...')
    
    try {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        email,
        {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`
        }
      )

      if (authError) {
        console.error('Auth Error:', authError.message)
      } else {
        console.log('Auth user created:', authData?.user?.id)
      }
    } catch (authError) {
      console.error('Auth error:', authError)
    }

    console.log('=== SUCCESS ===')
    
    res.status(200).json({ 
      success: true, 
      message: 'User accepted and invited'
    })

  } catch (error) {
    console.error('ERROR:', error)
    
    res.status(500).json({ 
      error: error.message,
      details: error.toString()
    })
  }
}
