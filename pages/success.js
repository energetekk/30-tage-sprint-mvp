import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function Success() {
  const router = useRouter()
  const { email } = router.query
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          router.push('/')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Success Icon */}
        <div style={styles.iconContainer}>
          <div style={styles.checkmark}>✓</div>
        </div>

        {/* Headline */}
        <h1 style={styles.title}>Bewerbung eingegangen!</h1>
        
        {/* Message */}
        <div style={styles.message}>
          <p style={styles.text}>
            Vielen Dank für deine Bewerbung zum MVP Buildr Sprint!
          </p>
          <p style={styles.text}>
            Wir prüfen deine Bewerbung und melden uns <strong>innerhalb von 24 Stunden</strong> per Email.
          </p>
          {email && (
            <p style={styles.emailInfo}>
              📧 Du erhältst eine Email an: <strong>{email}</strong>
            </p>
          )}
        </div>

        {/* Next Steps */}
        <div style={styles.nextSteps}>
          <h2 style={styles.subtitle}>Was passiert jetzt?</h2>
          <div style={styles.stepsList}>
            <div style={styles.step}>
              <span style={styles.stepNumber}>1</span>
              <div style={styles.stepContent}>
                <strong>Bewerbung wird geprüft</strong>
                <p>Wir schauen uns deine Projektidee und Motivation an.</p>
              </div>
            </div>
            <div style={styles.step}>
              <span style={styles.stepNumber}>2</span>
              <div style={styles.stepContent}>
                <strong>Email mit Entscheidung</strong>
                <p>Du erhältst innerhalb von 24h eine Zu- oder Absage.</p>
              </div>
            </div>
            <div style={styles.step}>
              <span style={styles.stepNumber}>3</span>
              <div style={styles.stepContent}>
                <strong>Bei Zusage: Zugang zum Dashboard</strong>
                <p>Du bekommst einen Login-Link und kannst loslegen!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div style={styles.tips}>
          <h3 style={styles.tipsTitle}>💡 Tipp für die Wartezeit:</h3>
          <ul style={styles.tipsList}>
            <li>Überlege dir konkrete erste Schritte für dein Projekt</li>
            <li>Check deine Email regelmäßig (auch Spam-Ordner!)</li>
            <li>Bei Fragen: energetekk@proton.me</li>
          </ul>
        </div>

        {/* Redirect Info */}
        <p style={styles.redirectInfo}>
          Du wirst in {countdown} Sekunden zur Startseite weitergeleitet...
        </p>

        <a href="/" style={styles.homeButton}>
          → Zur Startseite
        </a>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  content: {
    maxWidth: '600px',
    width: '100%',
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  iconContainer: {
    marginBottom: '24px'
  },
  checkmark: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    color: 'white',
    fontSize: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
    fontWeight: '700'
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    marginBottom: '24px',
    color: '#111'
  },
  message: {
    marginBottom: '40px'
  },
  text: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#374151',
    marginBottom: '12px'
  },
  emailInfo: {
    fontSize: '14px',
    color: '#6b7280',
    marginTop: '20px',
    padding: '12px',
    backgroundColor: '#f3f4f6',
    borderRadius: '8px'
  },
  nextSteps: {
    textAlign: 'left',
    marginBottom: '32px',
    padding: '24px',
    backgroundColor: '#f9fafb',
    borderRadius: '12px'
  },
  subtitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '20px',
    color: '#111'
  },
  stepsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  step: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start'
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
    fontWeight: '600',
    fontSize: '14px',
    flexShrink: 0
  },
  stepContent: {
    flex: 1
  },
  tips: {
    textAlign: 'left',
    marginBottom: '32px',
    padding: '20px',
    backgroundColor: '#eff6ff',
    borderRadius: '12px',
    borderLeft: '4px solid #2563eb'
  },
  tipsTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '12px',
    color: '#1e40af'
  },
  tipsList: {
    margin: 0,
    paddingLeft: '20px',
    fontSize: '14px',
    color: '#374151',
    lineHeight: '1.8'
  },
  redirectInfo: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '20px'
  },
  homeButton: {
    display: 'inline-block',
    padding: '12px 24px',
    backgroundColor: '#2563eb',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '16px'
  }
}
