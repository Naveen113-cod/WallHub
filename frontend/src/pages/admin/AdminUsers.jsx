import { useState, useEffect, useCallback } from 'react'
import { Search, X, Trash2, ShieldOff, ShieldCheck, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import api from '../../utils/api'
import { timeAgo } from '../../utils/helpers'
import toast from 'react-hot-toast'
import styles from './AdminUsers.module.css'

export default function AdminUsers() {
  const [users, setUsers]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [pagination, setPagination] = useState({ page:1, pages:1, total:0 })
  const [page, setPage]             = useState(1)
  const [search, setSearch]         = useState('')
  const [deleteId, setDeleteId]     = useState(null)
  const [deleting, setDeleting]     = useState(false)
  const [togglingId, setTogglingId] = useState(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const q = new URLSearchParams({ page, limit:15 })
      if (search) q.set('search', search)
      const { data } = await api.get(`/admin/users?${q}`)
      setUsers(data.users); setPagination(data.pagination)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleToggle = async (userId) => {
    setTogglingId(userId)
    try {
      const { data } = await api.put(`/admin/users/${userId}/toggle-status`)
      setUsers(us=>us.map(u=>u._id===userId?{...u,isActive:data.user.isActive}:u))
      toast.success(data.message)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setTogglingId(null) }
  }

  const handleDelete = async (userId) => {
    setDeleting(true)
    try {
      await api.delete(`/admin/users/${userId}`)
      toast.success('User deleted')
      setUsers(us=>us.filter(u=>u._id!==userId)); setDeleteId(null)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setDeleting(false) }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}><h1>Manage <span className="gradient-text">Users</span></h1><p>{pagination.total} registered users</p></div>

      <div className={styles.bar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon}/>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} placeholder="Search by name or email…" className={styles.searchInput}/>
          {search && <button onClick={()=>setSearch('')} className={styles.clearBtn}><X size={13}/></button>}
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>User</th><th>Email</th><th>Joined</th><th>Verified</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading
              ? Array.from({length:8}).map((_,i)=><tr key={i}>{Array.from({length:6}).map((_,j)=><td key={j}><div className={`skeleton ${styles.skCell}`}/></td>)}</tr>)
              : users.map(u=>(
                  <tr key={u._id} className={!u.isActive?styles.rowInactive:''}>
                    <td><div className={styles.userCell}><div className={styles.avatar}>{u.name.charAt(0).toUpperCase()}</div><span className={styles.userName}>{u.name}</span></div></td>
                    <td className={styles.email}>{u.email}</td>
                    <td className={styles.muted}>{timeAgo(u.createdAt)}</td>
                    <td>{u.isVerified?<span className="badge badge-green">Verified</span>:<span className="badge badge-red">Pending</span>}</td>
                    <td>{u.isActive?<span className="badge badge-accent">Active</span>:<span className="badge badge-red">Banned</span>}</td>
                    <td>
                      <div className={styles.rowActions}>
                        <button className={`${styles.actionBtn} ${u.isActive?styles.banBtn:styles.unbanBtn}`}
                          onClick={()=>handleToggle(u._id)} disabled={togglingId===u._id}
                          title={u.isActive?'Ban user':'Unban user'}>
                          {togglingId===u._id?<div className="spinner spinner-sm"/>:u.isActive?<ShieldOff size={14}/>:<ShieldCheck size={14}/>}
                        </button>
                        {deleteId===u._id ? (
                          <div className={styles.confirmDelete}>
                            <span>Delete?</span>
                            <button className={styles.confirmYes} onClick={()=>handleDelete(u._id)} disabled={deleting}>{deleting?<div className="spinner spinner-sm"/>:<Check size={12}/>}</button>
                            <button className={styles.confirmNo} onClick={()=>setDeleteId(null)}><X size={12}/></button>
                          </div>
                        ) : (
                          <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={()=>setDeleteId(u._id)} title="Delete user"><Trash2 size={14}/></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
        {!loading && users.length===0 && <div className="empty-state" style={{padding:'48px'}}><p>No users found.</p></div>}
      </div>

      {pagination.pages > 1 && (
        <div className={styles.pagination}>
          <button className="btn btn-ghost btn-sm" disabled={page<=1} onClick={()=>setPage(p=>p-1)}><ChevronLeft size={16}/> Prev</button>
          <span className={styles.pageInfo}>Page {page} of {pagination.pages}</span>
          <button className="btn btn-ghost btn-sm" disabled={page>=pagination.pages} onClick={()=>setPage(p=>p+1)}>Next <ChevronRight size={16}/></button>
        </div>
      )}
    </div>
  )
}
