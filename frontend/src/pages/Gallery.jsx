import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react'
import WallpaperGrid from '../components/wallpaper/WallpaperGrid'
import api from '../utils/api'
import { CATEGORIES } from '../utils/helpers'
import styles from './Gallery.module.css'

const SORT_OPTIONS = [
  { value:'newest',  label:'Newest'         },
  { value:'oldest',  label:'Oldest'         },
  { value:'popular', label:'Most Downloaded' },
  { value:'liked',   label:'Most Liked'     },
]

export default function GalleryPage() {
  const [params, setParams]         = useSearchParams()
  const [wallpapers, setWallpapers] = useState([])
  const [loading, setLoading]       = useState(true)
  const [pagination, setPagination] = useState({ page:1, pages:1, total:0 })
  const [filtersOpen, setFiltersOpen] = useState(false)

  const search   = params.get('search')   || ''
  const category = params.get('category') || 'All'
  const sort     = params.get('sort')     || 'newest'
  const page     = parseInt(params.get('page') || '1')

  const fetchWallpapers = useCallback(async () => {
    setLoading(true)
    try {
      const q = new URLSearchParams({ page, limit:20, sort })
      if (search) q.set('search', search)
      if (category !== 'All') q.set('category', category)
      const { data } = await api.get(`/wallpapers?${q}`)
      setWallpapers(data.wallpapers)
      setPagination(data.pagination)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [search, category, sort, page])

  useEffect(() => { fetchWallpapers() }, [fetchWallpapers])

  const setParam = (key, val) => {
    const next = new URLSearchParams(params)
    if (val) next.set(key, val); else next.delete(key)
    if (key !== 'page') next.delete('page')
    setParams(next)
  }

  const clearFilters = () => setParams({})
  const hasFilters   = search || category !== 'All' || sort !== 'newest'

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <div>
            <h1>Wallpaper <span className="gradient-text">Gallery</span></h1>
            <p>{pagination.total.toLocaleString()} wallpapers available</p>
          </div>
        </div>

        {/* Search + controls */}
        <div className={styles.bar}>
          <div className={styles.searchWrap}>
            <Search size={17} className={styles.searchIcon}/>
            <input value={search} onChange={e=>setParam('search',e.target.value)}
              placeholder="Search wallpapers…" className={styles.searchInput}/>
            {search && <button onClick={()=>setParam('search','')} className={styles.clearBtn}><X size={14}/></button>}
          </div>
          <div className={styles.controls}>
            <select value={sort} onChange={e=>setParam('sort',e.target.value)} className={styles.select}>
              {SORT_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button className={`${styles.filterToggle} ${filtersOpen?styles.filterActive:''}`} onClick={()=>setFiltersOpen(o=>!o)}>
              <SlidersHorizontal size={16}/> Filters
            </button>
            {hasFilters && <button className="btn btn-ghost btn-sm" onClick={clearFilters}><X size={14}/> Clear</button>}
          </div>
        </div>

        {/* Category chips */}
        {filtersOpen && (
          <div className={styles.categoryChips}>
            {['All',...CATEGORIES].map(cat=>(
              <button key={cat} onClick={()=>setParam('category',cat==='All'?'':cat)}
                className={`${styles.chip} ${category===cat||(cat==='All'&&category==='All')?styles.chipActive:''}`}>
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Active pills */}
        {(category!=='All'||search) && (
          <div className={styles.activePills}>
            {category!=='All' && <span className={styles.pill}>{category}<button onClick={()=>setParam('category','')}><X size={11}/></button></span>}
            {search && <span className={styles.pill}>"{search}"<button onClick={()=>setParam('search','')}><X size={11}/></button></span>}
          </div>
        )}

        <WallpaperGrid wallpapers={wallpapers} loading={loading}/>

        {/* Pagination */}
        {!loading && pagination.pages > 1 && (
          <div className={styles.pagination}>
            <button className="btn btn-ghost btn-sm" disabled={page<=1} onClick={()=>setParam('page',page-1)}>
              <ChevronLeft size={16}/> Prev
            </button>
            <div className={styles.pageNums}>
              {Array.from({length:Math.min(pagination.pages,7)},(_,i)=>{
                let p = i+1
                if(pagination.pages>7){
                  if(page<=4) p=i+1
                  else if(page>=pagination.pages-3) p=pagination.pages-6+i
                  else p=page-3+i
                }
                return (
                  <button key={p} onClick={()=>setParam('page',p)}
                    className={`${styles.pageBtn} ${p===page?styles.pageBtnActive:''}`}>{p}</button>
                )
              })}
            </div>
            <button className="btn btn-ghost btn-sm" disabled={page>=pagination.pages} onClick={()=>setParam('page',page+1)}>
              Next <ChevronRight size={16}/>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
