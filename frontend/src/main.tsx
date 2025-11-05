import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Router from './Router.tsx'
import './style.css'
import { ToastProvider } from '@contexts/toasts/ToastContext.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <Router />
  </StrictMode>,
)
