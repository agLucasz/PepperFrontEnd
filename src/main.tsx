import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './Styles/index.css'
import AppRoutes from './Routes/AppRoutes.tsx'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
  </StrictMode>,
)
