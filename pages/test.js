export default function Test() {
  return (
    <div style={{
      padding: '40px',
      fontFamily: 'sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>
        ✅ Test Page
      </h1>
      <p style={{ fontSize: '18px', marginBottom: '20px' }}>
        Wenn du das siehst: Next.js funktioniert!
      </p>
      
      <div style={{
        padding: '20px',
        backgroundColor: '#dcfce7',
        border: '2px solid #22c55e',
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <strong>SUCCESS! 🎉</strong><br/>
        Compilation funktioniert.<br/>
        Keine Loading-Loop mehr!
      </div>
      
      <h2 style={{ fontSize: '24px', marginBottom: '15px' }}>
        Nächste Schritte:
      </h2>
      <ul style={{ fontSize: '16px', lineHeight: '1.8' }}>
        <li>✅ Homepage funktioniert</li>
        <li>✅ Test Page lädt</li>
        <li>➡️ Onboarding Page bauen</li>
        <li>➡️ Auth System</li>
        <li>➡️ Dashboard</li>
      </ul>
      
      <div style={{ marginTop: '40px' }}>
        <a href="/" style={{
          padding: '10px 20px',
          backgroundColor: '#2563eb',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '6px'
        }}>
          ← Zurück zur Homepage
        </a>
      </div>
    </div>
  )
}
