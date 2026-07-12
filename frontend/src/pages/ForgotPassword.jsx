import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Send } from 'lucide-react'
import api from '../utils/api'
import toast from 'react-hot-toast'
import styles from './Auth.module.css'

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try { await api.post('/auth/forgot-password', { email }); setSent(true) }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to send reset email') }
    finally { setLoading(false) }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Link to="/" className={styles.logo}>WALL<span>HUB</span></Link>
          <h1>Reset Password</h1>
          <p>We'll send a reset link to your email</p>
        </div>
        {sent ? (
          <div className={styles.successState}>
            <div className={styles.successIcon}>✉️</div>
            <h2>Email Sent!</h2>
            <p>Check <strong>{email}</strong> for the reset link. It expires in 1 hour.</p>
            <Link to="/login" className="btn btn-primary" style={{marginTop:8}}>Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className={styles.inputWrap}><Mail size={16} className={styles.inputIcon}/>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" className={`form-input ${styles.paddedInput}`} required/>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{width:'100%'}} disabled={loading}>
              {loading ? <><div className="spinner spinner-sm"/> Sending…</> : <><Send size={18}/> Send Reset Link</>}
            </button>
          </form>
        )}
        <p className={styles.switch} style={{marginTop:20}}><Link to="/login">← Back to Login</Link></p>
      </div>
    </div>
  )
}
