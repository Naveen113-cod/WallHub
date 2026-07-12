import { useState, useRef } from 'react'
import { Upload, X, Image, Tag, CheckCircle } from 'lucide-react'
import api from '../../utils/api'
import { CATEGORIES } from '../../utils/helpers'
import toast from 'react-hot-toast'
import styles from './AdminUpload.module.css'

export default function AdminUpload() {
  const [form, setForm]         = useState({ title:'', description:'', category:'', tags:'', isFeatured:false })
  const [file, setFile]         = useState(null)
  const [preview, setPreview]   = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [success, setSuccess]   = useState(false)
  const fileRef = useRef()

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type==='checkbox' ? e.target.checked : e.target.value }))

  const handleFile = (f) => {
    if (!f) return
    if (f.size > 20*1024*1024) { toast.error('File too large (max 20MB)'); return }
    setFile(f); setPreview(URL.createObjectURL(f))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file)  { toast.error('Please select an image'); return }
    if (!form.title || !form.category) { toast.error('Title and category are required'); return }
    setSubmitting(true); setProgress(0)
    const fd = new FormData()
    fd.append('image', file)
    Object.entries(form).forEach(([k,v]) => fd.append(k, v))
    try {
      await api.post('/wallpapers', fd, {
        headers:{ 'Content-Type':'multipart/form-data' },
        onUploadProgress: e => setProgress(Math.round((e.loaded/e.total)*100)),
      })
      setSuccess(true); toast.success('Wallpaper uploaded successfully!')
      setForm({ title:'', description:'', category:'', tags:'', isFeatured:false })
      setFile(null); setPreview(null)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed') }
    finally { setSubmitting(false); setProgress(0) }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1>Upload <span className="gradient-text">Wallpaper</span></h1>
        <p>Add new wallpapers to the collection</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Drop zone */}
        <div className={`${styles.dropZone} ${preview?styles.dropZoneHasFile:''}`}
          onClick={()=>fileRef.current?.click()}
          onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files?.[0];if(f&&f.type.startsWith('image/'))handleFile(f)}}
          onDragOver={e=>e.preventDefault()}>
          <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={e=>handleFile(e.target.files?.[0])}/>
          {preview ? (
            <div className={styles.previewWrap}>
              <img src={preview} alt="Preview" className={styles.preview}/>
              <button type="button" className={styles.removePreview} onClick={e=>{e.stopPropagation();setFile(null);setPreview(null)}}><X size={16}/></button>
              <div className={styles.previewOverlay}>
                <p className={styles.fileName}>{file?.name}</p>
                <p className={styles.fileSize}>{(file?.size/1024/1024).toFixed(2)} MB</p>
              </div>
            </div>
          ) : (
            <div className={styles.dropContent}>
              <div className={styles.uploadIcon}><Upload size={32}/></div>
              <p className={styles.dropTitle}>Drop your image here or click to browse</p>
              <p className={styles.dropSub}>JPG, PNG, WEBP — max 20MB</p>
            </div>
          )}
        </div>

        <div className={styles.fields}>
          <div className="form-group">
            <label className="form-label">Title <span style={{color:'var(--red)'}}>*</span></label>
            <div style={{position:'relative'}}>
              <Image size={15} style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)'}}/>
              <input type="text" value={form.title} onChange={set('title')} placeholder="e.g. Mountain Sunrise" className="form-input" style={{paddingLeft:40}} required/>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Category <span style={{color:'var(--red)'}}>*</span></label>
            <select value={form.category} onChange={set('category')} className="form-input" required>
              <option value="">Select category…</option>
              {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group" style={{gridColumn:'1/-1'}}>
            <label className="form-label">Description</label>
            <textarea value={form.description} onChange={set('description')} placeholder="Brief description…" rows={3} className="form-input" style={{resize:'vertical'}}/>
          </div>
          <div className="form-group">
            <label className="form-label"><Tag size={13}/> Tags (comma-separated)</label>
            <input type="text" value={form.tags} onChange={set('tags')} placeholder="nature, mountains, sunset" className="form-input"/>
          </div>
          <div className={styles.checkRow}>
            <label className={styles.checkbox}>
              <input type="checkbox" checked={form.isFeatured} onChange={set('isFeatured')}/>
              <span className={styles.checkBox}/>
              Mark as Featured
            </label>
          </div>
        </div>

        {submitting && progress > 0 && (
          <div className={styles.progressWrap}>
            <div className={styles.progressTrack}><div className={styles.progressBar} style={{width:`${progress}%`}}/></div>
            <span>{progress}%</span>
          </div>
        )}

        {success && <div className={styles.successMsg}><CheckCircle size={18}/> Wallpaper uploaded successfully!</div>}

        <button type="submit" className="btn btn-primary btn-lg" style={{alignSelf:'flex-start'}} disabled={submitting}>
          {submitting ? <><div className="spinner spinner-sm"/> Uploading…</> : <><Upload size={18}/> Upload Wallpaper</>}
        </button>
      </form>
    </div>
  )
}
