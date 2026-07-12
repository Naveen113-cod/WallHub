import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle, XCircle } from 'lucide-react'
import api from '../utils/api'
import styles from './Auth.module.css'
import vStyles from './VerifyEmail.module.css'

export default function VerifyEmailPage() {
  const { token } = useParams()
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    api.get(`/auth/verify-email/${token}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'))
  }, [token])

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}><Link to="/" className={styles.logo}>WALL<span>HUB</span></Link></div>
        {status === 'loading' && <div className={vStyles.state}><div className="spinner"/><p>Verifying your email…</p></div>}
        {status === 'success' && (
          <div className={vStyles.state}>
            <CheckCircle size={56} className={vStyles.successIcon}/>
            <h2>Email Verified!</h2>
            <p>Your account is now active. You can log in and start exploring.</p>
            <Link to="/login" className="btn btn-primary btn-lg">Go to Login</Link>
          </div>
        )}
        {status === 'error' && (
          <div className={vStyles.state}>
            <XCircle size={56} className={vStyles.errorIcon}/>
            <h2>Verification Failed</h2>
            <p>The link may have expired or is invalid. Request a new verification email.</p>
            <Link to="/login" className="btn btn-secondary">Back to Login</Link>
          </div>
        )}
      </div>
    </div>
  )
}
