import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quickValidation, setQuickValidation] = useState({
    q1: '',
    q2: '',
    q3: ''
  })
  const [validationSaved, setValidationSaved] = useState(false)

  useEffect(() => {
    fetchUser()
  }, [])

  async function fetchUser() {
    try {
      const testUserId = '16b30cac-9ecb-49e2-97ff-15d39eacda75'
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', testUserId)
        .single()

      if (error) throw error

      setUser(data)
      
      if (data.quick_validation) {
        setValidationSaved(true)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Fehler beim Laden: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  function calculateDaysSinceTag0() {
    if (!user?.tag0_completed_at) return null
    
    const tag0Date = new Date(user.tag0_completed_at)
    const now = new Date()
    const diffMs = now - tag0Date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    return diffDays
  }

  function getSprintStatus() {
    const days = calculateDaysSinceTag0()
    
    if (days === null) {
      return {
        status: 'not_started',
        message: 'Onboarding noch nicht abgeschlossen',
        color: '#ef4444'
      }
    }
    
    if (days < 3) {
      return {
        status: 'waiting',
        message: `Sprint startet in ${3 - days} Tag${3 - days === 1 ? '' : 'en'}`,
        daysRemaining: 3 - days,
        color: '#f59e0b'
      }
    }
    
    const sprintDay = days - 2
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

  async function saveQuickValidation() {
    if (!quickValidation.q1 || !quickValidation.q2 || !quickValidation.q3) {
      alert('Bitte alle 3 Fragen beantworten!')
      return
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({
          quick_validation: quickValidation,
          quick_validation_completed_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      setValidationSaved(true)
      alert('✅ Quick-Validation gespeichert!')
    } catch (error) {
      alert('Fehler: ' + error.message)
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
          <p>Bitte erst Onboarding ausfüllen!</p>
          <a href="/onboarding" style={styles.button}>
            Zum Onboarding →
          </a>
        </div>
      </div>
    )
  }

  const sprintStatus = getSprintStatus()
  const daysSinceTag0 = calculateDaysSinceTag0()
  const showQuickValidation = daysSinceTag0 !== null && daysSinceTag0 < 3 && !validationSaved
  const canEditOnboarding = daysSinceTag0 !== null && daysSinceTag0 < 3

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
            {sprintStatus.status === 'waiting' ? 'Vorbereitung' :
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

        {sprintStatus.status === 'waiting' && (
          <div style={styles.countdownBox}>
            <div style={styles.countdownNumber}>
              {sprintStatus.daysRemaining}
            </div>
            <div style={styles.countdownLabel}>
              Tag{sprintStatus.daysRemaining === 1 ? '' : 'e'} bis Sprint-Start
            </div>
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
            <span style={styles.infoBadge}>
              {user.skill_level}
            </span>
          </div>
        </div>
      </div>

      {/* Quick-Validation */}
      {showQuickValidation && (
        <div style={styles.card}>
          <div style={styles.validationHeader}>
            <h3 style={styles.cardTitle}>
              🎯 Quick-Validation (Optional)
            </h3>
            <span style={styles.optionalBadge}>Optional</span>
          </div>
          <p style={styles.validationSubtitle}>
            Nutze die Wartezeit um dein Projekt zu validieren! (je 5 Min)
          </p>

          <div style={styles.questionBox}>
            <label style={styles.questionLabel}>
              1. Wer hat dieses Problem auch?
            </label>
            <textarea
              value={quickValidation.q1}
              onChange={(e) => setQuickValidation({...quickValidation, q1: e.target.value})}
              style={styles.textarea}
              placeholder="z.B. Freelancer, Studenten, Gründer..."
              rows={2}
            />
          </div>

          <div style={styles.questionBox}>
            <label style={styles.questionLabel}>
              2. Was ist die simpleste Lösung?
            </label>
            <textarea
              value={quickValidation.q2}
              onChange={(e) => setQuickValidation({...quickValidation, q2: e.target.value})}
              style={styles.textarea}
              placeholder="MVP ohne Schnickschnack..."
              rows={2}
            />
          </div>

          <div style={styles.questionBox}>
            <label style={styles.questionLabel}>
              3. Womit könntest du heute starten?
            </label>
            <textarea
              value={quickValidation.q3}
              onChange={(e) => setQuickValidation({...quickValidation, q3: e.target.value})}
              style={styles.textarea}
              placeholder="Konkrete erste Schritte..."
              rows={2}
            />
          </div>

          <button 
            onClick={saveQuickValidation}
            style={styles.saveButton}
          >
            💾 Speichern
          </button>
        </div>
      )}

      {validationSaved && (
        <div style={styles.successCard}>
          ✅ Quick-Validation gespeichert! Super vorbereitet! 🎉
        </div>
      )}

      {/* Next Steps */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Was passiert als nächstes?</h3>
        <div style={styles.nextSteps}>
          {sprintStatus.status === 'waiting' && (
            <>
              <div style={styles.step}>
                <div style={styles.stepNumber}>1</div>
                <div>
                  <strong>Jetzt:</strong> Bereite dich mental vor. 
                  Optional: Quick-Validation oben ausfüllen.
                </div>
              </div>
              <div style={styles.step}>
                <div style={styles.stepNumber}>2</div>
                <div>
                  <strong>Tag 4:</strong> Dein Sprint startet! 
                  Du bekommst deinen ersten Prompt per Email.
                </div>
              </div>
              <div style={styles.step}>
                <div style={styles.stepNumber}>3</div>
                <div>
                  <strong>Täglich:</strong> 30-45 Min am Projekt arbeiten.
                </div>
              </div>
            </>
          )}
          
          {sprintStatus.status === 'active' && (
            <>
              <div style={styles.step}>
                <div style={styles.stepNumber}>✓</div>
                <div>
                  <strong>Sprint läuft!</strong> Check deine Emails für den heutigen Prompt.
                </div>
              </div>
              <div style={styles.step}>
                <div style={styles.stepNumber}>📅</div>
                <div>
                  <strong>Tag {sprintStatus.currentDay}:</strong> Arbeite heute 30-45 Min.
                </div>
              </div>
            </>
          )}

          {sprintStatus.status === 'completed' && (
            <div style={styles.step}>
              <div style={styles.stepNumber}>🎉</div>
              <div>
                <strong>Gratulation!</strong> Du hast den Sprint abgeschlossen!
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Community & Quick Links */}
      <div style={styles.quickLinks}>
        {/* Onboarding Edit - nur während Warmup */}
        {canEditOnboarding ? (
          <a href="/onboarding" style={styles.link}>
            ✏️ Onboarding bearbeiten
          </a>
        ) : (
          <span style={{...styles.link, opacity: 0.5, cursor: 'not-allowed'}} title="Nur bis Tag 2 editierbar">
            🔒 Onboarding (locked)
          </span>
        )}
        
        {/* Telegram Community - immer sichtbar */}
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
    color: '#92400e'
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
  validationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  optionalBadge: {
    padding: '4px 10px',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500'
  },
  validationSubtitle: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '25px'
  },
  questionBox: {
    marginBottom: '20px'
  },
  questionLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px'
  },
  textarea: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
    boxSizing: 'border-box'
  },
  saveButton: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#2563eb',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '10px'
  },
  successCard: {
    maxWidth: '900px',
    margin: '0 auto 20px',
    padding: '20px',
    backgroundColor: '#d1fae5',
    border: '2px solid #10b981',
    borderRadius: '12px',
    textAlign: 'center',
    fontSize: '16px',
    color: '#065f46'
  },
  nextSteps: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  step: {
    display: 'flex',
    gap: '15px',
    padding: '15px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px'
  },
  stepNumber: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#2563eb',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    flexShrink: 0
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
