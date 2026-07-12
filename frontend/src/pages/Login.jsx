import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, LogIn, Mail, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import styles from './Auth.module.css'

export default function LoginPage() {
  const [form, setForm]     = useState({ email:'', password:'' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from = location.state?.from || '/'
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back! 👋')
      navigate(from, { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed'
      if (err.response?.data?.needsVerification) toast.error('Please verify your email first', { duration: 5000 })
      else toast.error(msg)
    } finally { setLoading(false) }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Link to="/" className={styles.logo}>WALL<span>HUB</span></Link>
          <h1>Welcome Back</h1>
          <p>Log in to your WallHUB account</p>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className={styles.inputWrap}>
              <Mail size={16} className={styles.inputIcon}/>
              <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" className={`form-input ${styles.paddedInput}`} required/>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className={styles.inputWrap}>
              <Lock size={16} className={styles.inputIcon}/>
              <input type={showPw?'text':'password'} value={form.password} onChange={set('password')} placeholder="Your password" className={`form-input ${styles.paddedInput} ${styles.paddedInputRight}`} required/>
              <button type="button" className={styles.pwToggle} onClick={()=>setShowPw(s=>!s)}>
                {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>
          <div className={styles.forgotRow}><Link to="/forgot-password" className={styles.forgot}>Forgot password?</Link></div>
          <button type="submit" className="btn btn-primary btn-lg" style={{width:'100%'}} disabled={loading}>
            {loading ? <><div className="spinner spinner-sm"/> Logging in…</> : <><LogIn size={18}/> Log In</>}
          </button>
        </form>
        <div className={styles.divider}><span>or</span></div>
        <p className={styles.switch}>Don't have an account? <Link to="/register">Sign up free</Link></p>
        <div className={styles.adminLink}><Link to="/admin/login"><Lock size={12}/> Admin Login</Link></div>
      </div>
    </div>
  )
}
