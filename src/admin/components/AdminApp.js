"use client"

import { useState, useEffect } from "react"
import { Toaster } from "react-hot-toast"
import { ToastProvider } from "./context/ToastContext"
import DashboardPage from "./pages/DashboardPage"
import RecommendationsPage from "./pages/RecommendationsPage"
import SettingsPage from "./pages/SettingsPage"

const AdminApp = () => {
  const [currentPage, setCurrentPage] = useState("dashboard")

  useEffect(() => {
    // Function to determine current page
    const getCurrentPage = () => {
      // First try to get from wpApiSettings
      if (window.wpApiSettings && window.wpApiSettings.currentPage) {
        return window.wpApiSettings.currentPage
      }

      // Fallback: parse URL parameters
      const urlParams = new URLSearchParams(window.location.search)
      const page = urlParams.get('page')

      if (page === 'upsellsmart-recommendations') {
        return 'recommendations'
      } else if (page === 'upsellsmart-settings') {
        return 'settings'
      } else {
        return 'dashboard'
      }
    }

    const detectedPage = getCurrentPage()
    console.log('Detected current page:', detectedPage) // Debug log
    setCurrentPage(detectedPage)
  }, [])

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'recommendations':
        return <RecommendationsPage />
      case 'settings':
        return <SettingsPage />
      default:
        return <DashboardPage />
    }
  }

  const getPageTitle = () => {
    switch (currentPage) {
      case 'recommendations':
        return 'Product Recommendations'
      case 'settings':
        return 'Settings'
      default:
        return 'Dashboard'
    }
  }

  const getPageDescription = () => {
    switch (currentPage) {
      case 'recommendations':
        return 'Manage and configure your product recommendations'
      case 'settings':
        return 'Configure plugin settings and preferences'
      default:
        return 'View analytics and performance metrics'
    }
  }

  return (
    <ToastProvider>
      <div className="upspr-admin-wrapper min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto">
          {/* <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">UpSellSmart – {getPageTitle()}</h1>
            <p className="text-gray-600">{getPageDescription()}</p>
          </div> */}

          {renderCurrentPage()}
        </div>
      </div>
      <Toaster />
    </ToastProvider>
  )
}

export default AdminApp
