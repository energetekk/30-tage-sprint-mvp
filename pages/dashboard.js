import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
  }, [])

  async function fetchUser() {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        window.location.href = '/login'
        return
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', authUser.email)
        .single()

      if (error) throw error
      setUser(data)
    } catch (error) {
      console.error('Error:', error)
      alert('Fehler beim Laden: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  function calculateDaysSinceAcceptance() {
    if (!user?.accepted_at) return null
    
    const acceptedDate = new Date(user.accepted_at)
    const now = new Date()
    const diffMs = now - acceptedDate
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    return diffDays
  }

  function getSprintStatus() {
    const days = calculateDaysSinceAcceptance()
    
    if (days === null) {
      return {
        status: 'not_started',
        message: 'Fehler: Kein Akzeptanz-Datum',
        color: '#ef4444'
      }
    }
    
    // Tag 0 = Akzeptanz-Tag (heute)
    if (days === 0) {
      return {
        status: 'ready',
        message: 'Sprint startet morgen!',
        daysRemaining: 1,
        color: '#f59e0b'
      }
    }
    
    // Tag 1+ = Sprint läuft
    const sprintDay = days
    const maxDays = user.module === 'bronze' ? 13 : 
                    user.module === 'silber' ? 21 : 
                    user.module === 'gold' ? 30 : 60
    
    if (sprintDay <= maxDays) {
      return {
        status: 'active',
        message: `Tag ${sprintDay} von ${maxDays}`,
        currentDay: sprintDay,
        maxDays: maxDays,
        progress: (sprintDay / maxDays) * 100,
        color: '#10b981'
      }
    }
    
    return {
      status: 'completed',
      message: 'Sprint abgeschlossen! 🎉',
      color: '#8b5cf6'
    }
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingBox}>
          <h2>⏳ Lädt...</h2>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <h2>❌ User nicht gefunden</h2>
          <p>Bitte erst bewerben!</p>
          <a href="/beta" style={styles.button}>
            Zur Bewerbung →
          </a>
        </div>
      </div>
    )
  }

  const sprintStatus = getSprintStatus()
  const daysSinceAcceptance = calculateDaysSinceAcceptance()

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Dashboard</h1>
          <p style={styles.subtitle}>Willkommen zurück, {user.full_name}! 👋</p>
        </div>
        <a href="/" style={styles.logoutButton}>← Zurück</a>
      </div>

      {/* Status Card */}
      <div style={{...styles.card, borderLeft: `4px solid ${sprintStatus.color}`}}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>
            {user.module.toUpperCase()} Sprint
          </h2>
          <span style={{
            ...styles.badge,
            backgroundColor: sprintStatus.color
          }}>
            {sprintStatus.status === 'ready' ? 'Bereit' :
             sprintStatus.status === 'active' ? 'Aktiv' :
             sprintStatus.status === 'completed' ? 'Abgeschlossen' : 'Wartend'}
          </span>
        </div>

        <div style={styles.statusMessage}>
          {sprintStatus.message}
        </div>

        {sprintStatus.status === 'active' && (
          <div style={styles.progressContainer}>
            <div style={{
              ...styles.progressBar,
              width: `${sprintStatus.progress}%`
            }} />
          </div>
        )}

        {sprintStatus.status === 'ready' && (
          <div style={styles.countdownBox}>
            <div style={styles.countdownNumber}>1</div>
            <div style={styles.countdownLabel}>Tag bis Sprint-Start</div>
            <p style={{marginTop: '20px', fontSize: '16px', color: '#92400e'}}>
              Morgen erhältst du deinen ersten Prompt per Email!
            </p>
          </div>
        )}
      </div>

      {/* Project Info Card */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Dein Projekt</h3>
        <div style={styles.projectInfo}>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Projektidee:</span>
            <span style={styles.infoValue}>{user.project_idea}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Ziel:</span>
            <span style={styles.infoValue}>{user.goal_definition}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Warum wichtig:</span>
            <span style={styles.infoValue}>{user.why_important}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Skill-Level:</span>
            <span style={styles.infoBadge}>{user.skill_level}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Produkttyp:</span>
            <span style={styles.infoBadge}>{user.product_type}</span>
          </div>
        </div>
      </div>

      {/* Community Link */}
      <div style={styles.quickLinks}>
        <a 
          href="https://t.me/+bQLoydJB1ilmYTc0" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{...styles.link, backgroundColor: '#0088cc', color: 'white', border: 'none'}}
        >
          💬 Telegram Gruppe
        </a>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  loadingBox: {
    maxWidth: '600px',
    margin: '100px auto',
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '60px',
    textAlign: 'center'
  },
  errorBox: {
    maxWidth: '600px',
    margin: '100px auto',
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '60px',
    textAlign: 'center'
  },
  header: {
    maxWidth: '900px',
    margin: '0 auto 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#111',
    marginBottom: '5px'
  },
  subtitle: {
    fontSize: '16px',
    color: '#666'
  },
  logoutButton: {
    padding: '10px 20px',
    backgroundColor: '#6b7280',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '14px'
  },
  card: {
    maxWidth: '900px',
    margin: '0 auto 20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    padding: '30px'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111',
    marginBottom: '15px'
  },
  badge: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'white'
  },
  statusMessage: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#111',
    marginBottom: '20px'
  },
  progressContainer: {
    width: '100%',
    height: '12px',
    backgroundColor: '#e5e7eb',
    borderRadius: '6px',
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: '6px',
    transition: 'width 0.3s ease'
  },
  countdownBox: {
    textAlign: 'center',
    padding: '30px',
    backgroundColor: '#fef3c7',
    borderRadius: '12px',
    marginTop: '20px'
  },
  countdownNumber: {
    fontSize: '64px',
    fontWeight: 'bold',
    color: '#f59e0b',
    marginBottom: '10px'
  },
  countdownLabel: {
    fontSize: '18px',
    color: '#92400e',
    fontWeight: '600'
  },
  projectInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  infoRow: {
    display: 'flex',
    gap: '15px',
    alignItems: 'flex-start'
  },
  infoLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#6b7280',
    minWidth: '130px'
  },
  infoValue: {
    fontSize: '14px',
    color: '#111',
    flex: 1
  },
  infoBadge: {
    padding: '4px 12px',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '500'
  },
  quickLinks: {
    maxWidth: '900px',
    margin: '30px auto',
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  link: {
    padding: '12px 24px',
    backgroundColor: 'white',
    color: '#2563eb',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    border: '2px solid #e5e7eb',
    transition: 'all 0.2s',
    display: 'inline-block'
  },
  button: {
    display: 'inline-block',
    padding: '12px 24px',
    backgroundColor: '#2563eb',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500'
  }
}
