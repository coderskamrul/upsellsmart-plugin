"use client"

const PersonalizationStep = ({ formData, updateFormData }) => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Personalization Rules</h3>
        <p className="text-gray-600">Customize recommendations based on user behavior and preferences</p>
      </div>

      {/* Purchase History Based Card */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-md font-semibold text-gray-900">Purchase History Based</h4>
            <p className="text-sm text-gray-600">Recommend products based on customer's previous purchases</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.purchaseHistoryBased}
              onChange={(e) => updateFormData('purchaseHistoryBased', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </label>
        </div>

        {formData.purchaseHistoryBased && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Look-back Period
              </label>
              <select
                value={formData.purchaseHistoryPeriod}
                onChange={(e) => updateFormData('purchaseHistoryPeriod', e.target.value)}
                className="upspr-select"
              >
                <option value="last-30-days">Last 30 days</option>
                <option value="last-90-days">Last 90 days</option>
                <option value="last-180-days">Last 180 days</option>
                <option value="last-year">Last year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight Factor
              </label>
              <select
                value={formData.purchaseHistoryWeight}
                onChange={(e) => updateFormData('purchaseHistoryWeight', e.target.value)}
                className="upspr-select"
              >
                <option value="low">Low (1.0x)</option>
                <option value="medium">Medium (1.5x)</option>
                <option value="high">High (2.0x)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Browsing Behavior Card */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-md font-semibold text-gray-900">Browsing Behavior</h4>
            <p className="text-sm text-gray-600">Use browsing patterns to personalize recommendations</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.browsingBehavior}
              onChange={(e) => updateFormData('browsingBehavior', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </label>
        </div>

        {formData.browsingBehavior && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recently Viewed Weight
              </label>
              <select
                value={formData.recentlyViewedWeight}
                onChange={(e) => updateFormData('recentlyViewedWeight', e.target.value)}
                className="upspr-select"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time on Page Weight
              </label>
              <select
                value={formData.timeOnPageWeight}
                onChange={(e) => updateFormData('timeOnPageWeight', e.target.value)}
                className="upspr-select"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search History Weight
              </label>
              <select
                value={formData.searchHistoryWeight}
                onChange={(e) => updateFormData('searchHistoryWeight', e.target.value)}
                className="upspr-select"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Customer Segmentation Card */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-md font-semibold text-gray-900">Customer Segmentation</h4>
            <p className="text-sm text-gray-600">Target specific customer segments with tailored recommendations</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.customerSegmentation}
              onChange={(e) => updateFormData('customerSegmentation', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </label>
        </div>

        {formData.customerSegmentation && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Type
              </label>
              <select
                value={formData.customerType}
                onChange={(e) => updateFormData('customerType', e.target.value)}
                className="upspr-select"
              >
                <option value="all-customers">All customers</option>
                <option value="new-customers">New customers</option>
                <option value="returning-customers">Returning customers</option>
                <option value="vip-customers">VIP customers</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Spending Tier
              </label>
              <select
                value={formData.spendingTier}
                onChange={(e) => updateFormData('spendingTier', e.target.value)}
                className="upspr-select"
              >
                <option value="any-tier">Any tier</option>
                <option value="low-spender">Low spender</option>
                <option value="medium-spender">Medium spender</option>
                <option value="high-spender">High spender</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Geographic Location
              </label>
              <input
                type="text"
                placeholder="Country, State, or City"
                value={formData.geographicLocation}
                onChange={(e) => updateFormData('geographicLocation', e.target.value)}
                className="upspr-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age Group
              </label>
              <select
                value={formData.ageGroup}
                onChange={(e) => updateFormData('ageGroup', e.target.value)}
                className="upspr-select"
              >
                <option value="any-age">Any age</option>
                <option value="18-25">18-25</option>
                <option value="26-35">26-35</option>
                <option value="36-45">36-45</option>
                <option value="46-55">46-55</option>
                <option value="56+">56+</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Collaborative Filtering Card */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-md font-semibold text-gray-900">Collaborative Filtering</h4>
            <p className="text-sm text-gray-600">Recommend products liked by similar customers</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.collaborativeFiltering}
              onChange={(e) => updateFormData('collaborativeFiltering', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </label>
        </div>

        {formData.collaborativeFiltering && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Similar Users Count
              </label>
              <input
                type="number"
                placeholder="50 Similar Users"
                value={formData.similarUsersCount}
                onChange={(e) => updateFormData('similarUsersCount', e.target.value)}
                className="upspr-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Similarity Threshold
              </label>
              <select
                value={formData.similarityThreshold}
                onChange={(e) => updateFormData('similarityThreshold', e.target.value)}
                className="upspr-select"
              >
                <option value="low">Low (0.3)</option>
                <option value="medium">Medium (0.5)</option>
                <option value="high">High (0.7)</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PersonalizationStep
