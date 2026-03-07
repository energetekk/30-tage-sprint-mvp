import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  // Security: Only Vercel Cron or secret
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  console.log('🕐 Checkin Reminder Cron started...')

  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    // Get all active users
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('application_status', 'accepted')
      .eq('paused', false)
      .not('accepted_at', 'is', null)

    if (error) throw error

    console.log(`📊 Found ${users.length} active users`)

    let remindersS

ent = 0
    let usersPaused = 0

    for (const user of users) {
      try {
        const acceptedDate = new Date(user.accepted_at)
        acceptedDate.setHours(0, 0, 0, 0)
        
        const daysSince = Math.floor((today - acceptedDate) / (1000 * 60 * 60 * 24))
        
        // Skip day 0 and finished sprints
        const moduleDays = {
          'bronze': 13,
          'silber': 21,
          'gold': 30
        }
        const totalDays = moduleDays[user.module] || 13
        
        if (daysSince <= 0 || daysSince > totalDays) {
          continue
        }

        const yesterdayDay = daysSince - 1
        
        // Check if user did yesterday's checkin
        const { data: yesterdayCheckin } = await supabase
          .from('daily_responses')
          .select('*')
          .eq('user_id', user.id)
          .eq('sprint_day', yesterdayDay)
          .maybeSingle()

        const didYesterdayCheckin = !!yesterdayCheckin

        if (!didYesterdayCheckin) {
          // User missed yesterday's checkin
          const newMissedCount = (user.missed_checkins_count || 0) + 1

          // Update missed count
          await supabase
            .from('users')
            .update({ missed_checkins_count: newMissedCount })
            .eq('id', user.id)

          // Check if yesterday was a milestone day
          const milestones = {
            'bronze': [7, 13],
            'silber': [7, 14, 21],
            'gold': [7, 14, 21, 30]
          }
          const isMilestone = (milestones[user.module] || []).includes(yesterdayDay)

          if (isMilestone) {
            // Pause user for missing milestone checkin
            await supabase
              .from('users')
              .update({
                paused: true,
                paused_reason: `Meilenstein-Checkin Tag ${yesterdayDay} verpasst`,
                paused_at: new Date().toISOString()
              })
              .eq('id', user.id)

            // Notify admin
            await resend.emails.send({
              from: 'MVP Buildr <onboarding@resend.dev>',
              to: 'energetekk@proton.me',
              subject: `🚨 User pausiert: ${user.full_name}`,
              html: `
                <h2>User wurde automatisch pausiert</h2>
                <p><strong>User:</strong> ${user.full_name} (${user.email})</p>
                <p><strong>Grund:</strong> Meilenstein-Checkin Tag ${yesterdayDay} verpasst</p>
                <p><strong>Modul:</strong> ${user.module.toUpperCase()}</p>
              `
            })

            // Notify user
            await resend.emails.send({
              from: 'MVP Buildr <onboarding@resend.dev>',
              to: user.email,
              subject: '⏸️ Sprint pausiert - Kontakt aufnehmen',
              html: `
                <h2>Hallo ${user.full_name},</h2>
                <p>Dein Sprint wurde pausiert, weil du den wichtigen Meilenstein-Checkin von Tag ${yesterdayDay} verpasst hast.</p>
                <p><strong>Was jetzt?</strong></p>
                <p>Schreib uns kurz in der Telegram Gruppe oder per Email, was los ist. Wir finden eine Lösung!</p>
                <p>Kein Problem wenn etwas dazwischen gekommen ist - melde dich einfach!</p>
                <p>
                  <a href="https://t.me/+bQLoydJB1ilmYTc0">→ Zur Telegram Gruppe</a>
                </p>
              `
            })

            usersPaused++
            console.log(`⏸️ Paused: ${user.email} (missed milestone day ${yesterdayDay})`)

          } else if (newMissedCount >= 2) {
            // Send reminder after 2 consecutive misses
            await resend.emails.send({
              from: 'MVP Buildr <onboarding@resend.dev>',
              to: user.email,
              subject: '💭 Ist alles okay?',
              html: `
                <h2>Hey ${user.full_name},</h2>
                <p>Uns ist aufgefallen, dass du die letzten ${newMissedCount} Tage keinen Checkin gemacht hast.</p>
                <p><strong>Ist alles in Ordnung?</strong></p>
                <p>Wenn etwas dazwischen gekommen ist oder du Fragen hast, melde dich gerne in der Telegram Gruppe oder per Email!</p>
                <p>Wir sind hier um zu helfen. 💪</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://mvpbuildr.com/dashboard" 
                     style="background: #2563eb; color: white; padding: 14px 28px; 
                            text-decoration: none; border-radius: 8px; display: inline-block;">
                    → Zum Dashboard
                  </a>
                </div>
                <p>Dein MVP Buildr Team</p>
              `
            })

            reminders Sent++
            console.log(`📧 Reminder sent: ${user.email} (missed ${newMissedCount} days)`)
          }
        }

      } catch (userError) {
        console.error(`❌ Error for user ${user.email}:`, userError)
      }
    }

    console.log(`✅ Cron finished: ${remindersen} reminders, ${usersPaused} users paused`)

    res.status(200).json({
      success: true,
      remindersSent,
      usersPaused,
      totalUsers: users.length
    })

  } catch (error) {
    console.error('❌ Cron error:', error)
    res.status(500).json({ error: error.message })
  }
}
