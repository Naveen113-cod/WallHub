import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Sun, Moon, Search, Heart, LogOut, Shield, Menu, X, Home, Image, User } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { toggleTheme, isDark } = useTheme()
  const { user, isLoggedIn, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled]     = useState(false)
  const [menuOpen, setMenuOpen]     = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery]           = useState('')
  const searchRef = useRef(null)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setMenuOpen(false); setSearchOpen(false) }, [location])
  useEffect(() => { if (searchOpen) searchRef.current?.focus() }, [searchOpen])

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) { navigate(`/gallery?search=${encodeURIComponent(query.trim())}`); setSearchOpen(false); setQuery('') }
  }

  const handleLogout = () => { logout(); toast.success('Logged out'); navigate('/') }

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}><span className={styles.logoW}>WALL</span><span className={styles.logoHub}>HUB</span></Link>

        <div className={styles.links}>
          <Link to="/"        className={styles.link}><Home   size={15}/> Home</Link>
          <Link to="/gallery" className={styles.link}><Image  size={15}/> Gallery</Link>
          {isLoggedIn && !isAdmin && <Link to="/favorites" className={styles.link}><Heart  size={15}/> Favorites</Link>}
          {isAdmin           && <Link to="/admin"     className={styles.link}><Shield size={15}/> Dashboard</Link>}
        </div>

        <div className={styles.actions}>
          {searchOpen ? (
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <input ref={searchRef} value={query} onChange={e=>setQuery(e.target.value)}
                placeholder="Search wallpapers…" className={styles.searchInput}/>
              <button type="button" className={styles.iconBtn} onClick={()=>setSearchOpen(false)}><X size={16}/></button>
            </form>
          ) : (
            <button className={styles.iconBtn} onClick={()=>setSearchOpen(true)}><Search size={18}/></button>
          )}

          <button className={styles.iconBtn} onClick={toggleTheme}>
            {isDark ? <Sun size={18}/> : <Moon size={18}/>}
          </button>

          {isLoggedIn ? (
            <div className={styles.userMenu}>
              <button className={styles.avatar}>{user?.name?.charAt(0).toUpperCase()}</button>
              <div className={styles.dropdown}>
                <div className={styles.dropHeader}><strong>{user?.name}</strong><span>{user?.email}</span></div>
                <div className={styles.dropDivider}/>
                {isAdmin  && <Link to="/admin"     className={styles.dropItem}><Shield size={14}/> Admin Dashboard</Link>}
                {!isAdmin && <Link to="/favorites" className={styles.dropItem}><Heart  size={14}/> My Favorites</Link>}
                <button className={`${styles.dropItem} ${styles.dropLogout}`} onClick={handleLogout}><LogOut size={14}/> Log Out</button>
              </div>
            </div>
          ) : (
            <div className={styles.authBtns}>
              <Link to="/login"    className="btn btn-ghost btn-sm">Log In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}

          <button className={styles.hamburger} onClick={()=>setMenuOpen(o=>!o)}>
            {menuOpen ? <X size={22}/> : <Menu size={22}/>}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          <Link to="/"         className={styles.mobileLink}><Home  size={16}/> Home</Link>
          <Link to="/gallery"  className={styles.mobileLink}><Image size={16}/> Gallery</Link>
          {isLoggedIn && !isAdmin && <Link to="/favorites" className={styles.mobileLink}><Heart  size={16}/> Favorites</Link>}
          {isAdmin             && <Link to="/admin"    className={styles.mobileLink}><Shield size={16}/> Dashboard</Link>}
          {!isLoggedIn && <>
            <Link to="/login"    className={styles.mobileLink}><User size={16}/> Log In</Link>
            <Link to="/register" className={`${styles.mobileLink} ${styles.mobileLinkAccent}`}>Sign Up</Link>
          </>}
          {isLoggedIn && <button className={`${styles.mobileLink} ${styles.mobileLinkRed}`} onClick={handleLogout}><LogOut size={16}/> Log Out</button>}
        </div>
      )}
    </nav>
  )
}
