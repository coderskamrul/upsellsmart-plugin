"use client"

import { useState, useEffect } from "react"
import { Toaster } from "react-hot-toast"
import { ToastProvider } from "./context/ToastContext"
import Navbar from "./common/Navbar"
import DashboardPage from "./pages/DashboardPage"
import CampaignAnalyticsPage from "./pages/CampaignAnalyticsPage"
import RecommendationsPage from "./pages/RecommendationsPage"
import SettingsPage from "./pages/SettingsPage"
import MiddlewareTestPage from "./MiddlewareTestPage"

const AdminApp = () => {
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [selectedCampaignId, setSelectedCampaignId] = useState(null)

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
      } else if (page === 'upsellsmart-test') {
        return 'test'
      } else {
        return 'dashboard'
      }
    }

    const detectedPage = getCurrentPage()
    console.log('Detected current page:', detectedPage) // Debug log
    setCurrentPage(detectedPage)
  }, [])

  const handleViewCampaign = (campaignId) => {
    console.log('AdminApp: handleViewCampaign called with ID:', campaignId, 'Type:', typeof campaignId)
    setSelectedCampaignId(campaignId)
  }

  const handleBackToDashboard = () => {
    console.log('AdminApp: handleBackToDashboard called')
    setSelectedCampaignId(null)
  }

  const renderCurrentPage = () => {
    console.log('AdminApp: renderCurrentPage - currentPage:', currentPage, 'selectedCampaignId:', selectedCampaignId)

    switch (currentPage) {
      case 'recommendations':
        return <RecommendationsPage />
      case 'settings':
        return <SettingsPage />
      case 'test':
        return <MiddlewareTestPage />
      default:
        // Dashboard with campaign analytics view
        if (selectedCampaignId) {
          console.log('AdminApp: Rendering CampaignAnalyticsPage with ID:', selectedCampaignId)
          return <CampaignAnalyticsPage campaignId={selectedCampaignId} onBack={handleBackToDashboard} />
        }
        console.log('AdminApp: Rendering DashboardPage')
        return <DashboardPage onViewCampaign={handleViewCampaign} />
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
      <div className="upspr-admin-wrapper min-h-screen bg-gray-50">
        {/* Navigation Bar */}
        <Navbar currentPage={currentPage} />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {renderCurrentPage()}
        </div>
      </div>
      <Toaster />
    </ToastProvider>
  )
}

export default AdminApp
