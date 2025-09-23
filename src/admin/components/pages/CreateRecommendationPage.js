"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { useToast } from "../context/ToastContext"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/Tabs"
import BasicInfoStep from "../steps/BasicInfoStep"
import FiltersStep from "../steps/FiltersStep"
import AmplifiersStep from "../steps/AmplifiersStep"
import PersonalizationStep from "../steps/PersonalizationStep"
import VisibilityStep from "../steps/VisibilityStep"

const CreateRecommendationPage = ({ onBack, onCampaignCreated, editMode = false, initialData = null }) => {
  const [activeTab, setActiveTab] = useState("basic-info")
  const { showSuccess, showError, showWarning } = useToast()

  // Initialize form data with existing data if in edit mode
  const getInitialFormData = () => {
    if (editMode && initialData) {
      console.log("Edit mode - initialData:", initialData)

      // If we have form_data, use it as the base
      if (initialData.form_data) {
        console.log("Using form_data:", initialData.form_data)
        const formData = {
          ...initialData.form_data,
          // Ensure basic fields are populated from the campaign data (override if needed)
          ruleName: initialData.name || initialData.form_data.ruleName || "",
          description: initialData.description || initialData.form_data.description || "",
          recommendationType: initialData.type || initialData.form_data.recommendationType || "",
          displayLocation: initialData.location || initialData.form_data.displayLocation || "",
          numberOfProducts: initialData.products_count?.toString() || initialData.form_data.numberOfProducts || "",
          priority: initialData.priority?.toString() || initialData.form_data.priority || "",
        }

        // Fix data types that might be incorrect from database
        if (!Array.isArray(formData.attributes)) {
          formData.attributes = []
        }
        if (!formData.daysOfWeek || typeof formData.daysOfWeek !== 'object') {
          formData.daysOfWeek = {
            monday: false,
            tuesday: false,
            wednesday: false,
            thursday: false,
            friday: false,
            saturday: false,
            sunday: false
          }
        }
        if (!formData.deviceType || typeof formData.deviceType !== 'object') {
          formData.deviceType = {
            desktop: false,
            mobile: false,
            tablet: false
          }
        }
        if (!formData.timeRange || typeof formData.timeRange !== 'object') {
          formData.timeRange = { start: "", end: "" }
        }
        if (!formData.priceRange || typeof formData.priceRange !== 'object') {
          formData.priceRange = { min: "", max: "" }
        }
        if (!formData.cartValueRange || typeof formData.cartValueRange !== 'object') {
          formData.cartValueRange = { min: "", max: "" }
        }
        if (!formData.cartItemsCount || typeof formData.cartItemsCount !== 'object') {
          formData.cartItemsCount = { min: "", max: "" }
        }

        return formData
      } else {
        // Fallback: create form data from campaign basic data
        console.log("No form_data found, creating from basic campaign data")
        return {
          // Basic Info
          ruleName: initialData.name || "",
          description: initialData.description || "",
          recommendationType: initialData.type || "",
          displayLocation: initialData.location || "",
          numberOfProducts: initialData.products_count?.toString() || "",
          priority: initialData.priority?.toString() || "",
          showProductPrices: true,
          showProductRatings: true,
          showAddToCartButton: true,
          showProductCategory: true,

          // Filters - ensure correct data types
          includeCategories: [],
          includeTags: [],
          priceRange: { min: "", max: "" },
          stockStatus: "any",
          productType: "any",
          brands: [],
          attributes: [], // Should be array, not object
          excludeProducts: [],
          excludeCategories: [],
          excludeSaleProducts: false,
          excludeFeaturedProducts: false,

          // Amplifiers
          salesPerformanceBoost: false,
          salesBoostFactor: 1.5,
          salesTimePeriod: "30-days",
          inventoryLevelBoost: false,
          inventoryBoostType: "low-stock",
          inventoryThreshold: 10,
          seasonalTrendingBoost: false,
          trendingKeywords: [],
          trendingDuration: "7-days",

          // Personalization
          purchaseHistoryBased: false,
          purchaseHistoryPeriod: "90-days",
          purchaseHistoryWeight: 0.7,
          browsingBehavior: false,
          recentlyViewedWeight: 0.5,
          timeOnPageWeight: 0.3,
          searchHistoryWeight: 0.4,
          customerSegmentation: false,
          customerType: "any",
          spendingTier: "any",
          geographicLocation: "any",
          ageGroup: "any",
          collaborativeFiltering: false,
          similarUsersCount: 50,
          similarityThreshold: 0.8,

          // Visibility - ensure correct data types
          startDate: "",
          endDate: "",
          daysOfWeek: {
            monday: false,
            tuesday: false,
            wednesday: false,
            thursday: false,
            friday: false,
            saturday: false,
            sunday: false
          },
          timeRange: { start: "", end: "" },
          userLoginStatus: "any",
          userRoles: [],
          minimumOrders: "",
          minimumSpent: "",
          deviceType: {
            desktop: false,
            mobile: false,
            tablet: false
          },
          trafficSource: "any-source",
          cartValueRange: { min: "", max: "" },
          cartItemsCount: { min: "", max: "" },
          requiredProductsInCart: [],
          requiredCategoriesInCart: [],
        }
      }
    }
    return {
      // Basic Info
      ruleName: "",
      description: "",
      recommendationType: "",
      displayLocation: "",
      numberOfProducts: "",
      priority: "",
      showProductPrices: true,
      showProductRatings: true,
      showAddToCartButton: true,
      showProductCategory: true,

      // Filters
      includeCategories: [],
      includeTags: [],
      priceRange: { min: "", max: "" },
      stockStatus: "any",
      productType: "any",
      brands: [],
      attributes: [], // Array for join() method
      excludeProducts: [],
      excludeCategories: [],
      excludeSaleProducts: false,
      excludeFeaturedProducts: false,

      // Amplifiers
      salesPerformanceBoost: false,
      salesBoostFactor: "medium",
      salesTimePeriod: "last-30-days",
      inventoryLevelBoost: false,
      inventoryBoostType: "",
      inventoryThreshold: "",
      seasonalTrendingBoost: false,
      trendingKeywords: [],
      trendingDuration: "",

      // Personalization
      purchaseHistoryBased: false,
      purchaseHistoryPeriod: "last-90-days",
      purchaseHistoryWeight: "high",
      browsingBehavior: false,
      recentlyViewedWeight: "medium",
      timeOnPageWeight: "medium",
      searchHistoryWeight: "high",
      customerSegmentation: false,
      customerType: "all-customers",
      spendingTier: "any-tier",
      geographicLocation: "",
      ageGroup: "any-age",
      collaborativeFiltering: false,
      similarUsersCount: "",
      similarityThreshold: "medium",

      // Visibility
      startDate: "",
      endDate: "",
      daysOfWeek: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
      },
      timeRange: { start: "", end: "" },
      userLoginStatus: "any",
      userRoles: [],
      minimumOrders: "",
      minimumSpent: "",
      deviceType: {
        desktop: false,
        mobile: false,
        tablet: false,
      },
      trafficSource: "any-source",
      cartValueRange: { min: "", max: "" },
      cartItemsCount: { min: "", max: "" },
      requiredProductsInCart: [],
      requiredCategoriesInCart: [],
    }
  }

  const [formData, setFormData] = useState(getInitialFormData())

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveAsDraft = () => {
    console.log("Saving as draft:", formData)
    // TODO: Implement save as draft functionality
  }

  const handlePreviewRule = () => {
    console.log("Previewing rule:", formData)
    // TODO: Implement preview functionality
  }

  const handleCreateRule = async () => {
    // Basic validation
    if (!formData.ruleName.trim()) {
      showWarning("Please enter a rule name")
      return
    }

    try {
      // Prepare data for API - send both organized structure and flat form_data
      const campaignData = {
        name: formData.ruleName,
        description: formData.description,
        type: formData.recommendationType || "cross-sell",
        location: formData.displayLocation || "product-page",
        products_count: parseInt(formData.numberOfProducts) || 4,
        priority: parseInt(formData.priority) || 1,
        status: editMode ? (initialData.status || "active") : "active",

        // Organized structure for database storage
        basic_info: {
          ruleName: formData.ruleName,
          description: formData.description,
          recommendationType: formData.recommendationType,
          displayLocation: formData.displayLocation,
          numberOfProducts: formData.numberOfProducts,
          priority: formData.priority,
          showProductPrices: formData.showProductPrices,
          showProductRatings: formData.showProductRatings,
          showAddToCartButton: formData.showAddToCartButton,
          showProductCategory: formData.showProductCategory,
        },
        filters: {
          includeCategories: formData.includeCategories || [],
          includeTags: formData.includeTags || [],
          priceRange: formData.priceRange || { min: "", max: "" },
          stockStatus: formData.stockStatus || "any",
          productType: formData.productType || "any",
          brands: formData.brands || [],
          attributes: formData.attributes || {},
          excludeProducts: formData.excludeProducts || [],
          excludeCategories: formData.excludeCategories || [],
          excludeSaleProducts: formData.excludeSaleProducts || false,
          excludeFeaturedProducts: formData.excludeFeaturedProducts || false,
        },
        amplifiers: {
          salesPerformanceBoost: formData.salesPerformanceBoost || false,
          salesBoostFactor: formData.salesBoostFactor || 1.5,
          salesTimePeriod: formData.salesTimePeriod || "30-days",
          inventoryLevelBoost: formData.inventoryLevelBoost || false,
          inventoryBoostType: formData.inventoryBoostType || "low-stock",
          inventoryThreshold: formData.inventoryThreshold || 10,
          seasonalTrendingBoost: formData.seasonalTrendingBoost || false,
          trendingKeywords: formData.trendingKeywords || [],
          trendingDuration: formData.trendingDuration || "7-days",
        },
        personalization: {
          purchaseHistoryBased: formData.purchaseHistoryBased || false,
          purchaseHistoryPeriod: formData.purchaseHistoryPeriod || "90-days",
          purchaseHistoryWeight: formData.purchaseHistoryWeight || 0.7,
          browsingBehavior: formData.browsingBehavior || false,
          recentlyViewedWeight: formData.recentlyViewedWeight || 0.5,
          timeOnPageWeight: formData.timeOnPageWeight || 0.3,
          searchHistoryWeight: formData.searchHistoryWeight || 0.4,
          customerSegmentation: formData.customerSegmentation || false,
          customerType: formData.customerType || "any",
          spendingTier: formData.spendingTier || "any",
          geographicLocation: formData.geographicLocation || "any",
          ageGroup: formData.ageGroup || "any",
          collaborativeFiltering: formData.collaborativeFiltering || false,
          similarUsersCount: formData.similarUsersCount || 50,
          similarityThreshold: formData.similarityThreshold || 0.8,
        },
        visibility: {
          startDate: formData.startDate || "",
          endDate: formData.endDate || "",
          daysOfWeek: formData.daysOfWeek || [],
          timeRange: formData.timeRange || { start: "", end: "" },
          userLoginStatus: formData.userLoginStatus || "any",
          userRoles: formData.userRoles || [],
          minimumOrders: formData.minimumOrders || "",
          minimumSpent: formData.minimumSpent || "",
          deviceType: formData.deviceType || "any",
          trafficSource: formData.trafficSource || "any-source",
          cartValueRange: formData.cartValueRange || { min: "", max: "" },
          cartItemsCount: formData.cartItemsCount || { min: "", max: "" },
          requiredProductsInCart: formData.requiredProductsInCart || [],
          requiredCategoriesInCart: formData.requiredCategoriesInCart || [],
        },

        // Flat form_data for easy editing
        form_data: formData,
      }

      // Add performance data only for new campaigns
      if (!editMode) {
        campaignData.performance = {
          impressions: Math.floor(Math.random() * 1000) + 100, // Random demo data
          clicks: Math.floor(Math.random() * 100) + 10,
          conversions: Math.floor(Math.random() * 20) + 1,
          revenue: parseFloat((Math.random() * 500 + 50).toFixed(2)),
        }
      }

      console.log(editMode ? "Updating recommendation:" : "Creating recommendation:", campaignData)

      // Make API call to create or update campaign
      const url = editMode
        ? `/wp-json/upspr/v1/campaigns/${initialData.id}`
        : '/wp-json/upspr/v1/campaigns'

      const method = editMode ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': window.wpApiSettings?.nonce || '',
        },
        body: JSON.stringify(campaignData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to ${editMode ? 'update' : 'create'} campaign`)
      }

      const resultCampaign = await response.json()
      console.log(`Campaign ${editMode ? 'updated' : 'created'} successfully:`, resultCampaign)

      // Show success message
      showSuccess(`Recommendation campaign ${editMode ? 'updated' : 'created'} successfully!`)

      // Call the callback with the result campaign
      onCampaignCreated(resultCampaign)

    } catch (error) {
      console.error(`Error ${editMode ? 'updating' : 'creating'} campaign:`, error)
      showError(`Failed to ${editMode ? 'update' : 'create'} campaign: ` + error.message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {editMode ? 'Edit Recommendation Campaign' : 'Create New Recommendation'}
          </h2>
          <p className="text-gray-600">
            {editMode
              ? 'Update your product recommendation rule settings and configuration'
              : 'Set up a new product recommendation rule with advanced targeting and personalization'
            }
          </p>
        </div>
        <button
          onClick={onBack}
          className="upspr-button-secondary flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to List
        </button>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
          <TabsTrigger value="filters">Filters</TabsTrigger>
          <TabsTrigger value="amplifiers">Amplifiers</TabsTrigger>
          <TabsTrigger value="personalization">Personalization</TabsTrigger>
          <TabsTrigger value="visibility">Visibility</TabsTrigger>
        </TabsList>

        <TabsContent value="basic-info">
          <BasicInfoStep
            formData={formData}
            updateFormData={updateFormData}
          />
        </TabsContent>

        <TabsContent value="filters">
          <FiltersStep
            formData={formData}
            updateFormData={updateFormData}
          />
        </TabsContent>

        <TabsContent value="amplifiers">
          <AmplifiersStep
            formData={formData}
            updateFormData={updateFormData}
          />
        </TabsContent>

        <TabsContent value="personalization">
          <PersonalizationStep
            formData={formData}
            updateFormData={updateFormData}
          />
        </TabsContent>

        <TabsContent value="visibility">
          <VisibilityStep
            formData={formData}
            updateFormData={updateFormData}
          />
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
        <button
          onClick={handleSaveAsDraft}
          className="upspr-button-secondary"
        >
          Save as Draft
        </button>
        <button
          onClick={handlePreviewRule}
          className="upspr-button-secondary"
        >
          Preview Rule
        </button>
        <button
          onClick={handleCreateRule}
          className="upspr-button"
        >
          {editMode ? 'Update Recommendation Rule' : 'Create Recommendation Rule'}
        </button>
      </div>
    </div>
  )
}

export default CreateRecommendationPage
