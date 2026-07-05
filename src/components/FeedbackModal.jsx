import { useState, useRef, useEffect } from 'react'

export default function FeedbackModal({ onClose }) {
  const [feedbackType, setFeedbackType] = useState('suggestion')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const modalRef = useRef(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) onClose()
  }

  const getFeedbackLabel = (type) => {
    const map = {
      bug: '🐛 Segnalazione bug',
      suggestion: '💡 Suggerimento',
      feature: '🚀 Richiesta funzionalità',
      other: '📝 Altro'
    }
    return map[type] || type
  }

  // Invio via email – TUTTO a alexandruchiscop@gmail.com
  const sendViaEmail = () => {
    const subject = `[Fin.Io] Feedback: ${getFeedbackLabel(feedbackType)}`
    const body = `
      Tipo: ${getFeedbackLabel(feedbackType)}
      Email mittente: ${email || 'Non specificata'}
      
      Messaggio:
      ${message}
      
      ---
      Inviato dall'app Fin.Io (PWA)
    `
    const mailtoUrl = `mailto:alexandruchiscop@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailtoUrl
    onClose()
  }

  // Invio via Formspree (alternativa – se configurato)
  const sendViaFormspree = async () => {
    const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORMSPREE_ENDPOINT'
    // Se non configurato, usa email
    if (FORMSPREE_ENDPOINT.includes('YOUR_FORMSPREE_ENDPOINT')) {
      sendViaEmail()
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: feedbackType,
          typeLabel: getFeedbackLabel(feedbackType),
          email: email || 'Non specificata',
          message: message,
          source: 'Fin.Io PWA'
        }),
      })
      if (response.ok) {
        alert('✅ Feedback inviato con successo! Grazie.')
        onClose()
      } else {
        throw new Error('Errore nell\'invio')
      }
    } catch (error) {
      console.error('Errore invio feedback:', error)
      alert('❌ Errore nell\'invio. Riprova o contattaci via email.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!message.trim()) {
      alert('Per favore, scrivi un messaggio.')
      return
    }
    // Prova a inviare via Formspree, fallback a email
    sendViaFormspree()
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className="w-full sm:max-w-md bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto animate-zoom-in"
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <span>💬</span> Invia feedback
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-white text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo di feedback */}
          <div>
            <label className="text-xs text-[var(--text-secondary)] block mb-1">
              Tipo di feedback
            </label>
            <select
              value={feedbackType}
              onChange={(e) => setFeedbackType(e.target.value)}
              className="w-full bg-white/5 border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 appearance-none"
            >
              <option value="bug">🐛 Segnalazione bug</option>
              <option value="suggestion">💡 Suggerimento</option>
              <option value="feature">🚀 Richiesta funzionalità</option>
              <option value="other">📝 Altro</option>
            </select>
          </div>

          {/* Email (opzionale) */}
          <div>
            <label className="text-xs text-[var(--text-secondary)] block mb-1">
              La tua email (opzionale)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="esempio@email.com"
              className="w-full bg-white/5 border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
            />
            <p className="text-[10px] text-[var(--text-secondary)] mt-1">
              Inserisci la tua email se desideri una risposta.
            </p>
          </div>

          {/* Messaggio */}
          <div>
            <label className="text-xs text-[var(--text-secondary)] block mb-1">
              Messaggio <span className="text-[var(--danger)]">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Scrivi qui il tuo feedback..."
              rows={5}
              required
              className="w-full bg-white/5 border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 resize-none"
            />
          </div>

          {/* Info invio */}
          <div className="bg-white/5 rounded-xl px-4 py-2">
            <p className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1">
              <span>📧</span>
              Il feedback verrà inviato a <span className="text-[var(--text-primary)] font-medium">alexandruchiscop@gmail.com</span>
            </p>
          </div>

          {/* Pulsanti */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-full text-sm font-medium bg-white/5 text-[var(--text-primary)] hover:bg-white/10 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 px-4 py-2 rounded-full text-sm font-medium bg-[var(--accent)] text-[var(--bg-primary)] hover:bg-[var(--accent-hover)] transition-colors active:scale-95 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Invio...' : 'Invia feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}