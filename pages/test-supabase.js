import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'

export default function TestSupabase() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      console.log('🔄 Fetching users from Supabase...')
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .limit(5)

      if (error) throw error

      console.log('✅ Success!', data)
      setUsers(data || [])
    } catch (err) {
      console.error('❌ Error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
        <h1>⏳ Loading...</h1>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
        <h1 style={{ color: 'red' }}>❌ Error</h1>
        <p>{error}</p>
        <h3>Debug:</h3>
        <ul>
          <li>Check .env.local exists</li>
          <li>Check SUPABASE_URL is correct</li>
          <li>Check SUPABASE_ANON_KEY is correct</li>
          <li>Check Supabase project is running</li>
        </ul>
      </div>
    )
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>✅ Supabase Connection Test</h1>
      <p style={{ color: 'green', fontSize: '18px' }}>
        Successfully connected to Supabase!
      </p>
      
      <h2>Users in Database: ({users.length})</h2>
      
      {users.length === 0 ? (
        <p>No users found. Create a test user in Supabase!</p>
      ) : (
        <pre style={{ 
          background: '#f4f4f4', 
          padding: '20px', 
          borderRadius: '8px',
          overflow: 'auto'
        }}>
          {JSON.stringify(users, null, 2)}
        </pre>
      )}
    </div>
  )
}
