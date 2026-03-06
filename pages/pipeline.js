import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export default function BetaApplication() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    projectIdea: '',
    existingProgress: '',
    goalDefinition: '',
    whyImportant: '',
    skillLevel: '',
    productType: '',
    module: '',
    feedbackConsent: '',
    testimonialConsent: '',
    vorname: '',
    email: ''
  })

  const totalSteps = 12

  async function handleSubmit() {
    setLoading(true)

    try {
    
    
    // ============ DEBUG LOGS HIER EINFÜGEN ↓ ============
    
    console.log('📝 Form Data:', {
      email: formData.email,
      application_status: 'pending',
      vorname: formData.vorname
    })

    // Check ob Email existiert
    const { data: existing } = await supabase
      .from('users')
      .select('id, email, application_status')
      .eq('email', formData.email)
      .maybeSingle()  // ← Wichtig: maybeSingle() statt single()

    console.log('🔍 Existing user:', existing)

    if (existing) {
      console.log('⚠️ Email exists! Status:', existing.application_status)
    } else {
      console.log('✅ New email, will INSERT')
    }
    
    // ============ DEBUG LOGS ENDE ↑ ============
    
      // 1. Save to database
      const { error: dbError } = await supabase
        .from('users')
        .upsert({
          email: formData.email,
          full_name: formData.vorname,
          project_idea: formData.projectIdea,
          existing_progress: formData.existingProgress,
          goal_definition: formData.goalDefinition,
          why_important: formData.whyImportant,
          skill_level: formData.skillLevel,
          product_type: formData.productType,
          module: formData.module,
          feedback_consent: formData.feedbackConsent === 'ja',
          testimonial_consent: formData.testimonialConsent,
          application_status: 'pending',
          applied_at: new Date().toISOString()
        }, {
          onConflict: 'email'
        })

      if (dbError) throw dbError

      // 2. Notify admin (non-blocking)
      try {
        console.log('🔔 Sending notification email...')
        const emailResponse = await fetch('/api/notify-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.vorname,
            email: formData.email,
            projectIdea: formData.projectIdea.substring(0, 50) + '...'
          })
        })

        console.log('📧 Email Response Status:', emailResponse.status)
        
        if (emailResponse.ok) {
          const emailData = await emailResponse.json()
          console.log('✅ Email sent:', emailData)
        } else {
          const errorText = await emailResponse.text()
          console.warn('⚠️ Email failed:', errorText)
        }
      } catch (emailError) {
        console.error('❌ Email error (non-critical):', emailError)
      }

      // 3. Redirect to login with success message
      router.push('/login?bewerbung=erfolg')

    } catch (error) {
      console.error('Error:', error)
      alert('Fehler beim Absenden: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  function canProceed() {
    switch(currentStep) {
      case 0: return formData.projectIdea.trim().length > 0
      case 1: return formData.existingProgress.trim().length > 0
      case 2: return formData.goalDefinition.trim().length > 0
      case 3: return formData.whyImportant.trim().length > 0
      case 4: return formData.skillLevel !== ''
      case 5: return formData.productType !== ''
      case 6: return formData.module !== ''
      case 7: return true // Info-Text, always can proceed
      case 8: return formData.feedbackConsent === 'ja'
      case 9: return formData.testimonialConsent !== '' && formData.testimonialConsent !== 'nein'
      case 10: return formData.vorname.trim().length > 0
      case 11: return formData.email.trim().length > 0 && formData.email.includes('@')
      default: return false
    }
  }

  function nextStep() {
    if (canProceed() && currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter' && canProceed()) {
      if (currentStep === totalSteps - 1) {
        handleSubmit()
      } else {
        nextStep()
      }
    }
  }

  const progress = ((currentStep + 1) / totalSteps) * 100

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        
        <div style={styles.progressContainer}>
          <div style={{...styles.progressBar, width: `${progress}%`}} />
        </div>
        
        <div style={styles.progressText}>
          Frage {currentStep + 1} von {totalSteps}
        </div>

        <div style={styles.questionContainer}>
          
          {/* Step 0: Projektidee */}
          {currentStep === 0 && (
            <div style={styles.stepContent}>
              <h1 style={styles.question}>Was ist deine Projektidee?</h1>
              <p style={styles.hint}>Beschreibe in 1-2 Sätzen, was du bauen willst. Sei konkret!</p>
              <textarea
                autoFocus
                value={formData.projectIdea}
                onChange={(e) => setFormData({...formData, projectIdea: e.target.value})}
                onKeyPress={handleKeyPress}
                style={styles.textarea}
                placeholder="z.B. Eine SaaS-Plattform für Freelancer um Rechnungen zu tracken..."
                rows={4}
              />
            </div>
          )}

          {/* Step 1: Was existiert bereits */}
          {currentStep === 1 && (
            <div style={styles.stepContent}>
              <h1 style={styles.question}>Was existiert bis heute bereits?</h1>
              <p style={styles.hint}>Sei ehrlich. Hast du nur eine Idee, Notizen, Design, oder schon Code?</p>
              <textarea
                autoFocus
                value={formData.existingProgress}
                onChange={(e) => setFormData({...formData, existingProgress: e.target.value})}
                onKeyPress={handleKeyPress}
                style={styles.textarea}
                placeholder='z.B. "Nur eine Idee", "Notizen in Notion", "Figma Design", "Landing Page"...'
                rows={4}
              />
            </div>
          )}

          {/* Step 2: Woran ist Projekt fertig */}
          {currentStep === 2 && (
            <div style={styles.stepContent}>
              <h1 style={styles.question}>Woran ist dein Projekt objektiv "fertig"?</h1>
              <p style={styles.hint}>Ein sichtbares, überprüfbares Ergebnis - kein Gefühl, kein Prozess.</p>
              <textarea
                autoFocus
                value={formData.goalDefinition}
                onChange={(e) => setFormData({...formData, goalDefinition: e.target.value})}
                onKeyPress={handleKeyPress}
                style={styles.textarea}
                placeholder="z.B. Website ist live unter meiner-domain.com mit funktionierender Zahlungsseite"
                rows={4}
              />
            </div>
          )}

          {/* Step 3: Warum wichtig */}
          {currentStep === 3 && (
            <div style={styles.stepContent}>
              <h1 style={styles.question}>Warum ist dir das Projekt wichtig?</h1>
              <p style={styles.hint}>1 Satz reicht aus. Was treibt dich an?</p>
              <textarea
                autoFocus
                value={formData.whyImportant}
                onChange={(e) => setFormData({...formData, whyImportant: e.target.value})}
                onKeyPress={handleKeyPress}
                style={styles.textarea}
                placeholder="z.B. Ich will beweisen dass ich es schaffen kann"
                rows={3}
              />
            </div>
          )}

          {/* Step 4: Skill-Level */}
          {currentStep === 4 && (
            <div style={styles.stepContent}>
              <h1 style={styles.question}>Welchen Skill-Level bringst du mit?</h1>
              <p style={styles.hint}>Das bestimmt welche Art von Prompts du bekommst.</p>
              
              <div style={styles.skillOptions}>
                <button
                  onClick={() => setFormData({...formData, skillLevel: 'anfänger'})}
                  style={{
                    ...styles.skillButton,
                    ...(formData.skillLevel === 'anfänger' ? styles.skillButtonActive : {})
                  }}
                >
                  <div style={styles.skillEmoji}>🌱</div>
                  <div style={styles.skillTitle}>Anfänger</div>
                  <div style={styles.skillDesc}>Noch nie deployed. Tutorial Hell.</div>
                </button>

                <button
                  onClick={() => setFormData({...formData, skillLevel: 'fortgeschritten'})}
                  style={{
                    ...styles.skillButton,
                    ...(formData.skillLevel === 'fortgeschritten' ? styles.skillButtonActive : {})
                  }}
                >
                  <div style={styles.skillEmoji}>🚀</div>
                  <div style={styles.skillTitle}>Fortgeschritten</div>
                  <div style={styles.skillDesc}>Kann bauen. Brauche Fokus.</div>
                </button>

                <button
                  onClick={() => setFormData({...formData, skillLevel: 'profi'})}
                  style={{
                    ...styles.skillButton,
                    ...(formData.skillLevel === 'profi' ? styles.skillButtonActive : {})
                  }}
                >
                  <div style={styles.skillEmoji}>⚡</div>
                  <div style={styles.skillTitle}>Profi</div>
                  <div style={styles.skillDesc}>Production-ready. Need speed.</div>
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Produkttyp */}
          {currentStep === 5 && (
            <div style={styles.stepContent}>
              <h1 style={styles.question}>Was baust du?</h1>
              <p style={styles.hint}>Wähle den Produkttyp der am besten passt.</p>
              
              <select
                autoFocus
                value={formData.productType}
                onChange={(e) => setFormData({...formData, productType: e.target.value})}
                style={styles.select}
              >
                <option value="">-- Bitte wählen --</option>
                <option value="saas">SaaS / Web-App</option>
                <option value="ecommerce">E-Commerce / Online Shop</option>
                <option value="content">Content Platform (Blog/Membership)</option>
                <option value="digital">Digital Product (eBook/Course/Template)</option>
                <option value="api">API / Developer Tool</option>
              </select>

              <div style={styles.infoBox}>
                ⚠️ Aktuell nur für <strong>Online-Produkte</strong>.<br/>
                Keine physischen Produkte, NGOs oder Open Source Projekte.
              </div>
            </div>
          )}

          {/* Step 6: Modul */}
          {currentStep === 6 && (
            <div style={styles.stepContent}>
              <h1 style={styles.question}>Welches Modul wählst du?</h1>
              <p style={styles.hint}>Je nach Projekt-Komplexität.</p>
              
              <div style={styles.moduleOptions}>
                <button
                  onClick={() => setFormData({...formData, module: 'bronze'})}
                  style={{
                    ...styles.moduleButton,
                    ...(formData.module === 'bronze' ? styles.moduleButtonActive : {}),
                    borderColor: '#cd7f32'
                  }}
                >
                  <div style={styles.moduleEmoji}>🥉</div>
                  <div style={styles.moduleTitle}>Bronze</div>
                  <div style={styles.moduleDays}>13 Sprint-Tage</div>
                  <div style={styles.moduleDesc}>Funktionsfähiger Prototyp</div>
                </button>

                <button
                  onClick={() => setFormData({...formData, module: 'silber'})}
                  style={{
                    ...styles.moduleButton,
                    ...(formData.module === 'silber' ? styles.moduleButtonActive : {}),
                    borderColor: '#c0c0c0'
                  }}
                >
                  <div style={styles.moduleEmoji}>🥈</div>
                  <div style={styles.moduleTitle}>Silber</div>
                  <div style={styles.moduleDays}>21 Sprint-Tage</div>
                  <div style={styles.moduleDesc}>MVP + Marktvalidierung</div>
                </button>

                <button
                  onClick={() => setFormData({...formData, module: 'gold'})}
                  style={{
                    ...styles.moduleButton,
                    ...(formData.module === 'gold' ? styles.moduleButtonActive : {}),
                    borderColor: '#ffd700'
                  }}
                >
                  <div style={styles.moduleEmoji}>🥇</div>
                  <div style={styles.moduleTitle}>Gold</div>
                  <div style={styles.moduleDays}>30 Sprint-Tage</div>
                  <div style={styles.moduleDesc}>MVP + Commitment-Test</div>
                </button>
              </div>
            </div>
          )}

          {/* Step 7: Beta Info */}
          {currentStep === 7 && (
            <div style={styles.stepContent}>
              <h1 style={styles.question}>✓ Du bewirbst dich für die kostenlose Sprint-Phase</h1>
              <div style={styles.betaInfo}>
                <p><strong>Was das bedeutet:</strong></p>
                <ul>
                  <li>✅ Komplett kostenlos (Wert: CHF 25-75)</li>
                  <li>✅ Nur 5-10 Plätze verfügbar</li>
                  <li>✅ Voller Sprint-Zugang</li>
                  <li>✅ 1:1 Support bei Problemen</li>
                </ul>
                <p style={{marginTop: '20px'}}><strong>Im Gegenzug erwarten wir:</strong></p>
                <ul>
                  <li>→ Ehrliches Feedback zum Prozess</li>
                  <li>→ Bereitschaft für Testimonial</li>
                  <li>→ Offene Kommunikation</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 8: Feedback */}
          {currentStep === 8 && (
            <div style={styles.stepContent}>
              <h1 style={styles.question}>Bist du bereit Feedback zu geben?</h1>
              <p style={styles.hint}>Nach dem Sprint erwarten wir ein kurzes Feedback-Formular (~10 Min).</p>
              
              <div style={styles.buttonGroup}>
                <button
                  onClick={() => setFormData({...formData, feedbackConsent: 'ja'})}
                  style={{
                    ...styles.yesNoButton,
                    ...(formData.feedbackConsent === 'ja' ? styles.yesNoButtonActive : {})
                  }}
                >
                  ✓ Ja
                </button>

                <button
                  onClick={() => setFormData({...formData, feedbackConsent: 'nein'})}
                  style={{
                    ...styles.yesNoButton,
                    ...(formData.feedbackConsent === 'nein' ? styles.yesNoButtonDisabled : {}),
                    cursor: 'not-allowed',
                    opacity: 0.5
                  }}
                  title="Feedback ist Voraussetzung für Beta-Teilnahme"
                >
                  ✗ Nein
                </button>
              </div>

              {formData.feedbackConsent === 'nein' && (
                <div style={styles.errorBox}>
                  ⚠️ Feedback ist Voraussetzung für die Beta-Teilnahme.
                </div>
              )}
            </div>
          )}

          {/* Step 9: Testimonial */}
          {currentStep === 9 && (
            <div style={styles.stepContent}>
              <h1 style={styles.question}>Stellst du dich für Testimonial zur Verfügung?</h1>
              <p style={styles.hint}>Ein kurzes Statement nach dem Sprint (Text oder Video, ~2-3 Min).</p>
              
              <div style={styles.buttonGroup}>
                <button
                  onClick={() => setFormData({...formData, testimonialConsent: 'ja'})}
                  style={{
                    ...styles.testimonialButton,
                    ...(formData.testimonialConsent === 'ja' ? styles.testimonialButtonActive : {})
                  }}
                >
                  <div>✓ Ja</div>
                  <div style={styles.buttonDesc}>mit Namen/Foto</div>
                </button>

                <button
                  onClick={() => setFormData({...formData, testimonialConsent: 'anonym'})}
                  style={{
                    ...styles.testimonialButton,
                    ...(formData.testimonialConsent === 'anonym' ? styles.testimonialButtonActive : {})
                  }}
                >
                  <div>👤 Anonym</div>
                  <div style={styles.buttonDesc}>ohne Namen/Foto</div>
                </button>

                <button
                  onClick={() => setFormData({...formData, testimonialConsent: 'nein'})}
                  style={{
                    ...styles.testimonialButton,
                    ...(formData.testimonialConsent === 'nein' ? styles.testimonialButtonDisabled : {}),
                    cursor: 'not-allowed',
                    opacity: 0.5
                  }}
                  title="Testimonial ist Voraussetzung für Beta-Teilnahme"
                >
                  <div>✗ Nein</div>
                  <div style={styles.buttonDesc}>nicht möglich</div>
                </button>
              </div>

              {formData.testimonialConsent === 'nein' && (
                <div style={styles.errorBox}>
                  ⚠️ Testimonial ist Voraussetzung für Beta-Teilnahme.<br/>
                  (Anonym ist okay!)
                </div>
              )}
            </div>
          )}

          {/* Step 10: Vorname */}
          {currentStep === 10 && (
            <div style={styles.stepContent}>
              <h1 style={styles.question}>Dein Vorname?</h1>
              <p style={styles.hint}>So werden wir dich ansprechen.</p>
              <input
                autoFocus
                type="text"
                value={formData.vorname}
                onChange={(e) => setFormData({...formData, vorname: e.target.value})}
                onKeyPress={handleKeyPress}
                style={styles.input}
                placeholder="Vorname"
              />
            </div>
          )}

          {/* Step 11: Email */}
          {currentStep === 11 && (
            <div style={styles.stepContent}>
              <h1 style={styles.question}>Deine Email?</h1>
              <p style={styles.hint}>Hier schicken wir dir die Bestätigung und später die täglichen Prompts.</p>
              <input
                autoFocus
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                onKeyPress={handleKeyPress}
                style={styles.input}
                placeholder="name@example.com"
              />
            </div>
          )}

        </div>

        <div style={styles.navigation}>
          {currentStep > 0 && (
            <button onClick={prevStep} style={styles.backButton}>
              ← Zurück
            </button>
          )}

          {currentStep < totalSteps - 1 ? (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              style={{
                ...styles.nextButton,
                opacity: canProceed() ? 1 : 0.4,
                cursor: canProceed() ? 'pointer' : 'not-allowed'
              }}
            >
              Weiter →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || loading}
              style={{
                ...styles.submitButton,
                opacity: (canProceed() && !loading) ? 1 : 0.4,
                cursor: (canProceed() && !loading) ? 'pointer' : 'not-allowed'
              }}
            >
              {loading ? '💾 Wird abgeschickt...' : '🚀 Bewerbung absenden'}
            </button>
          )}
        </div>

        {canProceed() && currentStep < totalSteps - 1 && (
          <div style={styles.keyboardHint}>
            💡 Tipp: Drücke Enter ↵
          </div>
        )}

      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  card: {
    maxWidth: '700px',
    width: '100%',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    padding: '40px'
  },
  progressContainer: {
    width: '100%',
    height: '8px',
    backgroundColor: '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '12px'
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2563eb',
    transition: 'width 0.3s ease'
  },
  progressText: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '40px',
    textAlign: 'center'
  },
  questionContainer: {
    minHeight: '300px',
    marginBottom: '40px'
  },
  stepContent: {},
  question: {
    fontSize: '32px',
    fontWeight: '700',
    marginBottom: '16px',
    lineHeight: '1.3',
    color: '#111'
  },
  hint: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '24px'
  },
  input: {
    width: '100%',
    padding: '16px',
    fontSize: '18px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '16px',
    fontSize: '18px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
    boxSizing: 'border-box'
  },
  select: {
    width: '100%',
    padding: '16px',
    fontSize: '18px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    outline: 'none',
    backgroundColor: 'white',
    boxSizing: 'border-box'
  },
  skillOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  skillButton: {
    padding: '20px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    backgroundColor: 'white',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    transition: 'all 0.2s'
  },
  skillButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff'
  },
  skillEmoji: {
    fontSize: '32px',
    marginBottom: '8px'
  },
  skillTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '4px'
  },
  skillDesc: {
    fontSize: '14px',
    color: '#6b7280'
  },
  moduleOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  moduleButton: {
    padding: '20px',
    border: '3px solid',
    borderRadius: '12px',
    backgroundColor: 'white',
    cursor: 'pointer',
    textAlign: 'center',
    width: '100%',
    transition: 'all 0.2s'
  },
  moduleButtonActive: {
    backgroundColor: '#f9fafb',
    transform: 'scale(1.02)'
  },
  moduleEmoji: {
    fontSize: '36px',
    marginBottom: '8px'
  },
  moduleTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '4px'
  },
  moduleDays: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '8px',
    fontWeight: '500'
  },
  moduleDesc: {
    fontSize: '14px',
    color: '#6b7280'
  },
  betaInfo: {
    backgroundColor: '#dbeafe',
    padding: '24px',
    borderRadius: '12px',
    border: '2px solid #3b82f6'
  },
  buttonGroup: {
    display: 'flex',
    gap: '16px',
    flexDirection: 'column'
  },
  yesNoButton: {
    padding: '16px',
    fontSize: '18px',
    fontWeight: '600',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  yesNoButtonActive: {
    borderColor: '#10b981',
    backgroundColor: '#d1fae5',
    color: '#065f46'
  },
  yesNoButtonDisabled: {
    borderColor: '#ef4444',
    backgroundColor: '#fee2e2',
    color: '#991b1b'
  },
  testimonialButton: {
    padding: '16px',
    fontSize: '16px',
    fontWeight: '600',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: 'white',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.2s'
  },
  testimonialButtonActive: {
    borderColor: '#10b981',
    backgroundColor: '#d1fae5',
    color: '#065f46'
  },
  testimonialButtonDisabled: {
    borderColor: '#ef4444',
    backgroundColor: '#fee2e2',
    color: '#991b1b'
  },
  buttonDesc: {
    fontSize: '12px',
    fontWeight: '400',
    marginTop: '4px',
    opacity: 0.8
  },
  errorBox: {
    marginTop: '16px',
    padding: '16px',
    backgroundColor: '#fee2e2',
    border: '2px solid #ef4444',
    borderRadius: '8px',
    color: '#991b1b',
    fontSize: '14px'
  },
  infoBox: {
    marginTop: '16px',
    padding: '16px',
    backgroundColor: '#fef3c7',
    border: '2px solid #f59e0b',
    borderRadius: '8px',
    color: '#92400e',
    fontSize: '14px'
  },
  navigation: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'space-between'
  },
  backButton: {
    padding: '14px 28px',
    fontSize: '16px',
    fontWeight: '500',
    color: '#6b7280',
    backgroundColor: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  nextButton: {
    padding: '14px 28px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#2563eb',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    flex: 1
  },
  submitButton: {
    padding: '14px 28px',
    fontSize: '18px',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#10b981',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    flex: 1
  },
  keyboardHint: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#9ca3af',
    marginTop: '16px',
    fontStyle: 'italic'
  }
}
