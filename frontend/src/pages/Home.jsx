import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ArrowRight, Download, Heart, Image, Sparkles } from 'lucide-react'
import WallpaperGrid from '../components/wallpaper/WallpaperGrid'
import api from '../utils/api'
import { formatCount, CATEGORIES } from '../utils/helpers'
import styles from './Home.module.css'

const CAT_ICONS = { Nature:'🌿',Abstract:'🎨',Architecture:'🏛️',Space:'🚀',Animals:'🦁',Technology:'💻',Minimal:'◻️',Dark:'🌑',Colorful:'🌈',Cars:'🚗',Travel:'✈️',Art:'🖼️',Gaming:'🎮',Sports:'⚽',Other:'✨' }

export default function HomePage() {
  const [search, setSearch]             = useState('')
  const [featured, setFeatured]         = useState([])
  const [latest, setLatest]             = useState([])
  const [stats, setStats]               = useState({ wallpapers:0, downloads:0, likes:0 })
  const [loadingFeatured, setLF]        = useState(true)
  const [loadingLatest, setLL]          = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      api.get('/wallpapers?featured=true&limit=8'),
      api.get('/wallpapers?limit=12&sort=newest'),
    ]).then(([featRes, latRes]) => {
      setFeatured(featRes.data.wallpapers)
      setLatest(latRes.data.wallpapers)
      setStats({ wallpapers: latRes.data.pagination.total, downloads: latRes.data.pagination.total * 12, likes: latRes.data.pagination.total * 5 })
    }).catch(console.error)
    .finally(() => { setLF(false); setLL(false) })
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) navigate(`/gallery?search=${encodeURIComponent(search.trim())}`)
  }

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={styles.blob1}/><div className={styles.blob2}/><div className={styles.blob3}/>
          <div className={styles.gridBg}/>
        </div>
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroBadge}><Sparkles size={13}/><span>Premium Wallpaper Collection</span></div>
          <h1 className={styles.heroTitle}>Beautiful Walls for<br/><span className="gradient-text">Every Screen</span></h1>
          <p className={styles.heroSub}>Discover thousands of stunning, high-resolution wallpapers. Free to download, forever.</p>
          <form onSubmit={handleSearch} className={styles.searchBar}>
            <Search size={20} className={styles.searchIcon}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search wallpapers by name, style, or category…" className={styles.searchInput}/>
            <button type="submit" className={`btn btn-primary ${styles.searchBtn}`}>Search</button>
          </form>
          <div className={styles.quickCats}>
            {['Nature','Abstract','Space','Minimal','Dark','Gaming'].map(cat=>(
              <Link key={cat} to={`/gallery?category=${cat}`} className={styles.quickCat}>{CAT_ICONS[cat]} {cat}</Link>
            ))}
          </div>
        </div>
        <div className={`container ${styles.stats}`}>
          {[{icon:<Image size={22}/>,value:formatCount(stats.wallpapers)+'+',label:'Wallpapers'},
            {icon:<Download size={22}/>,value:formatCount(stats.downloads)+'+',label:'Downloads'},
            {icon:<Heart size={22}/>,value:formatCount(stats.likes)+'+',label:'Likes'}].map((s,i)=>(
            <div key={i} className={styles.stat}>
              <div className={styles.statIcon}>{s.icon}</div>
              <div><div className={styles.statValue}>{s.value}</div><div className={styles.statLabel}>{s.label}</div></div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      {(featured.length > 0 || loadingFeatured) && (
        <section className={`section ${styles.section}`}>
          <div className="container">
            <div className={styles.sectionHead}>
              <div><h2>Featured <span className="gradient-text">Wallpapers</span></h2><p>Hand-picked premium selections</p></div>
              <Link to="/gallery?featured=true" className="btn btn-secondary btn-sm">View All <ArrowRight size={14}/></Link>
            </div>
            <WallpaperGrid wallpapers={featured} loading={loadingFeatured} skeletonCount={8}/>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className={`section ${styles.section} ${styles.catSection}`}>
        <div className="container">
          <div className={styles.sectionHead}><div><h2>Browse by <span className="gradient-text">Category</span></h2><p>Find exactly the style you're looking for</p></div></div>
          <div className={styles.catGrid}>
            {CATEGORIES.map(cat=>(
              <Link key={cat} to={`/gallery?category=${cat}`} className={styles.catCard}>
                <span className={styles.catEmoji}>{CAT_ICONS[cat]}</span>
                <span className={styles.catName}>{cat}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest */}
      <section className={`section ${styles.section}`}>
        <div className="container">
          <div className={styles.sectionHead}>
            <div><h2>Latest <span className="gradient-text">Uploads</span></h2><p>Fresh wallpapers added recently</p></div>
            <Link to="/gallery" className="btn btn-secondary btn-sm">View All <ArrowRight size={14}/></Link>
          </div>
          <WallpaperGrid wallpapers={latest} loading={loadingLatest} skeletonCount={12}/>
        </div>
      </section>

      {/* CTA */}
      <section className={`container ${styles.cta}`}>
        <div className={styles.ctaInner}>
          <div className={styles.ctaBg}/>
          <h2>Start Building Your Perfect Collection</h2>
          <p>Create a free account and save your favorite wallpapers.</p>
          <div className={styles.ctaBtns}>
            <Link to="/register" className="btn btn-primary btn-lg">Get Started Free</Link>
            <Link to="/gallery"  className="btn btn-secondary btn-lg">Browse Gallery</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
