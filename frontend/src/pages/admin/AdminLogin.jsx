import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Shield, Mail, Lock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import styles from '../Auth.module.css'
import aStyles from './AdminLogin.module.css'

export default function AdminLoginPage() {
  const [form, setForm]     = useState({ email:'', password:'' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { adminLogin } = useAuth()
  const navigate = useNavigate()
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      await adminLogin(form.email, form.password)
      toast.success('Welcome, Admin! 🛡️')
      navigate('/admin')
    } catch (err) { toast.error(err.response?.data?.message || 'Invalid admin credentials') }
    finally { setLoading(false) }
  }

  return (
    <div className={styles.page}>
      <div className={`${styles.card} ${aStyles.card}`}>
        <div className={aStyles.badge}><Shield size={16}/> Admin Access</div>
        <div className={styles.header}>
          <Link to="/" className={styles.logo}>WALL<span>HUB</span></Link>
          <h1>Admin Login</h1>
          <p>Restricted area — admin credentials only</p>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label className="form-label">Admin Email</label>
            <div className={styles.inputWrap}><Mail size={16} className={styles.inputIcon}/>
              <input type="email" value={form.email} onChange={set('email')} placeholder="admin@wallhub.com" className={`form-input ${styles.paddedInput}`} required/>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className={styles.inputWrap}><Lock size={16} className={styles.inputIcon}/>
              <input type={showPw?'text':'password'} value={form.password} onChange={set('password')} placeholder="Admin password" className={`form-input ${styles.paddedInput} ${styles.paddedInputRight}`} required/>
              <button type="button" className={styles.pwToggle} onClick={()=>setShowPw(s=>!s)}>{showPw?<EyeOff size={16}/>:<Eye size={16}/>}</button>
            </div>
          </div>
          <button type="submit" className={`btn btn-primary btn-lg ${aStyles.submitBtn}`} disabled={loading}>
            {loading ? <><div className="spinner spinner-sm"/> Authenticating…</> : <><Shield size={18}/> Access Dashboard</>}
          </button>
        </form>
        <p className={styles.switch} style={{marginTop:20}}><Link to="/login">← Back to User Login</Link></p>
      </div>
    </div>
  )
}
