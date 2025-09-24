"use client"

import { useState } from 'react'
import filterDataMiddleware from '../middleware/FilterDataMiddleware'

const MiddlewareTestPage = () => {
  const [testResults, setTestResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // Sample filter data similar to what you provided
  const sampleFilterData = {
    includeCategories: [19, 21],
    includeTags: [31, 32],
    priceRange: { min: 20, max: 200 },
    stockStatus: "in-stock",
    productType: "any",
    brands: [35, 34],
    attributes: [1, 2],
    excludeProducts: [67, 65],
    excludeCategories: [20],
    excludeSaleProducts: 1,
    excludeFeaturedProducts: 1
  }

  // Sample personalization data - ONLY codes/IDs, no names
  const samplePersonalizationData = {
    selectedCountries: ['BD', 'AR', 'US'],
    selectedStates: ['BD:BD-05', 'BD:BD-01', 'US:NY'],
    customerSegmentation: true,
    geographicLocation: 'any'
  }

  const testMiddleware = async () => {
    setIsLoading(true)
    setTestResults(null)

    try {
      console.log("Testing middleware with sample data:", { filters: sampleFilterData, personalization: samplePersonalizationData })

      // Test the middleware processing
      const processedFilters = await filterDataMiddleware.processFilterData(sampleFilterData)
      const processedPersonalization = await filterDataMiddleware.processPersonalizationData(samplePersonalizationData)

      console.log("Processed filters:", processedFilters)
      console.log("Processed personalization:", processedPersonalization)

      // Get cache statistics
      const cacheStats = filterDataMiddleware.getCacheStats()

      setTestResults({
        originalData: { filters: sampleFilterData, personalization: samplePersonalizationData },
        processedData: { filters: processedFilters, personalization: processedPersonalization },
        cacheStats: cacheStats
      })

    } catch (error) {
      console.error("Error testing middleware:", error)
      setTestResults({
        error: error.message
      })
    } finally {
      setIsLoading(false)
    }
  }

  const clearCache = () => {
    filterDataMiddleware.clearCache()
    console.log("Cache cleared")
  }

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Filter Data Middleware Test</h2>

      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            onClick={testMiddleware}
            disabled={isLoading}
            className="upspr-button"
          >
            {isLoading ? 'Testing...' : 'Test Middleware'}
          </button>

          <button
            onClick={clearCache}
            className="upspr-button-secondary"
          >
            Clear Cache
          </button>
        </div>

        {/* Sample Data Display */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Sample Data (IDs/Codes only):</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-800 mb-1">Filter Data:</h4>
              <pre className="text-sm text-gray-700 overflow-x-auto">
                {JSON.stringify(sampleFilterData, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-1">Personalization Data:</h4>
              <pre className="text-sm text-gray-700 overflow-x-auto">
                {JSON.stringify(samplePersonalizationData, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Results Display */}
        {testResults && (
          <div className="space-y-4">
            {testResults.error ? (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h3 className="font-semibold text-red-900 mb-2">Error:</h3>
                <p className="text-red-700">{testResults.error}</p>
              </div>
            ) : (
              <>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-900 mb-2">Processed Data (with Names):</h3>
                  <pre className="text-sm text-green-700 overflow-x-auto">
                    {JSON.stringify(testResults.processedData, null, 2)}
                  </pre>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">Cache Statistics:</h3>
                  <pre className="text-sm text-blue-700 overflow-x-auto">
                    {JSON.stringify(testResults.cacheStats, null, 2)}
                  </pre>
                </div>

                {/* Name Mappings Display */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-purple-900 mb-2">ID/Code to Name Mappings:</h3>
                  <div className="space-y-4 text-sm">
                    {/* Filter Mappings */}
                    <div>
                      <h4 className="font-medium text-purple-800 mb-2">Filter Data Mappings:</h4>
                      <div className="space-y-1 ml-4">
                        {testResults.processedData.filters?.includeCategoryNames && (
                          <div>
                            <strong>Categories:</strong> {testResults.originalData.filters.includeCategories.map((id, index) =>
                              `${id} → "${testResults.processedData.filters.includeCategoryNames[index]}"`
                            ).join(', ')}
                          </div>
                        )}
                        {testResults.processedData.filters?.includeTagNames && (
                          <div>
                            <strong>Tags:</strong> {testResults.originalData.filters.includeTags.map((id, index) =>
                              `${id} → "${testResults.processedData.filters.includeTagNames[index]}"`
                            ).join(', ')}
                          </div>
                        )}
                        {testResults.processedData.filters?.brandNames && (
                          <div>
                            <strong>Brands:</strong> {testResults.originalData.filters.brands.map((id, index) =>
                              `${id} → "${testResults.processedData.filters.brandNames[index]}"`
                            ).join(', ')}
                          </div>
                        )}
                        {testResults.processedData.filters?.attributeNames && (
                          <div>
                            <strong>Attributes:</strong> {testResults.originalData.filters.attributes.map((id, index) =>
                              `${id} → "${testResults.processedData.filters.attributeNames[index]}"`
                            ).join(', ')}
                          </div>
                        )}
                        {testResults.processedData.filters?.excludeProductNames && (
                          <div>
                            <strong>Excluded Products:</strong> {testResults.originalData.filters.excludeProducts.map((id, index) =>
                              `${id} → "${testResults.processedData.filters.excludeProductNames[index]}"`
                            ).join(', ')}
                          </div>
                        )}
                        {testResults.processedData.filters?.excludeCategoryNames && (
                          <div>
                            <strong>Excluded Categories:</strong> {testResults.originalData.filters.excludeCategories.map((id, index) =>
                              `${id} → "${testResults.processedData.filters.excludeCategoryNames[index]}"`
                            ).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Personalization Mappings */}
                    <div>
                      <h4 className="font-medium text-purple-800 mb-2">Personalization Data Mappings:</h4>
                      <div className="space-y-1 ml-4">
                        {testResults.processedData.personalization?.selectedCountryNames && (
                          <div>
                            <strong>Countries:</strong> {testResults.originalData.personalization.selectedCountries.map((code, index) =>
                              `${code} → "${testResults.processedData.personalization.selectedCountryNames[index]}"`
                            ).join(', ')}
                          </div>
                        )}
                        {testResults.processedData.personalization?.selectedStateNames && (
                          <div>
                            <strong>States:</strong> {testResults.originalData.personalization.selectedStates.map((code, index) =>
                              `${code} → "${testResults.processedData.personalization.selectedStateNames[index]}"`
                            ).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MiddlewareTestPage
