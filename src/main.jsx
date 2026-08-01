import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import ListingContextProvider from './context/listingContext.jsx'
import EngagementContextProvider from './context/engagementContext.jsx'
import RenoVisionContextProvider from './context/renoVisionContext.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ListingContextProvider>
        <EngagementContextProvider>
          <RenoVisionContextProvider>
            <App />
          </RenoVisionContextProvider>
        </EngagementContextProvider>
      </ListingContextProvider>
    </BrowserRouter>
  </StrictMode>,
)
