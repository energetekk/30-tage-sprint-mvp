import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminReviews() {
  const [pendingReviews, setPendingReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReview, setSelectedReview] = useState(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchPendingReviews()
  }, [])

  async function fetchPendingReviews() {
    try {
      const { data, error } = await supabase
        .from('daily_responses')
        .select(`
          *,
          users!inner(email, full_name, module, project_idea, goal_definition)
        `)
        .eq('requires_manual_review', true)
        .eq('review_status', 'pending')
        .order('submitted_at', { ascending: true })

      if (error) throw error

      console.log('📋 Pending reviews:', data?.length || 0)
      setPendingReviews(data || [])
    } catch (error) {
      console.error('Error:', error)
      alert('Fehler beim Laden: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove() {
    if (!selectedReview) return
    
    setActionLoading(true)
    try {
      // Update review status
      const { error: updateError } = await supabase
        .from('daily_responses')
        .update({
          review_status: 'manually_approved',
          reviewed_by: 'energetekk@proton.me',
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes || null
        })
        .eq('id', selectedReview.id)

      if (updateError) throw updateError

      // Send approval email to user
      await fetch('/api/approve-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: selectedReview.users.email,
          userName: selectedReview.users.full_name,
          sprintDay: selectedReview.sprint_day,
          adminNotes: adminNotes
        })
      })

      alert('✅ Proof freigegeben! User wurde benachrichtigt.')
      setSelectedReview(null)
      setAdminNotes('')
      await fetchPendingReviews()
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Fehler: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleReject() {
    if (!selectedReview) return
    if (!adminNotes.trim()) {
      alert('Bitte gib einen Grund für die Ablehnung an.')
      return
    }
    
    setActionLoading(true)
    try {
      // Update review status
      const { error: updateError } = await supabase
        .from('daily_responses')
        .update({
          review_status: 'rejected',
          reviewed_by: 'energetekk@proton.me',
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes
        })
        .eq('id', selectedReview.id)

      if (updateError) throw updateError

      // Send rejection email
      await fetch('/api/reject-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: selectedReview.users.email,
          userName: selectedReview.users.full_name,
          sprintDay: selectedReview.sprint_day,
          reason: adminNotes
        })
      })

      alert('❌ Proof abgelehnt. User wurde informiert.')
      setSelectedReview(null)
      setAdminNotes('')
      await fetchPendingReviews()
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Fehler: ' + error.message)
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
        <h1 style={styles.title}>Proof Reviews</h1>
        <div style={styles.count}>
          {pendingReviews.length} ausstehend
        </div>
      </div>

      {pendingReviews.length === 0 ? (
        <div style={styles.empty}>
          <p>✅ Keine ausstehenden Reviews!</p>
        </div>
      ) : (
        <div style={styles.list}>
          {pendingReviews.map(review => (
            <div 
              key={review.id}
              style={styles.reviewCard}
              onClick={() => setSelectedReview(review)}
            >
              <div style={styles.reviewHeader}>
                <div>
                  <div style={styles.userName}>{review.users.full_name}</div>
                  <div style={styles.userEmail}>{review.users.email}</div>
                </div>
                <div style={styles.reviewMeta}>
                  <div style={styles.moduleBadge}>
                    {review.users.module.toUpperCase()}
                  </div>
                  <div style={styles.dayBadge}>
                    Tag {review.sprint_day}
                  </div>
                </div>
              </div>

              <div style={styles.reviewContent}>
                <div style={styles.field}>
                  <strong>Projekt:</strong> {review.users.project_idea}
                </div>
                <div style={styles.field}>
                  <strong>Was existiert:</strong> {review.what_exists}
                </div>
                <div style={styles.field}>
                  <strong>Heute erledigt:</strong> {review.what_done}
                </div>
                {review.proof_url && (
                  <div style={styles.field}>
                    <strong>Proof URL:</strong>{' '}
                    <a href={review.proof_url} target="_blank" rel="noopener" style={styles.link}>
                      {review.proof_url}
                    </a>
                  </div>
                )}
                {review.proof_file_url && (
                  <div style={styles.field}>
                    <strong>Proof File:</strong>{' '}
                    <a href={review.proof_file_url} target="_blank" rel="noopener" style={styles.link}>
                      Datei ansehen
                    </a>
                  </div>
                )}
              </div>

              <div style={styles.reviewFooter}>
                <span style={styles.date}>
                  Eingereicht: {new Date(review.submitted_at).toLocaleString('de-DE')}
                </span>
                <button style={styles.viewButton}>
                  Details ansehen →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedReview && (
        <div style={styles.modalOverlay} onClick={() => setSelectedReview(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2>Proof Review - Tag {selectedReview.sprint_day}</h2>
              <button onClick={() => setSelectedReview(null)} style={styles.closeBtn}>
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.userSection}>
                <h3>{selectedReview.users.full_name}</h3>
                <p>{selectedReview.users.email}</p>
                <div style={styles.moduleBadge}>
                  {selectedReview.users.module.toUpperCase()}
                </div>
              </div>

              <div style={styles.section}>
                <h4>Projekt</h4>
                <p><strong>Idee:</strong> {selectedReview.users.project_idea}</p>
                <p><strong>Ziel:</strong> {selectedReview.users.goal_definition}</p>
              </div>

              <div style={styles.section}>
                <h4>Proof Details</h4>
                <p><strong>Was existiert:</strong> {selectedReview.what_exists}</p>
                <p><strong>Heute erledigt:</strong> {selectedReview.what_done}</p>
                {selectedReview.blockade && (
                  <p><strong>Blockade:</strong> {selectedReview.blockade}</p>
                )}
              </div>

              {(selectedReview.proof_url || selectedReview.proof_file_url) && (
                <div style={styles.section}>
                  <h4>Nachweise</h4>
                  {selectedReview.proof_url && (
                    <p>
                      <strong>URL:</strong>{' '}
                      <a href={selectedReview.proof_url} target="_blank" rel="noopener" style={styles.link}>
                        {selectedReview.proof_url}
                      </a>
                    </p>
                  )}
                  {selectedReview.proof_file_url && (
                    <p>
                      <strong>Datei:</strong>{' '}
                      <a href={selectedReview.proof_file_url} target="_blank" rel="noopener" style={styles.link}>
                        Ansehen
                      </a>
                    </p>
                  )}
                </div>
              )}

              <div style={styles.section}>
                <h4>Admin Notizen (Optional)</h4>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  style={styles.textarea}
                  rows={4}
                  placeholder="Feedback oder Grund für Ablehnung..."
                />
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                style={styles.rejectButton}
              >
                {actionLoading ? '⏳' : '✗'} Ablehnen
              </button>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                style={styles.approveButton}
              >
                {actionLoading ? '⏳' : '✓'} Freigeben
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
    fontWeight: '700'
  },
  count: {
    padding: '8px 16px',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600'
  },
  empty: {
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '60px',
    textAlign: 'center'
  },
  list: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gap: '20px'
  },
  reviewCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    ':hover': {
      boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
    }
  },
  reviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px'
  },
  userName: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '4px'
  },
  userEmail: {
    fontSize: '14px',
    color: '#6b7280'
  },
  reviewMeta: {
    display: 'flex',
    gap: '8px'
  },
  moduleBadge: {
    padding: '4px 12px',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  },
  dayBadge: {
    padding: '4px 12px',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  },
  reviewContent: {
    marginBottom: '20px'
  },
  field: {
    marginBottom: '12px',
    fontSize: '14px',
    lineHeight: '1.6'
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none'
  },
  reviewFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #e5e7eb',
    paddingTop: '16px'
  },
  date: {
    fontSize: '12px',
    color: '#6b7280'
  },
  viewButton: {
    padding: '8px 16px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
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
  modalBody: {
    padding: '24px',
    overflowY: 'auto',
    flex: 1
  },
  userSection: {
    marginBottom: '24px',
    paddingBottom: '24px',
    borderBottom: '2px solid #e5e7eb'
  },
  section: {
    marginBottom: '24px'
  },
  textarea: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontFamily: 'inherit',
    resize: 'vertical',
    boxSizing: 'border-box'
  },
  modalFooter: {
    display: 'flex',
    gap: '12px',
    padding: '24px',
    borderTop: '2px solid #e5e7eb'
  },
  rejectButton: {
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
  approveButton: {
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
