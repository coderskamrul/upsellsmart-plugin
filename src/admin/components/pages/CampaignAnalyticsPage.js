import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { ArrowLeft, Eye, MousePointer, ShoppingCart, DollarSign, Loader2, AlertCircle, TrendingUp } from "lucide-react"
import DateRangePicker from "../common/DateRangePicker"
import analyticsApi from "../../services/analyticsApi"

const CampaignAnalyticsPage = ({ campaignId, onBack }) => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    endDate: new Date(),
  })
  const [campaign, setCampaign] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [performance, setPerformance] = useState(null)
  const [productPerformance, setProductPerformance] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCampaignData()
  }, [campaignId, dateRange])

  const fetchCampaignData = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('Fetching campaign data for ID:', campaignId)

      // Fetch campaign details
      const campaigns = await analyticsApi.getCampaigns()
      console.log('All campaigns:', campaigns)
      console.log('Looking for campaign ID:', campaignId, 'Type:', typeof campaignId)

      const campaignData = campaigns.find(c => {
        // Handle both string and number IDs
        const cId = String(c.id)
        const searchId = String(campaignId)
        console.log('Comparing:', cId, 'with', searchId, 'Match:', cId === searchId)
        return cId === searchId
      })

      console.log('Found campaign:', campaignData)

      if (!campaignData) {
        console.error('Campaign not found. Available IDs:', campaigns.map(c => c.id))
        setError(`Campaign not found. Campaign ID ${campaignId} does not exist.`)
        setLoading(false)
        return
      }

      setCampaign(campaignData)

      // Fetch analytics data
      const [analyticsData, performanceData, productData] = await Promise.all([
        analyticsApi.getAnalytics(campaignId, dateRange.startDate, dateRange.endDate),
        analyticsApi.getPerformance(campaignId, dateRange.startDate, dateRange.endDate),
        analyticsApi.getProductPerformance(campaignId, dateRange.startDate, dateRange.endDate),
      ])

      setAnalytics(analyticsData.data)
      setPerformance(performanceData.performance)
      setProductPerformance(productData.products)
    } catch (err) {
      console.error('Failed to fetch campaign data:', err)
      setError(`Failed to load campaign analytics: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Campaign Analytics</h2>
            <p className="text-gray-600">Loading campaign data...</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <span className="ml-3 text-gray-600">Loading analytics data...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Campaign Analytics</h2>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-red-200">
          <div className="flex items-center text-red-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            <div>
              <h3 className="text-lg font-semibold">Error Loading Data</h3>
              <p className="text-sm text-gray-600 mt-1">{error}</p>
              <button
                onClick={fetchCampaignData}
                className="mt-3 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!campaign || !performance) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">{campaign.name}</h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
              {campaign.type}
            </span>
            <span className="text-sm text-gray-600">Campaign ID: {campaign.id}</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${campaign.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
              {campaign.status}
            </span>
          </div>
        </div>
      </div>

      {/* Date Range Picker */}
      <DateRangePicker
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
        onChange={handleDateRangeChange}
      />

      {/* Performance Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Impressions</p>
              <p className="text-2xl font-bold text-gray-900">
                {performance.impressions.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clicks</p>
              <p className="text-2xl font-bold text-gray-900">
                {performance.clicks.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <MousePointer className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            CTR: <span className="font-semibold text-gray-700">{performance.ctr.toFixed(2)}%</span>
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversions</p>
              <p className="text-2xl font-bold text-gray-900">
                {performance.conversions.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Rate: <span className="font-semibold text-gray-700">{performance.conversion_rate.toFixed(2)}%</span>
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${performance.revenue.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            AOV: <span className="font-semibold text-gray-700">${performance.aov.toFixed(2)}</span>
          </p>
        </div>
      </div>

      {/* Daily Analytics Chart */}
      {analytics && analytics.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Daily Performance Trend</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={analytics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="impressions" stroke="#3b82f6" name="Impressions" strokeWidth={2} />
              <Line type="monotone" dataKey="clicks" stroke="#f59e0b" name="Clicks" strokeWidth={2} />
              <Line type="monotone" dataKey="conversions" stroke="#22c55e" name="Conversions" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Product Performance Table */}
      {productPerformance && productPerformance.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Product Performance</h3>
            <p className="text-sm text-gray-600 mt-1">
              Performance breakdown by individual products
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product ID
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clicks
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversions
                  </th>
                  <th className="text-right py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productPerformance.map((product) => (
                  <tr key={product.product_id} className="hover:bg-gray-50">
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">
                      Product #{product.product_id}
                    </td>
                    <td className="py-4 px-4 text-right text-sm text-gray-900">
                      {product.clicks.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right text-sm text-gray-900">
                      {product.conversions.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-right text-sm font-medium text-gray-900">
                      ${product.revenue.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Data State */}
      {analytics && analytics.length === 0 && (
        <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analytics Data</h3>
          <p className="text-gray-600">
            No analytics data available for the selected date range. Try selecting a different date range.
          </p>
        </div>
      )}
    </div>
  )
}

export default CampaignAnalyticsPage

