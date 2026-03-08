import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export default function Pipeline() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    skill_level: '',
    project_phase: '',
    project_idea: '',
    goal_definition: '',
    why_important: '',
    testimonial: '',
    feedback: '',
    privacy_consent: false,
    terms_consent: false
  })
  const [submitting, setSubmitting] = useState(false)

  const totalSteps = 11

  // Auto-Modul-Berechnung basierend auf Skill + Projektphase
  function calculateModule(skillLevel, projectPhase) {
    let score = 0
    
    // Skill Level Score
    const skillScores = {
      'anfänger': 1,
      'fortgeschritten': 2,
      'profi': 3
    }
    score += skillScores[skillLevel] || 0
    
    // Projekt Phase Score
    const phaseScores = {
      'nur_idee': 1,      // Am Anfang → weniger Zeit
      'konzept': 2,       // Konzept da → Zeit für Build
      'begonnen': 2,      // Schon begonnen → Weiter ausbauen
      'fast_fertig': 3    // Fast fertig → Quality + Polish (MEHR Zeit!)
    }
    score += phaseScores[projectPhase] || 0
    
    // Modul basierend auf Score
    if (score <= 3) return 'bronze'   // 2-3 Punkte
    if (score <= 5) return 'silber'   // 4-5 Punkte
    return 'gold'                      // 6+ Punkte
  }

  const steps = [
    {
      id: 1,
      title: 'Wie heißt du?',
      subtitle: 'Damit wir dich persönlich ansprechen können.',
      field: 'full_name',
      type: 'text',
      placeholder: 'Dein vollständiger Name',
      required: true
    },
    {
      id: 2,
      title: 'Deine E-Mail-Adresse?',
      subtitle: 'Für Zugang und Updates während des Sprints.',
      field: 'email',
      type: 'email',
      placeholder: 'name@beispiel.de',
      required: true
    },
    {
      id: 3,
      title: 'Wie würdest du dein technisches Skill-Level einschätzen?',
      subtitle: 'Sei ehrlich - das hilft uns, den Sprint optimal für dich zu gestalten.',
      field: 'skill_level',
      type: 'select',
      options: [
        { value: 'anfänger', label: 'Anfänger - Erste Schritte mit Coding' },
        { value: 'fortgeschritten', label: 'Fortgeschritten - Kann selbstständig Features bauen' },
        { value: 'profi', label: 'Profi - Mehrere Projekte deployed' }
      ],
      required: true
    },
    {
      id: 4,
      title: 'In welcher Phase ist dein Projekt aktuell?',
      subtitle: 'Das System entscheidet automatisch, welches Modul (Bronze/Silber/Gold) am besten zu dir passt.',
      field: 'project_phase',
      type: 'select',
      options: [
        { value: 'nur_idee', label: 'Nur Idee - Noch kein Code geschrieben' },
        { value: 'konzept', label: 'Konzept vorhanden - Design/Wireframes fertig' },
        { value: 'begonnen', label: 'Begonnen - Erste Features gebaut' },
        { value: 'fast_fertig', label: 'Fast fertig - Brauche finalen Push' }
      ],
      required: true
    },
    {
      id: 5,
      title: 'Was willst du bauen?',
      subtitle: 'Beschreibe deine MVP-Idee in 1-3 Sätzen.',
      field: 'project_idea',
      type: 'textarea',
      placeholder: 'z.B. Eine App, die...',
      required: true
    },
    {
      id: 6,
      title: 'Was ist dein konkretes Ziel?',
      subtitle: 'Was soll am Ende des Sprints fertig sein?',
      field: 'goal_definition',
      type: 'textarea',
      placeholder: 'z.B. Landingpage live, erste zahlende Nutzer, ...',
      required: true
    },
    {
      id: 7,
      title: 'Warum ist dir das wichtig?',
      subtitle: 'Was motiviert dich, dieses Projekt zu starten?',
      field: 'why_important',
      type: 'textarea',
      placeholder: 'Deine persönliche Motivation...',
      required: true
    },
    {
      id: 8,
      title: 'Testimonial - Was erhoffst du dir vom Sprint?',
      subtitle: 'Wird später auf der Website anonym gezeigt (nur mit deiner Zustimmung).',
      field: 'testimonial',
      type: 'textarea',
      placeholder: 'z.B. "Ich erhoffe mir, endlich mein Projekt fertigzustellen und meine erste Version live zu bringen..."',
      required: true
    },
    {
      id: 9,
      title: 'Feedback - Wie findest du den Bewerbungsprozess?',
      subtitle: 'Hilft uns, die Bewerbung zu verbessern.',
      field: 'feedback',
      type: 'textarea',
      placeholder: 'Was hat dir gefallen? Was könnte besser sein?',
      required: true
    },
    {
      id: 10,
      title: 'Datenschutz',
      subtitle: 'Wir behandeln deine Daten vertraulich.',
      field: 'privacy_consent',
      type: 'checkbox',
      label: 'Ich stimme der Datenschutzerklärung zu',
      link: 'https://github.com/energetekk/30-Tage-Finish-Sprint-Oeffentlicher-Log/blob/main/Datenschutzerklaerung.md',
      required: true
    },
    {
      id: 11,
      title: 'Teilnahmebedingungen',
      subtitle: 'Bitte bestätige die Teilnahme.',
      field: 'terms_consent',
      type: 'checkbox',
      label: 'Ich akzeptiere die Teilnahmebedingungen',
      link: 'https://github.com/energetekk/30-tage-sprint-mvp/blob/main/TEILNAHMEBEDINGUNGEN.md', // TODO: Link zu Teilnahmebedingungen
      required: true
    }
  ]

  const currentStepData = steps.find(s => s.id === currentStep)

  function handleNext() {
    // Skip Validierung bei Select (auto-advance)
    if (currentStepData.type !== 'select') {
      // Validierung nur für andere Typen
      const value = formData[currentStepData.field]
      if (currentStepData.required && !value) {
        alert('Bitte fülle dieses Feld aus.')
        return
      }
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  function handleBack() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  async function handleSubmit() {
    setSubmitting(true)

    try {
      // Berechne Modul automatisch
      const calculatedModule = calculateModule(
        formData.skill_level,
        formData.project_phase
      )

      // Bereite Daten vor
      const applicationData = {
        full_name: formData.full_name,
        email: formData.email,
        skill_level: formData.skill_level,
        project_phase: formData.project_phase,
        module: calculatedModule,
        project_idea: formData.project_idea,
        goal_definition: formData.goal_definition,
        why_important: formData.why_important,
        testimonial: formData.testimonial,
        feedback: formData.feedback,
        application_status: 'pending',
        created_at: new Date().toISOString()
      }

      console.log('Submitting application:', applicationData)

      // Insert in Supabase
      const { data, error } = await supabase
        .from('users')
        .upsert(applicationData, {
          onConflict: 'email'
        })
        .select()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Application saved:', data)

      // Send notification email to admin
      const emailResponse = await fetch('/api/notify-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userName: formData.full_name,
          userEmail: formData.email,
          skillLevel: formData.skill_level,
          projectPhase: formData.project_phase,
          module: calculatedModule,
          projectIdea: formData.project_idea,
          testimonial: formData.testimonial,
          feedback: formData.feedback
        })
      })

      if (!emailResponse.ok) {
        console.error('Email notification failed')
      } else {
        console.log('Admin notification sent')
      }

      // Redirect to success page
      router.push(`/success?email=${encodeURIComponent(formData.email)}`)

    } catch (error) {
      console.error('Submit error:', error)
      alert('Fehler beim Absenden: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  function renderField() {
    const step = currentStepData

    if (step.type === 'text' || step.type === 'email') {
      return (
        <input
          type={step.type}
          value={formData[step.field]}
          onChange={(e) => setFormData({ ...formData, [step.field]: e.target.value })}
          placeholder={step.placeholder}
          style={styles.input}
          autoFocus
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleNext()
          }}
        />
      )
    }

    if (step.type === 'textarea') {
      return (
        <textarea
          value={formData[step.field]}
          onChange={(e) => setFormData({ ...formData, [step.field]: e.target.value })}
          placeholder={step.placeholder}
          style={styles.textarea}
          rows={5}
          autoFocus
        />
      )
    }

    if (step.type === 'select') {
      return (
        <div style={styles.selectContainer}>
          {step.options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                // Setze Wert
                setFormData({ ...formData, [step.field]: option.value })
                // Auto-advance
                setTimeout(() => {
                  if (currentStep < totalSteps) {
                    setCurrentStep(currentStep + 1)
                  }
                }, 200)
              }}
              style={{
                ...styles.selectOption,
                ...(formData[step.field] === option.value ? styles.selectOptionActive : {})
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )
    }

    if (step.type === 'checkbox') {
      return (
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={formData[step.field]}
            onChange={(e) => setFormData({ ...formData, [step.field]: e.target.checked })}
            style={styles.checkbox}
          />
          <span style={styles.checkboxText}>
            {step.label.split(' zu')[0]} zu{' '}
            {step.link && (
              <a 
                href={step.link} 
                target="_blank" 
                rel="noopener noreferrer"
                style={styles.link}
                onClick={(e) => e.stopPropagation()}
              >
                {step.field === 'privacy_consent' ? 'Datenschutzerklärung' : 'Teilnahmebedingungen'}
              </a>
            )}
          </span>
        </label>
      )
    }
  }

  return (
    <div style={styles.container}>
      {/* Progress Bar */}
      <div style={styles.progressContainer}>
        <div style={{ ...styles.progressBar, width: `${(currentStep / totalSteps) * 100}%` }} />
      </div>
      <div style={styles.progressText}>
        Schritt {currentStep} von {totalSteps}
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        <h1 style={styles.title}>{currentStepData.title}</h1>
        <p style={styles.subtitle}>{currentStepData.subtitle}</p>

        {renderField()}

        {/* Navigation */}
        <div style={styles.navigation}>
          {currentStep > 1 && (
            <button onClick={handleBack} style={styles.backButton}>
              ← Zurück
            </button>
          )}

          {currentStep < totalSteps ? (
            <button onClick={handleNext} style={styles.nextButton}>
              Weiter →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || !formData.privacy_consent || !formData.terms_consent}
              style={{
                ...styles.submitButton,
                opacity: (submitting || !formData.privacy_consent || !formData.terms_consent) ? 0.5 : 1
              }}
            >
              {submitting ? '⏳ Sendet...' : '✓ Bewerbung absenden'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  progressContainer: {
    maxWidth: '600px',
    margin: '0 auto 10px',
    height: '4px',
    backgroundColor: '#e5e7eb',
    borderRadius: '2px',
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2563eb',
    transition: 'width 0.3s ease'
  },
  progressText: {
    maxWidth: '600px',
    margin: '0 auto 40px',
    textAlign: 'center',
    fontSize: '14px',
    color: '#6b7280'
  },
  content: {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '12px',
    color: '#111'
  },
  subtitle: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '32px',
    lineHeight: '1.5'
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    fontSize: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    marginBottom: '24px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '14px 16px',
    fontSize: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    marginBottom: '24px',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
    boxSizing: 'border-box'
  },
  selectContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '24px'
  },
  selectOption: {
    padding: '16px 20px',
    fontSize: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    backgroundColor: 'white',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s',
    fontFamily: 'inherit'
  },
  selectOptionActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '24px',
    cursor: 'pointer'
  },
  checkbox: {
    width: '20px',
    height: '20px',
    marginTop: '2px',
    cursor: 'pointer'
  },
  checkboxText: {
    fontSize: '16px',
    lineHeight: '1.5',
    color: '#374151'
  },
  link: {
    color: '#2563eb',
    textDecoration: 'underline',
    fontWeight: '600'
  },
  navigation: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'space-between'
  },
  backButton: {
    padding: '12px 24px',
    fontSize: '16px',
    backgroundColor: '#f3f4f6',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    color: '#6b7280'
  },
  nextButton: {
    padding: '12px 32px',
    fontSize: '16px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    marginLeft: 'auto'
  },
  submitButton: {
    padding: '14px 32px',
    fontSize: '16px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600',
    marginLeft: 'auto'
  }
}
