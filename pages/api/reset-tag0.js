import { supabaseAdmin } from '../../lib/supabaseAdmin'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { user_id } = req.body

  try {
    const { error } = await supabaseAdmin
      .from('users')
      .update({
        tag0_completed_at: new Date().toISOString(),
        quick_validation: null,
        quick_validation_completed_at: null
      })
      .eq('id', user_id)

    if (error) throw error

    res.status(200).json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
