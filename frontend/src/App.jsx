import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'

import Navbar       from './components/layout/Navbar'
import Footer       from './components/layout/Footer'
import AdminLayout  from './components/layout/AdminLayout'
import CursorSpark  from './components/common/CursorSpark'

import Home            from './pages/Home'
import Gallery         from './pages/Gallery'
import WallpaperDetail from './pages/WallpaperDetail'
import Login           from './pages/Login'
import Register        from './pages/Register'
import ForgotPassword  from './pages/ForgotPassword'
import VerifyEmail     from './pages/VerifyEmail'
import Favorites       from './pages/Favorites'

import AdminLogin      from './pages/admin/AdminLogin'
import AdminDashboard  from './pages/admin/AdminDashboard'
import AdminWallpapers from './pages/admin/AdminWallpapers'
import AdminUpload     from './pages/admin/AdminUpload'
import AdminUsers      from './pages/admin/AdminUsers'

function PrivateRoute({ children }) {
  const { isLoggedIn, initialized } = useAuth()
  const location = useLocation()
  if (!initialized) return <div className="page-loader"><div className="spinner"/></div>
  if (!isLoggedIn)  return <Navigate to="/login" state={{ from: location.pathname }} replace/>
  return children
}

function GuestRoute({ children }) {
  const { isLoggedIn, initialized } = useAuth()
  if (!initialized) return <div className="page-loader"><div className="spinner"/></div>
  if (isLoggedIn)   return <Navigate to="/" replace/>
  return children
}

function AdminRoute({ children }) {
  const { isLoggedIn, isAdmin, initialized } = useAuth()
  const location = useLocation()
  if (!initialized) return <div className="page-loader"><div className="spinner"/></div>
  if (!isLoggedIn)  return <Navigate to="/admin/login" state={{ from: location.pathname }} replace/>
  if (!isAdmin)     return <Navigate to="/" replace/>
  return children
}

function PublicLayout({ children }) {
  return (
    <>
      <Navbar/>
      <div style={{ minHeight:'100vh' }}>{children}</div>
      <Footer/>
    </>
  )
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"             element={<PublicLayout><Home/></PublicLayout>}/>
      <Route path="/gallery"      element={<PublicLayout><Gallery/></PublicLayout>}/>
      <Route path="/wallpaper/:id" element={<PublicLayout><WallpaperDetail/></PublicLayout>}/>
      <Route path="/forgot-password"    element={<PublicLayout><ForgotPassword/></PublicLayout>}/>
      <Route path="/verify-email/:token" element={<PublicLayout><VerifyEmail/></PublicLayout>}/>

      {/* Guest only */}
      <Route path="/login"    element={<GuestRoute><PublicLayout><Login/></PublicLayout></GuestRoute>}/>
      <Route path="/register" element={<GuestRoute><PublicLayout><Register/></PublicLayout></GuestRoute>}/>

      {/* Private */}
      <Route path="/favorites" element={<PrivateRoute><PublicLayout><Favorites/></PublicLayout></PrivateRoute>}/>

      {/* Admin login (no layout) */}
      <Route path="/admin/login" element={<AdminLogin/>}/>

      {/* Admin panel */}
      <Route path="/admin" element={<AdminRoute><AdminLayout/></AdminRoute>}>
        <Route index          element={<AdminDashboard/>}/>
        <Route path="wallpapers" element={<AdminWallpapers/>}/>
        <Route path="upload"     element={<AdminUpload/>}/>
        <Route path="users"      element={<AdminUsers/>}/>
      </Route>

      {/* 404 */}
      <Route path="*" element={
        <PublicLayout>
          <div className="empty-state" style={{ minHeight:'80vh' }}>
            <h1 style={{ fontSize:'80px', fontWeight:900, color:'var(--accent)' }}>404</h1>
            <h2>Page Not Found</h2>
            <p>The page you're looking for doesn't exist.</p>
            <a href="/" className="btn btn-primary" style={{ marginTop:8 }}>Go Home</a>
          </div>
        </PublicLayout>
      }/>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CursorSpark/>
          <AppRoutes/>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                fontSize: '14px',
                fontFamily: 'var(--font-sans)',
                boxShadow: 'var(--shadow-md)',
              },
              success: { iconTheme: { primary:'#2ed573', secondary:'#fff' } },
              error:   { iconTheme: { primary:'#ff4757', secondary:'#fff' } },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
