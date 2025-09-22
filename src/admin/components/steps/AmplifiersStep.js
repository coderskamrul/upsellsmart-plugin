"use client"

const AmplifiersStep = ({ formData, updateFormData }) => {
  const handleArrayUpdate = (field, value) => {
    const values = value.split(',').map(v => v.trim()).filter(v => v)
    updateFormData(field, values)
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Recommendation Amplifiers</h3>
        <p className="text-gray-600">Boost certain products in recommendations based on various criteria</p>
      </div>

      {/* Sales Performance Boost Card */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-md font-semibold text-gray-900">Sales Performance Boost</h4>
            <p className="text-sm text-gray-600">Boost products with high sales performance</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.salesPerformanceBoost}
              onChange={(e) => updateFormData('salesPerformanceBoost', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </label>
        </div>

        {formData.salesPerformanceBoost && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Boost Factor
              </label>
              <select
                value={formData.salesBoostFactor}
                onChange={(e) => updateFormData('salesBoostFactor', e.target.value)}
                className="upspr-select"
              >
                <option value="low">Low (1.5x)</option>
                <option value="medium">Medium (2.0x)</option>
                <option value="high">High (3.0x)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Period
              </label>
              <select
                value={formData.salesTimePeriod}
                onChange={(e) => updateFormData('salesTimePeriod', e.target.value)}
                className="upspr-select"
              >
                <option value="last-7-days">Last 7 days</option>
                <option value="last-30-days">Last 30 days</option>
                <option value="last-90-days">Last 90 days</option>
                <option value="last-year">Last Year</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Inventory Level Boost Card */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-md font-semibold text-gray-900">Inventory Level Boost</h4>
            <p className="text-sm text-gray-600">Prioritize products with higher inventory levels</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.inventoryLevelBoost}
              onChange={(e) => updateFormData('inventoryLevelBoost', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </label>
        </div>

        {formData.inventoryLevelBoost && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Boost High Stock
              </label>
              <select
                value={formData.inventoryBoostType}
                onChange={(e) => updateFormData('inventoryBoostType', e.target.value)}
                className="upspr-select"
              >
                <option value="">Select boost</option>
                <option value="high-stock">High Stock Products</option>
                <option value="medium-stock">Medium Stock Products</option>
                <option value="low-stock">Low Stock Products</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                High Stock Threshold
              </label>
              <input
                type="number"
                placeholder="100"
                value={formData.inventoryThreshold}
                onChange={(e) => updateFormData('inventoryThreshold', e.target.value)}
                className="upspr-input"
              />
            </div>
          </div>
        )}
      </div>

      {/* Seasonal/Trending Boost Card */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-md font-semibold text-gray-900">Seasonal/Trending Boost</h4>
            <p className="text-sm text-gray-600">Boost products based on seasonal trends or keywords</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.seasonalTrendingBoost}
              onChange={(e) => updateFormData('seasonalTrendingBoost', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </label>
        </div>

        {formData.seasonalTrendingBoost && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trending Keywords
              </label>
              <input
                type="text"
                placeholder="summer, sale, trending"
                value={formData.trendingKeywords.join(', ')}
                onChange={(e) => handleArrayUpdate('trendingKeywords', e.target.value)}
                className="upspr-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Boost Duration (days)
              </label>
              <input
                type="number"
                placeholder="30"
                value={formData.trendingDuration}
                onChange={(e) => updateFormData('trendingDuration', e.target.value)}
                className="upspr-input"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AmplifiersStep
