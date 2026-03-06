import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'

export default function AdminPanel() {
  const router = useRouter()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    // TEMP: Skip auth for development
    console.log('⚠️ AUTH DISABLED FOR DEVELOPMENT')
    fetchApplications()
  }, [])

  async function fetchApplications() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('application_status', 'pending')
        .order('applied_at', { ascending: false })

      if (error) throw error
      
      console.log('📋 Found applications:', data?.length || 0)
      setApplications(data || [])
    } catch (error) {
      console.error('Error fetching applications:', error)
      alert('Fehler beim Laden: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  function openModal(app) {
    setSelectedApp(app)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setSelectedApp(null)
  }

  async function handleAccept() {
    if (!selectedApp) return
    
    setActionLoading(true)
    try {
      const response = await fetch('/api/accept-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedApp.id,
          email: selectedApp.email,
          name: selectedApp.full_name
        })
      })

      if (!response.ok) throw new Error('Accept failed')

      alert('✅ Bewerbung akzeptiert! User bekommt Magic Link per Email.')
      closeModal()
      await fetchApplications()
    } catch (error) {
      console.error('Error accepting:', error)
      alert('Fehler beim Akzeptieren: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleReject() {
    if (!selectedApp) return
    
    setActionLoading(true)
    try {
      const response = await fetch('/api/reject-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedApp.id,
          email: selectedApp.email,
          name: selectedApp.full_name
        })
      })

      if (!response.ok) throw new Error('Reject failed')

      alert('✅ Bewerbung abgelehnt. User wurde per Email informiert.')
      closeModal()
      await fetchApplications()
    } catch (error) {
      console.error('Error rejecting:', error)
      alert('Fehler beim Ablehnen: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>⏳ Lädt...</div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Beta-Bewerbungen</h1>
        <div style={styles.warningBadge}>⚠️ DEV MODE - NO AUTH</div>
      </div>

      {applications.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>📭 Keine ausstehenden Bewerbungen</p>
        </div>
      ) : (
        <div style={styles.table}>
          <div style={styles.tableHeader}>
            <div style={styles.colName}>Name</div>
            <div style={styles.colEmail}>Email</div>
            <div style={styles.colDate}>Datum</div>
            <div style={styles.colAction}>Aktion</div>
          </div>

          {applications.map(app => (
            <div 
              key={app.id} 
              style={styles.tableRow}
              onClick={() => openModal(app)}
            >
              <div style={styles.colName}>{app.full_name}</div>
              <div style={styles.colEmail}>{app.email}</div>
              <div style={styles.colDate}>
                {new Date(app.applied_at).toLocaleDateString('de-DE')}
              </div>
              <div style={styles.colAction}>
                <button style={styles.viewBtn}>Details anzeigen</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && selectedApp && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Bewerbungsdetails</h2>
              <button onClick={closeModal} style={styles.closeBtn}>✕</button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.field}>
                <div style={styles.label}>Vorname</div>
                <div style={styles.value}>{selectedApp.full_name}</div>
              </div>

              <div style={styles.field}>
                <div style={styles.label}>Email</div>
                <div style={styles.value}>{selectedApp.email}</div>
              </div>

              <div style={styles.field}>
                <div style={styles.label}>Projektidee</div>
                <div style={styles.value}>{selectedApp.project_idea}</div>
              </div>

              <div style={styles.field}>
                <div style={styles.label}>Was existiert bereits?</div>
                <div style={styles.value}>{selectedApp.existing_progress}</div>
              </div>

              <div style={styles.field}>
                <div style={styles.label}>Woran ist Projekt fertig?</div>
                <div style={styles.value}>{selectedApp.goal_definition}</div>
              </div>

              <div style={styles.field}>
                <div style={styles.label}>Warum wichtig?</div>
                <div style={styles.value}>{selectedApp.why_important}</div>
              </div>

              <div style={styles.field}>
                <div style={styles.label}>Skill-Level</div>
                <div style={styles.badge}>{selectedApp.skill_level}</div>
              </div>

              <div style={styles.field}>
                <div style={styles.label}>Produkttyp</div>
                <div style={styles.badge}>{selectedApp.product_type}</div>
              </div>

              <div style={styles.field}>
                <div style={styles.label}>Modul</div>
                <div style={styles.badge}>{selectedApp.module}</div>
              </div>

              <div style={styles.field}>
                <div style={styles.label}>Feedback bereit?</div>
                <div style={styles.value}>
                  {selectedApp.feedback_consent ? '✓ Ja' : '✗ Nein'}
                </div>
              </div>

              <div style={styles.field}>
                <div style={styles.label}>Testimonial</div>
                <div style={styles.value}>
                  {selectedApp.testimonial_consent === 'ja' ? '✓ Ja (mit Namen)' :
                   selectedApp.testimonial_consent === 'anonym' ? '👤 Anonym' :
                   '✗ Nein'}
                </div>
              </div>

              <div style={styles.field}>
                <div style={styles.label}>Beworben am</div>
                <div style={styles.value}>
                  {new Date(selectedApp.applied_at).toLocaleString('de-DE')}
                </div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                style={styles.rejectBtn}
              >
                {actionLoading ? '⏳' : '✗'} Ablehnen
              </button>
              <button
                onClick={handleAccept}
                disabled={actionLoading}
                style={styles.acceptBtn}
              >
                {actionLoading ? '⏳' : '✓'} Akzeptieren
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    padding: '20px'
  },
  loading: {
    textAlign: 'center',
    fontSize: '24px',
    marginTop: '100px'
  },
  header: {
    maxWidth: '1200px',
    margin: '0 auto 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#111'
  },
  warningBadge: {
    padding: '8px 16px',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    border: '2px solid #f59e0b'
  },
  emptyState: {
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '60px',
    textAlign: 'center'
  },
  emptyText: {
    fontSize: '20px',
    color: '#6b7280'
  },
  table: {
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '2fr 2fr 1fr 1fr',
    gap: '20px',
    padding: '20px',
    backgroundColor: '#f9fafb',
    fontWeight: '600',
    fontSize: '14px',
    color: '#6b7280'
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 2fr 1fr 1fr',
    gap: '20px',
    padding: '20px',
    borderBottom: '1px solid #e5e7eb',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  colName: {},
  colEmail: {},
  colDate: {},
  colAction: {},
  viewBtn: {
    padding: '6px 12px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer'
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
    zIndex: 1000
  },
  modal: {
    maxWidth: '700px',
    width: '90%',
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
  modalTitle: {
    fontSize: '24px',
    fontWeight: '700'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#6b7280'
  },
  modalBody: {
    padding: '24px',
    overflowY: 'auto',
    flex: 1
  },
  field: {
    marginBottom: '20px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: '6px'
  },
  value: {
    fontSize: '16px',
    color: '#111',
    lineHeight: '1.6'
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
  modalFooter: {
    display: 'flex',
    gap: '12px',
    padding: '24px',
    borderTop: '2px solid #e5e7eb'
  },
  rejectBtn: {
    flex: 1,
    padding: '14px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  acceptBtn: {
    flex: 1,
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
