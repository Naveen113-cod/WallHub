import { useState, useCallback } from 'react'
import { Heart, Download, ZoomIn } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { formatCount } from '../../utils/helpers'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import styles from './WallpaperCard.module.css'

export default function WallpaperCard({ wallpaper, onLikeToggle }) {
  const { isLoggedIn, user, updateLiked } = useAuth()
  const [liked, setLiked]           = useState(wallpaper.isLiked || (user?.likedWallpapers||[]).includes(wallpaper._id))
  const [likes, setLikes]           = useState(wallpaper.likes || 0)
  const [likeLoading, setLikeLoading] = useState(false)
  const [imgLoaded, setImgLoaded]   = useState(false)

  const handleLike = useCallback(async (e) => {
    e.preventDefault(); e.stopPropagation()
    if (!isLoggedIn) { toast.error('Please log in to like wallpapers'); return }
    if (likeLoading) return
    setLikeLoading(true)
    try {
      const { data } = await api.post(`/wallpapers/${wallpaper._id}/like`)
      setLiked(data.liked)
      setLikes(l => data.liked ? l + 1 : l - 1)
      const current = user?.likedWallpapers || []
      updateLiked(data.liked ? [...current, wallpaper._id] : current.filter(id => id !== wallpaper._id))
      if (onLikeToggle) onLikeToggle(wallpaper._id, data.liked)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setLikeLoading(false) }
  }, [isLoggedIn, likeLoading, wallpaper._id, user, updateLiked, onLikeToggle])

  return (
    <Link to={`/wallpaper/${wallpaper._id}`} className={styles.card}>
      <div className={styles.imgWrap}>
        {!imgLoaded && <div className={`skeleton ${styles.imgSkeleton}`}/>}
        <img src={wallpaper.thumbnailUrl || wallpaper.imageUrl} alt={wallpaper.title}
          className={`${styles.img} ${imgLoaded ? styles.imgVisible : ''}`}
          onLoad={()=>setImgLoaded(true)} loading="lazy"/>
        <div className={styles.overlay}>
          <div className={styles.overlayActions}>
            <button className={`${styles.action} ${liked?styles.actionLiked:''}`} onClick={handleLike}>
              <Heart size={15} fill={liked?'currentColor':'none'}/><span>{formatCount(likes)}</span>
            </button>
            <div className={styles.action}><Download size={15}/><span>{formatCount(wallpaper.downloads)}</span></div>
          </div>
          <div className={styles.viewBtn}><ZoomIn size={18}/></div>
        </div>
        <span className={styles.categoryBadge}>{wallpaper.category}</span>
        {wallpaper.isFeatured && <span className={styles.featuredBadge}>★ Featured</span>}
      </div>
      <div className={styles.info}>
        <p className={styles.title}>{wallpaper.title}</p>
        <div className={styles.meta}>
          <span><Heart size={12}/> {formatCount(likes)}</span>
          <span><Download size={12}/> {formatCount(wallpaper.downloads)}</span>
        </div>
      </div>
    </Link>
  )
}
