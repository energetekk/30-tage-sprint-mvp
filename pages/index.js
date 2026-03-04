export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
      backgroundColor: '#f3f4f6'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>
        30-Tage-Sprint 🚀
      </h1>
      <p style={{ fontSize: '20px', color: '#666', marginBottom: '40px' }}>
        Beta in Entwicklung
      </p>
      
      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <a href="/dashboard" style={{
          padding: '14px 28px',
          backgroundColor: '#2563eb',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: '600',
          fontSize: '16px'
        }}>
          📊 Dashboard
        </a>
        
        <a href="/onboarding" style={{
          padding: '14px 28px',
          backgroundColor: '#059669',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: '600',
          fontSize: '16px'
        }}>
          📝 Onboarding
        </a>
        
        <a href="/test-supabase" style={{
          padding: '14px 28px',
          backgroundColor: '#6b7280',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: '600',
          fontSize: '16px'
        }}>
          🗄️ Supabase Test
        </a>
      </div>
    </div>
  )
}
