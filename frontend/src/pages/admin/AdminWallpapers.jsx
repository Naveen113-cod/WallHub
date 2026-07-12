import { useState, useEffect, useCallback } from 'react'
import { Pencil, Trash2, Search, X, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../../utils/api'
import { formatCount, timeAgo, CATEGORIES } from '../../utils/helpers'
import toast from 'react-hot-toast'
import styles from './AdminWallpapers.module.css'

function EditModal({ wallpaper, onClose, onSave }) {
  const [form, setForm] = useState({ title:wallpaper.title, description:wallpaper.description||'', category:wallpaper.category, tags:(wallpaper.tags||[]).join(', '), isFeatured:wallpaper.isFeatured||false })
  const [saving, setSaving] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type==='checkbox'?e.target.checked:e.target.value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data } = await api.put(`/wallpapers/${wallpaper._id}`, form)
      toast.success('Wallpaper updated!'); onSave(data.wallpaper)
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed') }
    finally { setSaving(false) }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className={styles.modal} onClick={e=>e.stopPropagation()}>
        <div className={styles.modalHead}><h3>Edit Wallpaper</h3><button onClick={onClose} className={styles.closeBtn}><X size={18}/></button></div>
        <div className={styles.modalThumb} style={{backgroundImage:`url(${wallpaper.thumbnailUrl||wallpaper.imageUrl})`}}/>
        <div className={styles.modalFields}>
          <div className="form-group"><label className="form-label">Title</label><input type="text" value={form.title} onChange={set('title')} className="form-input" required/></div>
          <div className="form-group"><label className="form-label">Category</label>
            <select value={form.category} onChange={set('category')} className="form-input">
              {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group" style={{gridColumn:'1/-1'}}><label className="form-label">Description</label><textarea value={form.description} onChange={set('description')} rows={3} className="form-input" style={{resize:'vertical'}}/></div>
          <div className="form-group"><label className="form-label">Tags (comma-separated)</label><input type="text" value={form.tags} onChange={set('tags')} className="form-input" placeholder="nature, sky"/></div>
          <div className={styles.checkRow}>
            <label className={styles.checkLabel}><input type="checkbox" checked={form.isFeatured} onChange={set('isFeatured')}/><span className={styles.checkBox}/>Featured</label>
          </div>
        </div>
        <div className={styles.modalActions}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving?<><div className="spinner spinner-sm"/> Saving…</>:<><Check size={16}/> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminWallpapers() {
  const [wallpapers, setWallpapers] = useState([])
  const [loading, setLoading]       = useState(true)
  const [pagination, setPagination] = useState({ page:1, pages:1, total:0 })
  const [page, setPage]             = useState(1)
  const [search, setSearch]         = useState('')
  const [category, setCategory]     = useState('')
  const [editTarget, setEditTarget] = useState(null)
  const [deleteId, setDeleteId]     = useState(null)
  const [deleting, setDeleting]     = useState(false)

  const fetchWallpapers = useCallback(async () => {
    setLoading(true)
    try {
      const q = new URLSearchParams({ page, limit:15 })
      if (search)   q.set('search',   search)
      if (category) q.set('category', category)
      const { data } = await api.get(`/admin/wallpapers?${q}`)
      setWallpapers(data.wallpapers); setPagination(data.pagination)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [page, search, category])

  useEffect(() => { fetchWallpapers() }, [fetchWallpapers])

  const handleDelete = async (id) => {
    setDeleting(true)
    try {
      await api.delete(`/wallpapers/${id}`)
      toast.success('Wallpaper deleted')
      setWallpapers(ws=>ws.filter(w=>w._id!==id)); setDeleteId(null)
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed') }
    finally { setDeleting(false) }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}><h1>Manage <span className="gradient-text">Wallpapers</span></h1><p>{pagination.total} total wallpapers</p></div>

      <div className={styles.bar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon}/>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} placeholder="Search by title…" className={styles.searchInput}/>
          {search && <button onClick={()=>setSearch('')} className={styles.clearBtn}><X size={13}/></button>}
        </div>
        <select value={category} onChange={e=>{setCategory(e.target.value);setPage(1)}} className={styles.select}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Wallpaper</th><th>Category</th><th>Downloads</th><th>Likes</th><th>Uploaded</th><th>Featured</th><th>Actions</th></tr></thead>
          <tbody>
            {loading
              ? Array.from({length:8}).map((_,i)=><tr key={i}>{Array.from({length:7}).map((_,j)=><td key={j}><div className={`skeleton ${styles.skCell}`}/></td>)}</tr>)
              : wallpapers.map(w=>(
                  <tr key={w._id}>
                    <td><div className={styles.wallpaperCell}><div className={styles.thumb} style={{backgroundImage:`url(${w.thumbnailUrl||w.imageUrl})`}}/><span className={styles.wallpaperTitle}>{w.title}</span></div></td>
                    <td><span className="badge badge-accent">{w.category}</span></td>
                    <td className={styles.num}>{formatCount(w.downloads)}</td>
                    <td className={styles.num}>{formatCount(w.likes)}</td>
                    <td className={styles.muted}>{timeAgo(w.createdAt)}</td>
                    <td>{w.isFeatured?<span className="badge badge-gold">★ Yes</span>:<span className={styles.muted}>—</span>}</td>
                    <td>
                      <div className={styles.rowActions}>
                        <button className={styles.editBtn} onClick={()=>setEditTarget(w)} title="Edit"><Pencil size={14}/></button>
                        {deleteId===w._id ? (
                          <div className={styles.confirmDelete}>
                            <span>Delete?</span>
                            <button className={styles.confirmYes} onClick={()=>handleDelete(w._id)} disabled={deleting}>{deleting?<div className="spinner spinner-sm"/>:<Check size={12}/>}</button>
                            <button className={styles.confirmNo} onClick={()=>setDeleteId(null)}><X size={12}/></button>
                          </div>
                        ) : (
                          <button className={styles.deleteBtn} onClick={()=>setDeleteId(w._id)} title="Delete"><Trash2 size={14}/></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
        {!loading && wallpapers.length===0 && <div className="empty-state" style={{padding:'48px'}}><p>No wallpapers found.</p></div>}
      </div>

      {pagination.pages > 1 && (
        <div className={styles.pagination}>
          <button className="btn btn-ghost btn-sm" disabled={page<=1} onClick={()=>setPage(p=>p-1)}><ChevronLeft size={16}/> Prev</button>
          <span className={styles.pageInfo}>Page {page} of {pagination.pages}</span>
          <button className="btn btn-ghost btn-sm" disabled={page>=pagination.pages} onClick={()=>setPage(p=>p+1)}>Next <ChevronRight size={16}/></button>
        </div>
      )}

      {editTarget && <EditModal wallpaper={editTarget} onClose={()=>setEditTarget(null)} onSave={w=>{setWallpapers(ws=>ws.map(x=>x._id===w._id?w:x));setEditTarget(null)}}/>}
    </div>
  )
}
