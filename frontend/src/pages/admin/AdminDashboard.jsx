import { useState, useEffect } from 'react'
import { Users, Image, Download, Heart, TrendingUp, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import { formatCount, timeAgo } from '../../utils/helpers'
import styles from './AdminDashboard.module.css'

const StatCard = ({ icon, label, value, color }) => (
  <div className={styles.statCard} style={{'--card-color':color}}>
    <div className={styles.statIcon}>{icon}</div>
    <div><div className={styles.statValue}>{formatCount(value)}</div><div className={styles.statLabel}>{label}</div></div>
  </div>
)

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    api.get('/admin/analytics')
      .then(({ data }) => setAnalytics(data.analytics))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className={styles.page}>
      <div className={styles.loadingGrid}>{Array.from({length:4}).map((_,i)=><div key={i} className={`skeleton ${styles.skeletonCard}`}/>)}</div>
    </div>
  )

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1>Dashboard <span className="gradient-text">Overview</span></h1>
        <p>Welcome back, Admin</p>
      </div>

      <div className={styles.statsGrid}>
        <StatCard icon={<Users size={24}/>}    label="Total Users"   value={analytics?.totalUsers}     color="#6c63ff"/>
        <StatCard icon={<Image size={24}/>}    label="Wallpapers"    value={analytics?.totalWallpapers} color="#a855f7"/>
        <StatCard icon={<Download size={24}/>} label="Downloads"     value={analytics?.totalDownloads}  color="#00d4ff"/>
        <StatCard icon={<Heart size={24}/>}    label="Total Likes"   value={analytics?.totalLikes}      color="#ff6b9d"/>
      </div>

      <div className={styles.quickActions}>
        <Link to="/admin/wallpapers" className="btn btn-primary"><Image size={16}/> Manage Wallpapers</Link>
        <Link to="/admin/upload"     className="btn btn-secondary"><TrendingUp size={16}/> Upload New</Link>
        <Link to="/admin/users"      className="btn btn-ghost"><Users size={16}/> Manage Users</Link>
      </div>

      <div className={styles.panels}>
        {/* Recent wallpapers */}
        <div className={styles.panel}>
          <div className={styles.panelHead}><h3><Clock size={16}/> Recent Wallpapers</h3><Link to="/admin/wallpapers" className={styles.panelLink}>View all</Link></div>
          <div className={styles.list}>
            {analytics?.recentWallpapers?.map(w=>(
              <div key={w._id} className={styles.listItem}>
                <div className={styles.wallpaperThumb} style={{backgroundImage:`url(${w.thumbnailUrl||w.imageUrl})`}}/>
                <div className={styles.listInfo}><strong>{w.title}</strong><span>{w.category} · {timeAgo(w.createdAt)}</span></div>
                <div className={styles.listStats}><span><Download size={11}/> {formatCount(w.downloads)}</span><span><Heart size={11}/> {formatCount(w.likes)}</span></div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent users */}
        <div className={styles.panel}>
          <div className={styles.panelHead}><h3><Users size={16}/> Recent Users</h3><Link to="/admin/users" className={styles.panelLink}>View all</Link></div>
          <div className={styles.list}>
            {analytics?.recentUsers?.map(u=>(
              <div key={u._id} className={styles.listItem}>
                <div className={styles.userAvatar}>{u.name.charAt(0).toUpperCase()}</div>
                <div className={styles.listInfo}><strong>{u.name}</strong><span>{u.email}</span></div>
                <span className={`badge ${u.isVerified?'badge-green':'badge-red'}`}>{u.isVerified?'Verified':'Pending'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category stats */}
        <div className={styles.panel}>
          <div className={styles.panelHead}><h3><TrendingUp size={16}/> Categories</h3></div>
          <div className={styles.list}>
            {analytics?.categoryStats?.slice(0,8).map(c=>{
              const pct = analytics.totalWallpapers > 0 ? Math.round((c.count/analytics.totalWallpapers)*100) : 0
              return (
                <div key={c._id} className={styles.catItem}>
                  <div className={styles.catName}><span>{c._id}</span><span>{c.count}</span></div>
                  <div className={styles.catBar}><div className={styles.catBarFill} style={{width:`${pct}%`}}/></div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
