import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <Link to="/" className={styles.logo}>WALL<span>HUB</span></Link>
          <p>Premium wallpapers for every screen. Curated with love.</p>
        </div>
        <div className={styles.links}>
          <div className={styles.col}>
            <h4>Browse</h4>
            <Link to="/gallery">All Wallpapers</Link>
            <Link to="/gallery?category=Nature">Nature</Link>
            <Link to="/gallery?category=Abstract">Abstract</Link>
            <Link to="/gallery?category=Space">Space</Link>
            <Link to="/gallery?category=Minimal">Minimal</Link>
          </div>
          <div className={styles.col}>
            <h4>Account</h4>
            <Link to="/login">Log In</Link>
            <Link to="/register">Sign Up</Link>
            <Link to="/favorites">Favorites</Link>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <div className="container">
          <p>© {new Date().getFullYear()} WallHUB. Made with <Heart size={13} style={{display:'inline',color:'var(--red)'}}/> by the WallHUB team.</p>
        </div>
      </div>
    </footer>
  )
}
