import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // REPLACE 'dsa-tracker' WITH YOUR EXACT REPO NAME
  base: '/DSA-Tracker/', 
})