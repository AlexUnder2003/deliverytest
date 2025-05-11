import { useState } from 'react'
import DeliveryReportPage from '../components/DeliveryReport'
import './App.css'

// Создаем компонент Layout
const Layout = ({ children }) => {
  return (
    <div className="w-full max-w-[1920px] mx-auto px-4">
      {children}
    </div>
  )
}

function App() {

  return (
    <Layout>
      <DeliveryReportPage />
    </Layout>
  )
}

export default App
