import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import EgyptMap from './Egyptmap.jsx'
import MasrMap from './MasrMap.jsx'
import Egyptmapoffline from './Egyptmapoffline.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Egyptmapoffline />
    {/* <MasrMap /> */}
    {/* <EgyptMap /> */}
    <App />
  </StrictMode>,
)
