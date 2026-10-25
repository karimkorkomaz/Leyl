import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'lenis/dist/lenis.css'
import './styles/fonts.css'
import './styles/tokens.css'
import './styles/global.css'
import App from './App.tsx'
import { dev } from './lib/dev'
import { gsap } from './motion/gsap'
import { sceneState } from './motion/sceneState'
import { setEdition } from './state/edition'

if (import.meta.env.DEV) Object.assign(window, { __leyl: Object.assign(dev, { gsap, sceneState, setEdition }) })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
