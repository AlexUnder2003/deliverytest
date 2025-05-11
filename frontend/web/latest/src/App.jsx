import { useState } from 'react'
import DeliveryReportPage from '../components/DeliveryReport'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <DeliveryReportPage />
    </>
  )
}

export default App
