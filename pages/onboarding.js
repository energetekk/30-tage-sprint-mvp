import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Onboarding() {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [formData, setFormData] = useState({
    vorname: '',
    email: '',
    projectIdea: '',
    existingProgress: '',
    goalDefinition: '',
    whyImportant: '',
    skillLevel: ''
  })

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      const testUserId = '16b30cac-9ecb-49e2-97ff-15d39eacda75'
      
      const { error } = await supabase
        .from('users')
        .update({
          email: formData.email,
          full_name: formData.vorname,
          project_idea: formData.projectIdea,
          existing_progress: formData.existingProgress,
          goal_definition: formData.goalDefinition,
          why_important: formData.whyImportant,
          skill_level: formData.skillLevel,
          tag0_completed_at: new Date().toISOString(),
          status: 'waiting'
        })
        .eq('id', testUserId)

      if (error) throw error

      setSaved(true)
      alert('✅ Gespeichert!')
    } catch (error) {
      alert('Fehler: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (saved) {
    return (
      <div style={styles.container}>
        <div style={styles.successBox}>
          <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>
            ✅ Erfolgreich gespeichert!
          </h1>
          <p style={{ fontSize: '18px', marginBottom: '30px' }}>
            Dein Onboarding ist abgeschlossen.
          </p>
          <a href="/test-supabase" style={styles.button}>
            Zur User-Liste →
          </a>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Willkommen zum 30-Tage-Sprint! 🚀</h1>
        <p style={styles.subtitle}>
          Bevor es losgeht, ein paar Fragen zu deinem Projekt...
        </p>

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Vorname *</label>
            <input
              type="text"
              required
              value={formData.vorname}
              onChange={(e) => setFormData({...formData, vorname: e.target.value})}
              style={styles.input}
              placeholder="Dein Vorname"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={styles.input}
              placeholder="name@example.com"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              Was ist deine Projektidee? (1-2 Sätze) *
            </label>
            <textarea
              required
              value={formData.projectIdea}
              onChange={(e) => setFormData({...formData, projectIdea: e.target.value})}
              style={styles.textarea}
              placeholder="z.B. Eine Landingpage mit Zahlungslink"
              rows={3}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Was existiert bereits? *</label>
            <textarea
              required
              value={formData.existingProgress}
              onChange={(e) => setFormData({...formData, existingProgress: e.target.value})}
              style={styles.textarea}
              placeholder="z.B. Nur Notizen, Design, oder Code"
              rows={3}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              Woran ist dein Projekt nach 30 Tagen fertig? *
            </label>
            <textarea
              required
              value={formData.goalDefinition}
              onChange={(e) => setFormData({...formData, goalDefinition: e.target.value})}
              style={styles.textarea}
              placeholder="Ein sichtbares, überprüfbares Ergebnis"
              rows={3}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Warum ist dir das wichtig? *</label>
            <textarea
              required
              value={formData.whyImportant}
              onChange={(e) => setFormData({...formData, whyImportant: e.target.value})}
              style={styles.textarea}
              placeholder="1 Satz reicht"
              rows={2}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Skill-Level *</label>
            <select
              required
              value={formData.skillLevel}
              onChange={(e) => setFormData({...formData, skillLevel: e.target.value})}
              style={styles.select}
            >
              <option value="">Bitte wählen...</option>
              <option value="anfänger">Anfänger</option>
              <option value="fortgeschritten">Fortgeschritten</option>
              <option value="profi">Profi</option>
            </select>
            <p style={styles.hint}>
              Anfänger: Noch nie deployed | Fortgeschritten: Kann bauen | Profi: Production-ready
            </p>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              ...styles.submitButton,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '💾 Wird gespeichert...' : 'Sprint starten ✅'}
          </button>
        </form>

        <div style={styles.infoBox}>
          <strong>Was passiert danach?</strong><br/>
          Nach dem Absenden startet deine 3-tägige Vorbereitungsphase. 
          Am Tag 4 beginnt dein Sprint!
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    padding: '40px 20px',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  card: {
    maxWidth: '700px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    padding: '40px'
  },
  successBox: {
    maxWidth: '600px',
    margin: '100px auto',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    padding: '60px',
    textAlign: 'center'
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#111',
    marginBottom: '10px'
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '40px'
  },
  field: {
    marginBottom: '24px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px'
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
    boxSizing: 'border-box'
  },
  select: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none',
    backgroundColor: 'white',
    boxSizing: 'border-box'
  },
  hint: {
    fontSize: '13px',
    color: '#6b7280',
    marginTop: '6px'
  },
  submitButton: {
    width: '100%',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#2563eb',
    border: 'none',
    borderRadius: '8px',
    marginTop: '10px',
    transition: 'background-color 0.2s'
  },
  button: {
    display: 'inline-block',
    padding: '14px 28px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#2563eb',
    textDecoration: 'none',
    borderRadius: '8px'
  },
  infoBox: {
    marginTop: '30px',
    padding: '16px',
    backgroundColor: '#dbeafe',
    border: '1px solid #93c5fd',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1e40af'
  }
}
