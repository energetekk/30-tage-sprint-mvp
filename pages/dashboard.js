import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sprintDay, setSprintDay] = useState(0)
  const [totalDays, setTotalDays] = useState(0)
  const [todayCheckin, setTodayCheckin] = useState(null)
  const [showCheckinForm, setShowCheckinForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    finalProjectIdea: '',
    finalGoalDefinition: '',
    whatDone: '',
    blockade: '',
    whatExists: '',
    proofUrl: '',
    proofFile: null
  })

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        router.push('/login')
        return
      }

      setUser(authUser)
      await loadUserData(authUser.email)
    } catch (error) {
      console.error('Auth error:', error)
      router.push('/login')
    }
  }

  async function loadUserData(email) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (error) throw error

      if (data.application_status !== 'accepted') {
        alert('Du bist noch nicht akzeptiert.')
        router.push('/login')
        return
      }

      if (data.paused) {
        alert('Dein Sprint wurde pausiert. Grund: ' + (data.paused_reason || 'Unbekannt'))
      }

      setUserData(data)
      calculateSprintDay(data)
      await loadTodayCheckin(data.id, data)
    } catch (error) {
      console.error('Error loading user:', error)
    } finally {
      setLoading(false)
    }
  }

  function calculateSprintDay(userData) {
    const acceptedDate = new Date(userData.accepted_at)
    acceptedDate.setHours(0, 0, 0, 0)
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const daysSince = Math.floor((today - acceptedDate) / (1000 * 60 * 60 * 24))
    
    const moduleDays = {
      'bronze': 13,
      'silber': 21,
      'gold': 30
    }
    
    const total = moduleDays[userData.module] || 13
    const day = daysSince
    
    setSprintDay(day)
    setTotalDays(total)
  }

  async function loadTodayCheckin(userId, userData) {
    const acceptedDate = new Date(userData.accepted_at)
    acceptedDate.setHours(0, 0, 0, 0)
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const daysSince = Math.floor((today - acceptedDate) / (1000 * 60 * 60 * 24))
    
    const { data, error } = await supabase
      .from('daily_responses')
      .select('*')
      .eq('user_id', userId)
      .eq('sprint_day', daysSince)
      .maybeSingle()

    if (!error && data) {
      setTodayCheckin(data)
      setFormData({
        finalProjectIdea: data.final_project_idea || '',
        finalGoalDefinition: data.final_goal_definition || '',
        whatDone: data.what_done || '',
        blockade: data.blockade || '',
        whatExists: data.what_exists || '',
        proofUrl: data.proof_url || '',
        proofFile: null
      })
    }
  }

  function isMilestoneDay(day, module) {
    const milestones = {
      'bronze': [7, 13],
      'silber': [7, 14, 21],
      'gold': [7, 14, 21, 30]
    }
    return (milestones[module] || []).includes(day)
  }

  function requiresManualReview(day, module) {
    const finalDays = {
      'bronze': 13,
      'silber': 21,
      'gold': 30
    }
    return day === finalDays[module]
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)

    try {
      let proofFileUrl = todayCheckin?.proof_file_url || null

      // Upload file if provided
      if (formData.proofFile) {
        proofFileUrl = await uploadProofFile(formData.proofFile)
      }

      const isMilestone = isMilestoneDay(sprintDay, userData.module)
      const needsManualReview = requiresManualReview(sprintDay, userData.module)

      const checkinData = {
        user_id: userData.id,
        sprint_day: sprintDay,
        what_done: formData.whatDone,
        blockade: formData.blockade || null,
        is_milestone: isMilestone,
        requires_manual_review: needsManualReview,
        review_status: needsManualReview ? 'pending' : (isMilestone ? 'auto_approved' : 'auto_approved')
      }

      // Add day-specific fields
      if (sprintDay === 1) {
        checkinData.final_project_idea = formData.finalProjectIdea
        checkinData.final_goal_definition = formData.finalGoalDefinition
      }

      if (isMilestone) {
        checkinData.what_exists = formData.whatExists
        checkinData.proof_url = formData.proofUrl || null
        checkinData.proof_file_url = proofFileUrl
      }

      const { error } = await supabase
        .from('daily_responses')
        .upsert(checkinData, {
          onConflict: 'user_id,sprint_day'
        })

      if (error) throw error

      // Send notification if manual review required
      if (needsManualReview) {
        await fetch('/api/notify-proof-review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userName: userData.full_name,
            userEmail: userData.email,
            sprintDay: sprintDay,
            module: userData.module
          })
        })
      }

      alert('✅ Checkin gespeichert!' + (needsManualReview ? '\n\nWarte auf manuelle Freigabe für nächsten Schritt.' : ''))
      setShowCheckinForm(false)
      await loadTodayCheckin(userData.id, userData)
    } catch (error) {
      console.error('Checkin error:', error)
      alert('❌ Fehler: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function uploadProofFile(file) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userData.id}_day${sprintDay}_${Date.now()}.${fileExt}`
    const filePath = `proofs/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('user-proofs')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('user-proofs')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>⏳ Lädt...</div>
      </div>
    )
  }

  if (!userData) {
    return null
  }

  const progress = sprintDay > 0 ? (sprintDay / totalDays) * 100 : 0
  const isMilestone = isMilestoneDay(sprintDay, userData.module)
  const needsReview = todayCheckin?.requires_manual_review && todayCheckin?.review_status === 'pending'

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Dashboard</h1>
        <div style={styles.userInfo}>
          Willkommen zurück, {userData.full_name}! 👋
        </div>
      </div>

      {/* Sprint Status */}
      <div style={styles.card}>
        <div style={styles.sprintHeader}>
          <h2 style={styles.moduleTitle}>
            {userData.module.toUpperCase()} Sprint
          </h2>
          {userData.paused && (
            <div style={styles.pausedBadge}>⏸️ Pausiert</div>
          )}
        </div>

        {sprintDay === 0 ? (
          <div style={styles.day0}>
            <h2 style={styles.day0Title}>🎉 Sprint startet morgen!</h2>
            <div style={styles.countdown}>
              <div style={styles.countdownNumber}>1</div>
              <div style={styles.countdownLabel}>Tag bis Sprint-Start</div>
            </div>
          </div>
        ) : sprintDay > totalDays ? (
          <div style={styles.completed}>
            <h2>🏆 Sprint abgeschlossen!</h2>
            <p>Glückwunsch! Du hast es geschafft!</p>
          </div>
        ) : (
          <>
            <div style={styles.dayTitle}>
              Tag {sprintDay} von {totalDays}
            </div>
            <div style={styles.progressContainer}>
              <div style={{...styles.progressBar, width: `${progress}%`}} />
            </div>
            <div style={styles.progressText}>
              {Math.round(progress)}% geschafft
            </div>
          </>
        )}
      </div>

      {/* Checkin Section */}
      {sprintDay > 0 && sprintDay <= totalDays && !userData.paused && (
        <div style={styles.card}>
          {needsReview ? (
            <div style={styles.reviewPending}>
              <h3>⏳ Warte auf Freigabe</h3>
              <p>Dein Proof von Tag {sprintDay} wird gerade geprüft.</p>
              <p>Du wirst per Email benachrichtigt sobald es freigegeben ist!</p>
            </div>
          ) : todayCheckin ? (
            <div style={styles.checkinDone}>
              <h3>✅ Heutiger Checkin erledigt</h3>
              <div style={styles.checkinSummary}>
                <p><strong>Erledigt:</strong> {todayCheckin.what_done}</p>
                {todayCheckin.blockade && (
                  <p><strong>Blockade:</strong> {todayCheckin.blockade}</p>
                )}
                {isMilestone && todayCheckin.what_exists && (
                  <p><strong>Was existiert:</strong> {todayCheckin.what_exists}</p>
                )}
                {todayCheckin.proof_url && (
                  <p><strong>Proof URL:</strong> <a href={todayCheckin.proof_url} target="_blank" rel="noopener">{todayCheckin.proof_url}</a></p>
                )}
              </div>
              <button 
                onClick={() => setShowCheckinForm(true)}
                style={styles.editButton}
              >
                Bearbeiten
              </button>
            </div>
          ) : (
            <div style={styles.checkinPrompt}>
              <h3>📝 {isMilestone ? '🎯 PROOF-TAG!' : 'Tages-Checkin'}</h3>
              <p>
                {isMilestone 
                  ? 'Heute ist ein Meilenstein-Tag! Zeige was du erreicht hast.' 
                  : 'Dokumentiere deinen heutigen Fortschritt.'}
              </p>
              <button 
                onClick={() => setShowCheckinForm(true)}
                style={styles.checkinButton}
              >
                Checkin machen
              </button>
            </div>
          )}
        </div>
      )}

      {/* Projekt Info */}
      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>Dein Projekt</h3>
        <div style={styles.projectInfo}>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Projektidee:</span>
            <span>{userData.project_idea}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Ziel:</span>
            <span>{userData.goal_definition}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Warum wichtig:</span>
            <span>{userData.why_important}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Skill-Level:</span>
            <span style={styles.badge}>{userData.skill_level}</span>
          </div>
        </div>
      </div>

      {/* Telegram Link */}
      <div style={{textAlign: 'center', margin: '30px 0'}}>
        <a 
          href="https://t.me/+bQLoydJB1ilmYTc0"
          target="_blank"
          rel="noopener noreferrer"
          style={styles.telegramButton}
        >
          💬 Telegram Gruppe
        </a>
      </div>

      {/* Checkin Form Modal */}
      {showCheckinForm && (
        <CheckinFormModal
          sprintDay={sprintDay}
          module={userData.module}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onClose={() => setShowCheckinForm(false)}
          submitting={submitting}
          isMilestone={isMilestone}
        />
      )}
    </div>
  )
}

// Checkin Form Modal Component
function CheckinFormModal({ sprintDay, module, formData, setFormData, onSubmit, onClose, submitting, isMilestone }) {
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2>Tag {sprintDay} Checkin {isMilestone && '🎯'}</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <form onSubmit={onSubmit} style={styles.form}>
          <div style={styles.modalBody}>
            
            {/* Tag 01 Special Fields */}
            {sprintDay === 1 && (
              <>
                <div style={styles.field}>
                  <label style={styles.label}>
                    Akzeptierst du die festgelegte Projektidee? *
                    <span style={styles.hint}>(in 1-2 Sätzen, final)</span>
                  </label>
                  <textarea
                    required
                    value={formData.finalProjectIdea}
                    onChange={(e) => setFormData({...formData, finalProjectIdea: e.target.value})}
                    style={styles.textarea}
                    rows={3}
                    placeholder="z.B. Eine Landingpage mit Zahlungslink für Produkt X veröffentlichen."
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>
                    Woran ist dein Projekt nach 30 Tagen objektiv "fertig"? *
                    <span style={styles.hint}>(in 1-2 Sätzen, final)</span>
                  </label>
                  <textarea
                    required
                    value={formData.finalGoalDefinition}
                    onChange={(e) => setFormData({...formData, finalGoalDefinition: e.target.value})}
                    style={styles.textarea}
                    rows={3}
                    placeholder="Ein sichtbares, überprüfbares Ergebnis - kein Gefühl, kein Prozess."
                  />
                </div>
              </>
            )}

            {/* Milestone Days: What Exists */}
            {isMilestone && (
              <div style={styles.field}>
                <label style={styles.label}>
                  Was existiert bereits? *
                </label>
                <textarea
                  required
                  value={formData.whatExists}
                  onChange={(e) => setFormData({...formData, whatExists: e.target.value})}
                  style={styles.textarea}
                  rows={4}
                  placeholder="Beschreibe was du bis jetzt gebaut hast..."
                />
              </div>
            )}

            {/* All Days: What Done */}
            <div style={styles.field}>
              <label style={styles.label}>
                {isMilestone ? 'Was habe ich heute erledigt? *' : 'Was konnte ich heute bereits erledigen? *'}
              </label>
              <textarea
                required
                value={formData.whatDone}
                onChange={(e) => setFormData({...formData, whatDone: e.target.value})}
                style={styles.textarea}
                rows={4}
                placeholder="Beschreibe deinen heutigen Fortschritt..."
              />
            </div>

            {/* Milestone Days: Proof URL */}
            {isMilestone && (
              <div style={styles.field}>
                <label style={styles.label}>
                  Sichtbarer Nachweis (URL)
                  <span style={styles.hint}>z.B. Live-Demo, GitHub, Loom Video</span>
                </label>
                <input
                  type="url"
                  value={formData.proofUrl}
                  onChange={(e) => setFormData({...formData, proofUrl: e.target.value})}
                  style={styles.input}
                  placeholder="https://..."
                />
              </div>
            )}

            {/* Milestone Days: Proof File Upload */}
            {isMilestone && (
              <div style={styles.field}>
                <label style={styles.label}>
                  Sichtbarer Nachweis (Foto, Dokument, Scan...)
                  <span style={styles.hint}>Max 10 MB</span>
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(e) => setFormData({...formData, proofFile: e.target.files[0]})}
                  style={styles.fileInput}
                />
              </div>
            )}

            {/* All Days: Blockade */}
            <div style={styles.field}>
              <label style={styles.label}>
                Blockade? (falls nicht geliefert)
                <span style={styles.hint}>Optional</span>
              </label>
              <textarea
                value={formData.blockade}
                onChange={(e) => setFormData({...formData, blockade: e.target.value})}
                style={styles.textarea}
                rows={3}
                placeholder="Wo steckst du fest?"
              />
            </div>

          </div>

          <div style={styles.modalFooter}>
            <button
              type="button"
              onClick={onClose}
              style={styles.cancelButton}
              disabled={submitting}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              style={styles.submitButton}
              disabled={submitting}
            >
              {submitting ? '⏳ Speichert...' : '✓ Checkin absenden'}
            </button>
          </div>
        </form>
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
  loading: {
    textAlign: 'center',
    fontSize: '24px',
    marginTop: '100px'
  },
  header: {
    maxWidth: '900px',
    margin: '0 auto 20px'
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    marginBottom: '8px'
  },
  userInfo: {
    fontSize: '16px',
    color: '#6b7280'
  },
  card: {
    maxWidth: '900px',
    margin: '0 auto 20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  sprintHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  moduleTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#111'
  },
  pausedBadge: {
    padding: '6px 12px',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600'
  },
  day0: {
    textAlign: 'center',
    padding: '40px 0'
  },
  day0Title: {
    fontSize: '28px',
    marginBottom: '30px'
  },
  countdown: {
    display: 'inline-block'
  },
  countdownNumber: {
    fontSize: '72px',
    fontWeight: '700',
    color: '#2563eb'
  },
  countdownLabel: {
    fontSize: '18px',
    color: '#6b7280',
    marginTop: '10px'
  },
  completed: {
    textAlign: 'center',
    padding: '40px 0'
  },
  dayTitle: {
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '20px'
  },
  progressContainer: {
    width: '100%',
    height: '12px',
    backgroundColor: '#e5e7eb',
    borderRadius: '6px',
    overflow: 'hidden',
    marginBottom: '12px'
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10b981',
    transition: 'width 0.3s ease',
    borderRadius: '6px'
  },
  progressText: {
    fontSize: '14px',
    color: '#6b7280',
    textAlign: 'center'
  },
  reviewPending: {
    backgroundColor: '#fef3c7',
    border: '2px solid #f59e0b',
    borderRadius: '12px',
    padding: '30px',
    textAlign: 'center'
  },
  checkinDone: {
    backgroundColor: '#d1fae5',
    border: '2px solid #10b981',
    borderRadius: '12px',
    padding: '24px'
  },
  checkinSummary: {
    margin: '20px 0'
  },
  editButton: {
    padding: '10px 20px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  checkinPrompt: {
    textAlign: 'center',
    padding: '30px'
  },
  checkinButton: {
    padding: '14px 28px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    marginTop: '20px'
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '20px'
  },
  projectInfo: {},
  infoRow: {
    marginBottom: '16px',
    display: 'flex',
    gap: '12px'
  },
  infoLabel: {
    fontWeight: '600',
    minWidth: '120px',
    color: '#6b7280'
  },
  badge: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '500'
  },
  telegramButton: {
    display: 'inline-block',
    padding: '14px 28px',
    backgroundColor: '#0088cc',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modal: {
    maxWidth: '700px',
    width: '100%',
    maxHeight: '90vh',
    backgroundColor: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px',
    borderBottom: '2px solid #e5e7eb'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#6b7280'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden'
  },
  modalBody: {
    padding: '24px',
    overflowY: 'auto',
    flex: 1
  },
  field: {
    marginBottom: '24px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#111'
  },
  hint: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '400',
    color: '#6b7280',
    marginTop: '4px'
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    boxSizing: 'border-box',
    outline: 'none'
  },
  textarea: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    resize: 'vertical',
    outline: 'none'
  },
  fileInput: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    boxSizing: 'border-box'
  },
  modalFooter: {
    display: 'flex',
    gap: '12px',
    padding: '24px',
    borderTop: '2px solid #e5e7eb'
  },
  cancelButton: {
    flex: 1,
    padding: '14px',
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  submitButton: {
    flex: 2,
    padding: '14px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  }
}
