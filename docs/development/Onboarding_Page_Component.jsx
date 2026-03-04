// pages/onboarding.jsx
import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
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
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      // Update user record with Tag 0 data
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
          tag0_completed_at: new Date(),
          status: 'waiting' // 3-day warmup starts
        })
        .eq('id', user.id)

      if (error) throw error

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error:', error)
      alert('Fehler beim Speichern: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Willkommen zum 30-Tage-Sprint! 🚀
            </h1>
            <p className="text-gray-600">
              Bevor es losgeht, ein paar Fragen zu deinem Projekt...
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. Vorname */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wer füllt dieses Formular aus? <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.vorname}
                onChange={(e) => setFormData({...formData, vorname: e.target.value})}
                placeholder="Vorname"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 2. Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wie lautet deine Email? <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="name@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 3. Projektidee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Was ist deine Projektidee? (in 1-2 Sätzen, konkret) <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.projectIdea}
                onChange={(e) => setFormData({...formData, projectIdea: e.target.value})}
                placeholder="z.B. Eine Landingpage mit Zahlungslink für Produkt X veröffentlichen."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 4. Was existiert bereits? */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Was existiert bis heute bereits? <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.existingProgress}
                onChange={(e) => setFormData({...formData, existingProgress: e.target.value})}
                placeholder='z.B. "Ich habe nur eine vage Idee", "Brainstorming/Notizen", "Landing Page", "Design/Mockups", "Anderes"'
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 5. Woran ist Projekt fertig? */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Woran ist dein Projekt nach 30 Tagen objektiv "fertig"? <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.goalDefinition}
                onChange={(e) => setFormData({...formData, goalDefinition: e.target.value})}
                placeholder="Ein sichtbares, überprüfbares Ergebnis - kein Gefühl, kein Prozess."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 6. Warum wichtig? */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Warum ist dir das Projekt wichtig? <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.whyImportant}
                onChange={(e) => setFormData({...formData, whyImportant: e.target.value})}
                placeholder="1 Satz reicht aus."
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 7. Skill-Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Welchen Skill-Level bringst du mit? <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.skillLevel}
                onChange={(e) => setFormData({...formData, skillLevel: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Bitte wählen...</option>
                <option value="anfänger">Anfänger</option>
                <option value="fortgeschritten">Fortgeschritten</option>
                <option value="profi">Profi</option>
              </select>
              <p className="mt-2 text-sm text-gray-500">
                Anfänger: Noch nie deployed. Fortgeschritten: Kann bereits bauen. Profi: Production-ready.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Wird gespeichert...' : 'Sprint starten ✅'}
              </button>
            </div>

          </form>

          {/* Info Box */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Was passiert danach?</strong><br/>
              Nach dem Absenden startet deine 3-tägige Vorbereitungsphase. 
              Am Tag 4 beginnt dein Sprint mit dem ersten Prompt!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Optional: Server-Side Auth Check
export async function getServerSideProps(context) {
  // Check if user is authenticated
  // If not, redirect to /login
  // If already completed Tag 0, redirect to /dashboard
  
  return {
    props: {}
  }
}
