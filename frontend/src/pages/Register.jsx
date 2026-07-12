import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, UserPlus, Mail, Lock, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import styles from './Auth.module.css'

export default function RegisterPage() {
  const [form, setForm]   = useState({ name:'', email:'', password:'', confirm:'' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone]   = useState(false)
  const { register } = useAuth()
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return }
    setLoading(true)
    try { await register(form.name, form.email, form.password); setDone(true) }
    catch (err) { toast.error(err.response?.data?.message || 'Registration failed') }
    finally { setLoading(false) }
  }

  if (done) return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.successState}>
          <div className={styles.successIcon}>✉️</div>
          <h2>Check Your Email!</h2>
          <p>We've sent a verification link to <strong>{form.email}</strong>. Click the link to activate your account.</p>
          <p className={styles.spamNote}>Don't see it? Check your spam folder.</p>
          <Link to="/login" className="btn btn-primary" style={{marginTop:8}}>Go to Login</Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Link to="/" className={styles.logo}>WALL<span>HUB</span></Link>
          <h1>Create Account</h1>
          <p>Join WallHUB and start collecting wallpapers</p>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className={styles.inputWrap}><User size={16} className={styles.inputIcon}/>
              <input type="text" value={form.name} onChange={set('name')} placeholder="Your name" className={`form-input ${styles.paddedInput}`} required/>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className={styles.inputWrap}><Mail size={16} className={styles.inputIcon}/>
              <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" className={`form-input ${styles.paddedInput}`} required/>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className={styles.inputWrap}><Lock size={16} className={styles.inputIcon}/>
              <input type={showPw?'text':'password'} value={form.password} onChange={set('password')} placeholder="Min. 6 characters" className={`form-input ${styles.paddedInput} ${styles.paddedInputRight}`} required/>
              <button type="button" className={styles.pwToggle} onClick={()=>setShowPw(s=>!s)}>{showPw?<EyeOff size={16}/>:<Eye size={16}/>}</button>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className={styles.inputWrap}><Lock size={16} className={styles.inputIcon}/>
              <input type={showPw?'text':'password'} value={form.confirm} onChange={set('confirm')} placeholder="Repeat password" className={`form-input ${styles.paddedInput}`} required/>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{width:'100%'}} disabled={loading}>
            {loading ? <><div className="spinner spinner-sm"/> Creating account…</> : <><UserPlus size={18}/> Create Account</>}
          </button>
        </form>
        <div className={styles.divider}><span>or</span></div>
        <p className={styles.switch}>Already have an account? <Link to="/login">Log in</Link></p>
      </div>
    </div>
  )
}
