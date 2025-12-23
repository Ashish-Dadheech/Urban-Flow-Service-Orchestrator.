import './App.css'
import { AlertProvider } from './context/AlertContext'
import Dashboard from './components/Dashboard'

function App() {
  return (
    <AlertProvider>
      <Dashboard />
    </AlertProvider>
  )
}

export default App
