"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { useToast } from "../context/ToastContext"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/Tabs"
import BasicInfoStep from "../steps/BasicInfoStep"
import FiltersStep from "../steps/FiltersStep"
import AmplifiersStep from "../steps/AmplifiersStep"
import PersonalizationStep from "../steps/PersonalizationStep"
import VisibilityStep from "../steps/VisibilityStep"
import filterDataMiddleware from "../../middleware/FilterDataMiddleware"

const CreateRecommendationPage = ({ onBack, onCampaignCreated, editMode = false, initialData = null }) => {
  const [activeTab, setActiveTab] = useState("basic-info")
  const { showSuccess, showError, showWarning } = useToast()

  // Initialize form data with existing data if in edit mode
  const getInitialFormData = () => {
    if (editMode && initialData) {
      console.log("Edit mode - initialData:", initialData)

      // Load data from the new structure (basic_info, filters, amplifiers, personalization, visibility)
      const basicInfo = initialData.basic_info || {}
      const filters = initialData.filters || {}
      const amplifiers = initialData.amplifiers || {}
      const personalization = initialData.personalization || {}
      const visibility = initialData.visibility || {}

      console.log("Loading from structured data:", { basicInfo, filters, amplifiers, personalization, visibility })

      // Convert daysOfWeek from backend format to frontend format
      const convertDaysOfWeek = (backendDays) => {
        if (!backendDays || typeof backendDays !== 'object') {
          return {
            monday: false,
            tuesday: false,
            wednesday: false,
            thursday: false,
            friday: false,
            saturday: false,
            sunday: false
          }
        }
        return {
          monday: !!backendDays.monday,
          tuesday: !!backendDays.tuesday,
          wednesday: !!backendDays.wednesday,
          thursday: !!backendDays.thursday,
          friday: !!backendDays.friday,
          saturday: !!backendDays.saturday,
          sunday: !!backendDays.sunday
        }
      }

      // Convert deviceType from backend format to frontend format
      const convertDeviceType = (backendDevice) => {
        if (!backendDevice || typeof backendDevice !== 'object') {
          return {
            desktop: false,
            mobile: false,
            tablet: false
          }
        }
        return {
          desktop: !!backendDevice.desktop,
          mobile: !!backendDevice.mobile,
          tablet: !!backendDevice.tablet
        }
      }

      const formData = {
        // Basic Info - from basic_info section or fallback to main campaign data
        ruleName: basicInfo.ruleName || initialData.name || "",
        description: basicInfo.description || initialData.description || "",
        recommendationType: basicInfo.recommendationType || initialData.type || "",
        displayLocation: basicInfo.displayLocation || initialData.location || "",
        numberOfProducts: basicInfo.numberOfProducts || initialData.products_count?.toString() || "",
        priority: basicInfo.priority || initialData.priority?.toString() || "",
        showProductPrices: basicInfo.showProductPrices !== undefined ? !!basicInfo.showProductPrices : true,
        showProductRatings: basicInfo.showProductRatings !== undefined ? !!basicInfo.showProductRatings : true,
        showAddToCartButton: basicInfo.showAddToCartButton !== undefined ? !!basicInfo.showAddToCartButton : true,
        showProductCategory: basicInfo.showProductCategory !== undefined ? !!basicInfo.showProductCategory : true,

        // Filters - from filters section
        includeCategories: filters.includeCategories || [],
        includeTags: filters.includeTags || [],
        priceRange: filters.priceRange || { min: "", max: "" },
        stockStatus: filters.stockStatus || "any",
        productType: filters.productType || "any",
        brands: filters.brands || [],
        attributes: filters.attributes || [],
        excludeProducts: filters.excludeProducts || [],
        excludeCategories: filters.excludeCategories || [],
        excludeSaleProducts: !!filters.excludeSaleProducts,
        excludeFeaturedProducts: !!filters.excludeFeaturedProducts,

        // Amplifiers - from amplifiers section
        salesPerformanceBoost: !!amplifiers.salesPerformanceBoost,
        salesBoostFactor: amplifiers.salesBoostFactor || "medium",
        salesTimePeriod: amplifiers.salesTimePeriod || "last-30-days",
        inventoryLevelBoost: !!amplifiers.inventoryLevelBoost,
        inventoryBoostType: amplifiers.inventoryBoostType || "high-stock",
        inventoryThreshold: amplifiers.inventoryThreshold || "",
        seasonalTrendingBoost: !!amplifiers.seasonalTrendingBoost,
        trendingKeywords: amplifiers.trendingKeywords || [],
        trendingDuration: amplifiers.trendingDuration || "",

        // Personalization - from personalization section
        purchaseHistoryBased: !!personalization.purchaseHistoryBased,
        purchaseHistoryPeriod: personalization.purchaseHistoryPeriod || "last-90-days",
        purchaseHistoryWeight: personalization.purchaseHistoryWeight || "high",
        browsingBehavior: !!personalization.browsingBehavior,
        recentlyViewedWeight: personalization.recentlyViewedWeight || "medium",
        timeOnPageWeight: personalization.timeOnPageWeight || "medium",
        searchHistoryWeight: personalization.searchHistoryWeight || "high",
        customerSegmentation: !!personalization.customerSegmentation,
        customerType: personalization.customerType || "all-customers",
        spendingTier: personalization.spendingTier || "any-tier",
        geographicLocation: personalization.geographicLocation || "any",
        ageGroup: personalization.ageGroup || "any-age",
        collaborativeFiltering: !!personalization.collaborativeFiltering,
        similarUsersCount: personalization.similarUsersCount || "",
        similarityThreshold: personalization.similarityThreshold || "high",
        // Geographic location data - ONLY load IDs/codes, names will be resolved by middleware
        selectedCountries: personalization.selectedCountries || [],
        selectedStates: personalization.selectedStates || [],
        // Initialize empty name arrays - middleware will populate these
        selectedCountryNames: [],
        selectedStateNames: [],

        // Visibility - from visibility section
        startDate: visibility.startDate || "",
        endDate: visibility.endDate || "",
        daysOfWeek: convertDaysOfWeek(visibility.daysOfWeek),
        timeRange: visibility.timeRange || { start: "", end: "" },
        userLoginStatus: visibility.userLoginStatus || "any",
        userRoles: visibility.userRoles || [],
        minimumOrders: visibility.minimumOrders || "",
        minimumSpent: visibility.minimumSpent || "",
        deviceType: convertDeviceType(visibility.deviceType),
        trafficSource: visibility.trafficSource || "any-source",
        cartValueRange: visibility.cartValueRange || { min: "", max: "" },
        cartItemsCount: visibility.cartItemsCount || { min: "", max: "" },
        requiredProductsInCart: visibility.requiredProductsInCart || [],
        requiredCategoriesInCart: visibility.requiredCategoriesInCart || [],
      }

      console.log("Converted form data:", formData)
      return formData
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
      includeCategoryNames: [],
      includeTags: [],
      includeTagNames: [],
      priceRange: { min: "", max: "" },
      stockStatus: "any",
      productType: "any",
      brands: [],
      brandNames: [],
      attributes: [], // Array for join() method
      attributeNames: [],
      excludeProducts: [],
      excludeProductNames: [],
      excludeCategories: [],
      excludeCategoryNames: [],
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
      // Geographic location data
      selectedCountries: [],
      selectedCountryNames: [],
      selectedStates: [],
      selectedStateNames: [],

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
      requiredProductsInCartNames: [],
      requiredCategoriesInCart: [],
      requiredCategoriesInCartNames: [],
    }
  }

  const [formData, setFormData] = useState(getInitialFormData())
  const [isLoadingNames, setIsLoadingNames] = useState(false)

  // Process filter data with middleware when in edit mode
  useEffect(() => {
    const processFilterNames = async () => {
      if (editMode && initialData && initialData.filters) {
        setIsLoadingNames(true)
        try {
          console.log("Processing filter data with middleware:", initialData.filters)

          // Process filter data to get names for IDs
          const processedFilters = await filterDataMiddleware.processFilterData(initialData.filters)
          console.log("Processed filter data:", processedFilters)

          // Process visibility data if available
          let processedVisibility = {}
          if (initialData.visibility) {
            processedVisibility = await filterDataMiddleware.processVisibilityData(initialData.visibility)
            console.log("Processed visibility data:", processedVisibility)
          }

          // Process personalization data if available
          let processedPersonalization = {}
          if (initialData.personalization) {
            processedPersonalization = await filterDataMiddleware.processPersonalizationData(initialData.personalization)
            console.log("Processed personalization data:", processedPersonalization)
          }

          // Update form data with the processed names
          setFormData(prevData => ({
            ...prevData,
            // Update filter-related names
            includeCategoryNames: processedFilters.includeCategoryNames || [],
            excludeCategoryNames: processedFilters.excludeCategoryNames || [],
            includeTagNames: processedFilters.includeTagNames || [],
            brandNames: processedFilters.brandNames || [],
            attributeNames: processedFilters.attributeNames || [],
            excludeProductNames: processedFilters.excludeProductNames || [],
            // Update visibility-related names
            requiredProductsInCartNames: processedVisibility.requiredProductsInCartNames || [],
            requiredCategoriesInCartNames: processedVisibility.requiredCategoriesInCartNames || [],
            // Update personalization-related names
            selectedCountryNames: processedPersonalization.selectedCountryNames || prevData.selectedCountryNames || [],
            selectedStateNames: processedPersonalization.selectedStateNames || prevData.selectedStateNames || []
          }))

        } catch (error) {
          console.error("Error processing filter names:", error)
        } finally {
          setIsLoadingNames(false)
        }
      }
    }

    processFilterNames()
  }, [editMode, initialData])

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
          // Geographic location data - ONLY save IDs/codes, names will be resolved by middleware
          selectedCountries: formData.selectedCountries || [],
          selectedStates: formData.selectedStates || [],
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
        }
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
