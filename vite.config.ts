import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Permite REACT_APP_* (padrão Create React App) além de VITE_* para URL da API.
  envPrefix: ['VITE_', 'REACT_APP_'],
})
