import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/global.css'
import App from './App.tsx'
import DevicePreview, { isEmbedded } from './components/DevicePreview'
import './styles/states.css'

// inside the phone preview: behave like a phone (overlay scrollbars, no desktop gutter)
if (isEmbedded()) document.documentElement.classList.add('is-embed')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isEmbedded() ? (
      <App />
    ) : (
      <DevicePreview>
        <App />
      </DevicePreview>
    )}
  </StrictMode>,
)
