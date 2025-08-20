import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

import './custom.scss';


createRoot(document.getElementById('root')!).render(
  <div className="w-100 h-100">
    <StrictMode>
      <App />
    </StrictMode>
  </div>
)