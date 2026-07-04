import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App'

import './index.css'

const clerkPubKey =
import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_example'

// Render app without ClerkProvider for development
// ClerkProvider will be integrated later after setting up Clerk project
ReactDOM.createRoot(
document.getElementById('root')
).render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>
)