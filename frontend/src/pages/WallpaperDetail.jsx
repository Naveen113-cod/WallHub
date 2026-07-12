import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Download, Heart, ArrowLeft, Tag, Calendar, Share2, ExternalLink } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { formatCount, timeAgo, downloadFile } from '../utils/helpers'
import toast from 'react-hot-toast'
import styles from './WallpaperDetail.module.css'

export default function WallpaperDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isLoggedIn, user, updateLiked } = useAuth()
  const [wallpaper, setWallpaper]   = useState(null)
  const [loading, setLoading]       = useState(true)
  const [liked, setLiked]           = useState(false)
  const [likes, setLikes]           = useState(0)
  const [downloading, setDownloading] = useState(false)
  const [imgLoaded, setImgLoaded]   = useState(false)

  useEffect(() => {
    setLoading(true)
    api.get(`/wallpapers/${id}`)
      .then(({ data }) => {
        setWallpaper(data.wallpaper)
        setLiked(data.wallpaper.isLiked || false)
        setLikes(data.wallpaper.likes || 0)
      })
      .catch(() => { toast.error('Wallpaper not found'); navigate('/gallery') })
      .finally(() => setLoading(false))
  }, [id])

  const handleLike = async () => {
    if (!isLoggedIn) { toast.error('Please log in to like wallpapers'); return }
    try {
      const { data } = await api.post(`/wallpapers/${id}/like`)
      setLiked(data.liked)
      setLikes(l => data.liked ? l+1 : l-1)
      const current = user?.likedWallpapers || []
      updateLiked(data.liked ? [...current, id] : current.filter(x=>x!==id))
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const handleDownload = async () => {
    if (!isLoggedIn) { toast.error('Please log in to download wallpapers'); return }
    setDownloading(true)
    try {
      const { data } = await api.post(`/wallpapers/${id}/download`)
      await downloadFile(data.imageUrl, wallpaper.title+'.jpg')
      toast.success('Download started!')
      setWallpaper(w => ({ ...w, downloads: data.downloads }))
    } catch (err) { toast.error(err.response?.data?.message || 'Download failed') }
    finally { setDownloading(false) }
  }

  const handleShare = () => {
    if (navigator.share) navigator.share({ title: wallpaper.title, url: window.location.href })
    else { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!') }
  }

  if (loading) return <div className={styles.page}><div className="container"><div className={`skeleton ${styles.imgSkeleton}`}/></div></div>
  if (!wallpaper) return null

  return (
    <div className={styles.page}>
      <div className="container">
        <button className={styles.back} onClick={()=>navigate(-1)}><ArrowLeft size={18}/> Back</button>
        <div className={styles.layout}>
          <div className={styles.imgSection}>
            <div className={styles.imgWrap}>
              {!imgLoaded && <div className={`skeleton ${styles.imgSkeleton2}`}/>}
              <img src={wallpaper.imageUrl} alt={wallpaper.title}
                className={`${styles.img} ${imgLoaded?styles.imgVisible:''}`}
                onLoad={()=>setImgLoaded(true)}/>
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelTop}>
              <span className="badge badge-accent">{wallpaper.category}</span>
              {wallpaper.isFeatured && <span className="badge badge-gold">★ Featured</span>}
            </div>
            <h1 className={styles.title}>{wallpaper.title}</h1>
            {wallpaper.description && <p className={styles.desc}>{wallpaper.description}</p>}

            <div className={styles.statsRow}>
              <div className={styles.stat}><Download size={16}/><span>{formatCount(wallpaper.downloads)}</span><label>Downloads</label></div>
              <div className={styles.stat}><Heart size={16}/><span>{formatCount(likes)}</span><label>Likes</label></div>
              <div className={styles.stat}><Calendar size={16}/><span>{timeAgo(wallpaper.createdAt)}</span><label>Uploaded</label></div>
            </div>

            {wallpaper.tags?.length > 0 && (
              <div className={styles.tags}>
                <Tag size={14}/>
                {wallpaper.tags.map(t=><Link key={t} to={`/gallery?search=${t}`} className={styles.tag}>#{t}</Link>)}
              </div>
            )}

            <div className={styles.actions}>
              <button className={`btn btn-primary btn-lg ${styles.dlBtn}`} onClick={handleDownload} disabled={downloading}>
                {downloading ? <><div className="spinner spinner-sm"/> Downloading…</> : <><Download size={18}/> Download</>}
              </button>
              <button className={`btn btn-lg ${liked?styles.likedBtn:'btn-secondary'}`} onClick={handleLike}>
                <Heart size={18} fill={liked?'currentColor':'none'}/>{liked?'Liked':'Like'}
              </button>
              <button className="btn btn-ghost btn-lg" onClick={handleShare}><Share2 size={18}/></button>
              <a href={wallpaper.imageUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-lg"><ExternalLink size={18}/></a>
            </div>

            {!isLoggedIn && (
              <div className={styles.loginPrompt}>
                <p><Link to="/login">Log in</Link> or <Link to="/register">create an account</Link> to download and like wallpapers.</p>
              </div>
            )}

            <div className={styles.metaTable}>
              <div className={styles.metaRow}><Tag size={14}/><span>Category</span><Link to={`/gallery?category=${wallpaper.category}`} className={styles.catLink}>{wallpaper.category}</Link></div>
              <div className={styles.metaRow}><Calendar size={14}/><span>Added</span><strong>{new Date(wallpaper.createdAt).toLocaleDateString()}</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
