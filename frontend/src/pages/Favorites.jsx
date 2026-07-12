import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import WallpaperGrid from '../components/wallpaper/WallpaperGrid'
import api from '../utils/api'
import styles from './Favorites.module.css'

export default function FavoritesPage() {
  const [wallpapers, setWallpapers] = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    api.get('/wallpapers/liked')
      .then(({ data }) => setWallpapers(data.wallpapers.map(w => ({ ...w, isLiked: true }))))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleLikeToggle = (id, liked) => {
    if (!liked) setWallpapers(ws => ws.filter(w => w._id !== id))
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <Heart size={28} style={{ color:'var(--red)' }} fill="currentColor"/>
          <div>
            <h1>My <span className="gradient-text">Favorites</span></h1>
            <p>{loading ? '…' : wallpapers.length} saved wallpapers</p>
          </div>
        </div>
        {!loading && wallpapers.length === 0 ? (
          <div className="empty-state">
            <Heart size={64}/>
            <h3>No favorites yet</h3>
            <p>Like wallpapers to save them here.</p>
            <Link to="/gallery" className="btn btn-primary" style={{ marginTop:8 }}>Browse Gallery</Link>
          </div>
        ) : (
          <WallpaperGrid wallpapers={wallpapers} loading={loading} onLikeToggle={handleLikeToggle}/>
        )}
      </div>
    </div>
  )
}
