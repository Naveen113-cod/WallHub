import { createContext, useContext, useEffect, useReducer, useCallback } from 'react'
import api from '../utils/api'

const AuthContext = createContext()

const initialState = {
  user: JSON.parse(localStorage.getItem('wallhub_user') || 'null'),
  token: localStorage.getItem('wallhub_token') || null,
  loading: false,
  initialized: false,
}

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':   return { ...state, loading: action.payload }
    case 'LOGIN_SUCCESS':
      localStorage.setItem('wallhub_token', action.payload.token)
      localStorage.setItem('wallhub_user', JSON.stringify(action.payload.user))
      return { ...state, user: action.payload.user, token: action.payload.token, loading: false, initialized: true }
    case 'LOGOUT':
      localStorage.removeItem('wallhub_token')
      localStorage.removeItem('wallhub_user')
      return { ...state, user: null, token: null, loading: false, initialized: true }
    case 'INITIALIZED':   return { ...state, initialized: true, loading: false }
    case 'UPDATE_LIKED':
      const updated = { ...state.user, likedWallpapers: action.payload }
      localStorage.setItem('wallhub_user', JSON.stringify(updated))
      return { ...state, user: updated }
    default: return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const verify = async () => {
      const token = localStorage.getItem('wallhub_token')
      if (!token) { dispatch({ type: 'INITIALIZED' }); return }
      try {
        const { data } = await api.get('/auth/me')
        dispatch({ type: 'LOGIN_SUCCESS', payload: { token, user: data.user } })
      } catch {
        dispatch({ type: 'LOGOUT' })
      }
    }
    verify()
  }, [])

  const login = useCallback(async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    const { data } = await api.post('/auth/login', { email, password })
    dispatch({ type: 'LOGIN_SUCCESS', payload: data })
    return data
  }, [])

  const adminLogin = useCallback(async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    const { data } = await api.post('/auth/admin/login', { email, password })
    dispatch({ type: 'LOGIN_SUCCESS', payload: data })
    return data
  }, [])

  const register = useCallback(async (name, email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    const { data } = await api.post('/auth/register', { name, email, password })
    dispatch({ type: 'SET_LOADING', payload: false })
    return data
  }, [])

  const logout = useCallback(() => { dispatch({ type: 'LOGOUT' }) }, [])

  const updateLiked = useCallback((likedIds) => {
    dispatch({ type: 'UPDATE_LIKED', payload: likedIds })
  }, [])

  return (
    <AuthContext.Provider value={{
      ...state, login, adminLogin, register, logout, updateLiked,
      isAdmin: state.user?.role === 'admin',
      isLoggedIn: !!state.user,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
