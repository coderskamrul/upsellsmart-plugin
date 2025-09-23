"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Eye, Target, Edit, Trash2 } from "lucide-react"
import { useToast } from "../context/ToastContext"
import useConfirmation from "../hooks/useConfirmation"
import ConfirmationModal from "../ui/ConfirmationModal"
import CreateRecommendationPage from "./CreateRecommendationPage"

const RecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [viewDetailsModal, setViewDetailsModal] = useState({ show: false, campaign: null })
  const [editMode, setEditMode] = useState({ show: false, campaign: null })
  const { showSuccess, showError } = useToast()
  const { confirmationState, hideConfirmation, confirmDelete } = useConfirmation()

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    setLoading(true)
    try {
      const response = await fetch('/wp-json/upspr/v1/campaigns', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': window.wpApiSettings?.nonce || '',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch campaigns')
      }

      const campaigns = await response.json()
      setRecommendations(campaigns)
    } catch (error) {
      console.error("Failed to fetch recommendations:", error)
      // Start with empty array if API fails
      setRecommendations([])
    } finally {
      setLoading(false)
    }
  }

  const filteredRecommendations = recommendations.filter((rec) => {
    const matchesSearch =
      rec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || rec.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleStatusToggle = (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active"
    setRecommendations((prev) => prev.map((rec) => (rec.id === id ? { ...rec, status: newStatus } : rec)))
  }

  const handleDelete = async (id) => {
    // Find the campaign name for better UX
    const campaign = recommendations.find(rec => rec.id === id)
    const campaignName = campaign ? `"${campaign.name}"` : "this recommendation campaign"

    confirmDelete(campaignName, async () => {
      try {
        const response = await fetch(`/wp-json/upspr/v1/campaigns/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': window.wpApiSettings?.nonce || '',
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to delete campaign')
        }

        // Remove from local state
        setRecommendations((prev) => prev.filter((rec) => rec.id !== id))

        showSuccess("Campaign deleted successfully!")
      } catch (error) {
        console.error("Error deleting campaign:", error)
        showError("Failed to delete campaign: " + error.message)
      }
    })
  }

  const handleViewDetails = async (id) => {
    try {
      const response = await fetch(`/wp-json/upspr/v1/campaigns/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': window.wpApiSettings?.nonce || '',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch campaign details')
      }

      const campaign = await response.json()
      setViewDetailsModal({ show: true, campaign })
    } catch (error) {
      console.error("Error fetching campaign details:", error)
      showError("Failed to load campaign details: " + error.message)
    }
  }

  const handleEdit = async (id) => {
    try {
      console.log("Fetching campaign for edit, ID:", id)
      const response = await fetch(`/wp-json/upspr/v1/campaigns/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': window.wpApiSettings?.nonce || '',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch campaign details')
      }

      const campaign = await response.json()
      console.log("Fetched campaign for edit:", campaign)
      setEditMode({ show: true, campaign })
    } catch (error) {
      console.error("Error fetching campaign for edit:", error)
      showError("Failed to load campaign for editing: " + error.message)
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case "cross-sell":
        return "bg-blue-100 text-blue-800"
      case "upsell":
        return "bg-green-100 text-green-800"
      case "related":
        return "bg-purple-100 text-purple-800"
      case "bundle":
        return "bg-orange-100 text-orange-800"
      case "personalized":
        return "bg-pink-100 text-pink-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getLocationLabel = (location) => {
    switch (location) {
      case "product-page":
        return "Product Page"
      case "cart-page":
        return "Cart Page"
      case "checkout-page":
        return "Checkout Page"
      case "homepage":
        return "Homepage"
      case "category-page":
        return "Category Page"
      case "sidebar":
        return "Sidebar"
      default:
        return location
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-48"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse w-32"></div>
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="space-y-3">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-64"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-96"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Handle successful campaign creation
  const handleCampaignCreated = (newCampaign) => {
    setRecommendations(prev => [...prev, newCampaign])
    setShowCreateForm(false)
  }

  // Handle successful campaign update
  const handleCampaignUpdated = (updatedCampaign) => {
    setRecommendations((prev) =>
      prev.map((rec) => (rec.id === updatedCampaign.id ? updatedCampaign : rec))
    )
    setEditMode({ show: false, campaign: null })
  }

  // Close view details modal
  const closeViewDetailsModal = () => {
    setViewDetailsModal({ show: false, campaign: null })
  }

  // Close edit modal
  const closeEditModal = () => {
    setEditMode({ show: false, campaign: null })
  }

  // Show create form if requested
  if (showCreateForm) {
    return (
      <CreateRecommendationPage
        onBack={() => setShowCreateForm(false)}
        onCampaignCreated={handleCampaignCreated}
      />
    )
  }

  // Show edit form if requested
  if (editMode.show && editMode.campaign) {
    return (
      <CreateRecommendationPage
        onBack={closeEditModal}
        onCampaignCreated={handleCampaignUpdated}
        editMode={true}
        initialData={editMode.campaign}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Recommendations</h2>
          <p className="text-gray-600">Create and manage your product recommendation campaigns</p>
        </div>
        <button
          className="upspr-button flex items-center gap-2"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus className="h-4 w-4" />
          Create Recommendation Campaign
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search recommendations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="upspr-input !pl-7"
          />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="upspr-select">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Recommendations Table */}
      {filteredRecommendations.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <table className="upspr-table">
            <thead>
              <tr>
                <th className="text-left">Name</th>
                <th className="text-left">Type</th>
                <th className="text-left">Location</th>
                <th className="text-left">Status</th>
                <th className="text-left">Products</th>
                <th className="text-left">Clicks</th>
                <th className="text-left">Conversions</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecommendations.map((recommendation) => (
                <tr key={recommendation.id}>
                  <td className="font-medium text-gray-900">{recommendation.name}</td>
                  <td>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(recommendation.type)}`}>
                      {recommendation.type}
                    </span>
                  </td>
                  <td className="text-gray-600">{getLocationLabel(recommendation.location)}</td>
                  <td>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${recommendation.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}>
                      {recommendation.status}
                    </span>
                  </td>
                  <td className="text-gray-600">{recommendation.products_count || 0}</td>
                  <td className="text-gray-600">{recommendation.performance?.clicks?.toLocaleString() || 0}</td>
                  <td className="text-gray-600">{recommendation.performance?.conversions || 0}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewDetails(recommendation.id)
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(recommendation.id)
                        }}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(recommendation.id)
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {filteredRecommendations.length === 0 && (
        <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No recommendations found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterStatus !== "all"
              ? "Try adjusting your search or filter criteria."
              : "Get started by creating your first product recommendation campaign."}
          </p>
          {!searchTerm && filterStatus === "all" && (
            <button
              className="upspr-button"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Recommendation Campaign
            </button>
          )}
        </div>
      )}

      {/* View Details Modal */}
      {viewDetailsModal.show && viewDetailsModal.campaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Campaign Details</h2>
                <button
                  onClick={closeViewDetailsModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Campaign Name</label>
                      <p className="mt-1 text-sm text-gray-900">{viewDetailsModal.campaign.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <p className="mt-1 text-sm text-gray-900">{viewDetailsModal.campaign.description || 'No description provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Type</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(viewDetailsModal.campaign.type)}`}>
                        {viewDetailsModal.campaign.type}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Location</label>
                      <p className="mt-1 text-sm text-gray-900">{getLocationLabel(viewDetailsModal.campaign.location)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${viewDetailsModal.campaign.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                        }`}>
                        {viewDetailsModal.campaign.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Performance Data */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Products to Show</label>
                      <p className="mt-1 text-sm text-gray-900">{viewDetailsModal.campaign.products_count}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Priority</label>
                      <p className="mt-1 text-sm text-gray-900">{viewDetailsModal.campaign.priority}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Impressions</label>
                      <p className="mt-1 text-sm text-gray-900">{viewDetailsModal.campaign.performance?.impressions || 0}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Clicks</label>
                      <p className="mt-1 text-sm text-gray-900">{viewDetailsModal.campaign.performance?.clicks || 0}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Conversions</label>
                      <p className="mt-1 text-sm text-gray-900">{viewDetailsModal.campaign.performance?.conversions || 0}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Revenue</label>
                      <p className="mt-1 text-sm text-gray-900">${viewDetailsModal.campaign.performance?.revenue || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Data Details */}
              {viewDetailsModal.campaign.form_data && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Configuration</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(viewDetailsModal.campaign.form_data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(viewDetailsModal.campaign.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(viewDetailsModal.campaign.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={closeViewDetailsModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    closeViewDetailsModal()
                    handleEdit(viewDetailsModal.campaign.id)
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  Edit Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationState.isOpen}
        onClose={hideConfirmation}
        onConfirm={confirmationState.onConfirm}
        title={confirmationState.title}
        message={confirmationState.message}
        confirmText={confirmationState.confirmText}
        cancelText={confirmationState.cancelText}
        type={confirmationState.type}
      />
    </div>
  )
}

export default RecommendationsPage
