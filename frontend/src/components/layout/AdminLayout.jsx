import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Image, Upload, Users, LogOut, Menu, X, Shield, ChevronRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import styles from './AdminLayout.module.css'

const NAV = [
  { to:'/admin',            icon:<LayoutDashboard size={18}/>, label:'Dashboard', end:true },
  { to:'/admin/wallpapers', icon:<Image size={18}/>,           label:'Wallpapers' },
  { to:'/admin/upload',     icon:<Upload size={18}/>,          label:'Upload'     },
  { to:'/admin/users',      icon:<Users size={18}/>,           label:'Users'      },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => { logout(); toast.success('Logged out'); navigate('/') }

  return (
    <div className={styles.shell}>
      {open && <div className={styles.mobileOverlay} onClick={()=>setOpen(false)}/>}

      <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ''}`}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}><Shield size={20}/></div>
          <div><div className={styles.brandName}>WallHUB</div><div className={styles.brandRole}>Admin Panel</div></div>
          <button className={styles.closeSidebar} onClick={()=>setOpen(false)}><X size={18}/></button>
        </div>

        <nav className={styles.nav}>
          {NAV.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({isActive})=>`${styles.navItem} ${isActive?styles.navItemActive:''}`}
              onClick={()=>setOpen(false)}>
              {item.icon}<span>{item.label}</span>
              <ChevronRight size={14} className={styles.navArrow}/>
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.adminInfo}>
            <div className={styles.adminAvatar}>{user?.name?.charAt(0).toUpperCase()}</div>
            <div><div className={styles.adminName}>{user?.name}</div><div className={styles.adminEmail}>{user?.email}</div></div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}><LogOut size={16}/> Log Out</button>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topBar}>
          <button className={styles.menuBtn} onClick={()=>setOpen(true)}><Menu size={20}/></button>
          <span className="badge badge-purple" style={{marginLeft:'auto'}}><Shield size={11}/> Admin</span>
        </header>
        <main className={styles.content}><Outlet/></main>
      </div>
    </div>
  )
}
