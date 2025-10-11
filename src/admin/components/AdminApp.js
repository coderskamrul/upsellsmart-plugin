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

  // Helper function to update WordPress admin menu highlighting
  const updateWordPressMenuHighlight = (page) => {
    // Map page names to WordPress menu slugs
    const pageToSlug = {
      'dashboard': 'upsellsmart',
      'recommendations': 'upsellsmart-recommendations',
      'settings': 'upsellsmart-settings',
      'test': 'upsellsmart-test'
    }

    const slug = pageToSlug[page] || 'upsellsmart'

    // Remove current class from all menu items
    const menuItems = document.querySelectorAll('#adminmenu .current')
    menuItems.forEach(item => item.classList.remove('current'))

    // Add current class to the target menu item
    const targetMenuItem = document.querySelector(`#adminmenu a[href*="page=${slug}"]`)
    if (targetMenuItem) {
      targetMenuItem.parentElement.classList.add('current')
    }
  }

  useEffect(() => {
    // Function to determine current page from hash or URL
    const getCurrentPage = () => {
      // First check hash (for client-side routing)
      const hash = window.location.hash.replace('#', '')
      if (hash) {
        return hash
      }

      // Then try to get from wpApiSettings
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
    console.log('Detected current page:', detectedPage)
    setCurrentPage(detectedPage)

    // Listen for hash changes (browser back/forward)
    const handleHashChange = () => {
      const newPage = window.location.hash.replace('#', '') || 'dashboard'
      console.log('Hash changed to:', newPage)
      setCurrentPage(newPage)
      setSelectedCampaignId(null) // Reset campaign view on page change

      // Update WordPress menu highlighting
      updateWordPressMenuHighlight(newPage)

      // Update page title
      const pageTitles = {
        'dashboard': 'Dashboard',
        'recommendations': 'Campaigns',
        'settings': 'Settings',
        'test': 'Middleware Test'
      }
      const pageTitle = pageTitles[newPage] || 'Dashboard'
      document.title = `${pageTitle} ‹ UpsellSmart — WordPress`
    }

    window.addEventListener('hashchange', handleHashChange)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])

  const handleNavigate = (page) => {
    console.log('AdminApp: Navigating to:', page)
    // Update hash without page reload
    window.location.hash = page
    setCurrentPage(page)
    setSelectedCampaignId(null) // Reset campaign view when navigating

    // Update page title
    const pageTitles = {
      'dashboard': 'Dashboard',
      'recommendations': 'Campaigns',
      'settings': 'Settings',
      'test': 'Middleware Test'
    }
    const pageTitle = pageTitles[page] || 'Dashboard'
    document.title = `${pageTitle} ‹ UpsellSmart — WordPress`

    // Update WordPress admin menu highlighting
    updateWordPressMenuHighlight(page)
  }

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

  return (
    <ToastProvider>
      <div className="upspr-admin-wrapper min-h-screen bg-gray-50">
        {/* Navigation Bar */}
        <Navbar currentPage={currentPage} onNavigate={handleNavigate} />

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
