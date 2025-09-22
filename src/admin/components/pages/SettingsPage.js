"use client"

import { useState, useEffect } from "react"
import { Save, RefreshCw, Download, Upload, AlertTriangle, CheckCircle, Info } from "lucide-react"

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    general: {
      enable_analytics: true,
      cache_duration: 3600,
      max_recommendations: 10,
      enable_mobile: true,
      debug_mode: false,
      auto_cleanup_days: 30,
    },
    display: {
      show_prices: true,
      show_ratings: true,
      show_add_to_cart: true,
      layout_style: "grid",
      primary_color: "#22c55e",
      border_radius: 8,
      animation_enabled: true,
    },
    performance: {
      enable_caching: true,
      lazy_loading: true,
      preload_images: false,
      minify_output: true,
      cdn_enabled: false,
    },
    advanced: {
      custom_css: "",
      custom_js: "",
      api_rate_limit: 100,
      webhook_url: "",
      enable_logging: true,
      log_level: "error",
    },
  })

  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const [lastSaved, setLastSaved] = useState(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      // In real plugin, this would load settings from WordPress options
      console.log("Loading settings...")
    } catch (error) {
      console.error("Failed to load settings:", error)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      // In real plugin, this would save to WordPress options via AJAX
      console.log("Saving settings:", settings)
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
      setLastSaved(new Date())
    } catch (error) {
      console.error("Failed to save settings:", error)
    } finally {
      setSaving(false)
    }
  }

  const resetSettings = async () => {
    if (confirm("Are you sure you want to reset all settings to defaults? This action cannot be undone.")) {
      setSettings({
        general: {
          enable_analytics: true,
          cache_duration: 3600,
          max_recommendations: 10,
          enable_mobile: true,
          debug_mode: false,
          auto_cleanup_days: 30,
        },
        display: {
          show_prices: true,
          show_ratings: true,
          show_add_to_cart: true,
          layout_style: "grid",
          primary_color: "#22c55e",
          border_radius: 8,
          animation_enabled: true,
        },
        performance: {
          enable_caching: true,
          lazy_loading: true,
          preload_images: false,
          minify_output: true,
          cdn_enabled: false,
        },
        advanced: {
          custom_css: "",
          custom_js: "",
          api_rate_limit: 100,
          webhook_url: "",
          enable_logging: true,
          log_level: "error",
        },
      })
    }
  }

  const updateSetting = (section, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }))
  }

  const tabs = [
    { id: "general", label: "General", icon: "⚙️" },
    { id: "display", label: "Display", icon: "🎨" },
    { id: "performance", label: "Performance", icon: "⚡" },
    { id: "advanced", label: "Advanced", icon: "🔧" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Plugin Settings</h2>
          <p className="text-gray-600">Configure your product recommendations plugin</p>
        </div>
        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="upspr-badge badge-success text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <button onClick={saveSettings} disabled={saving} className="upspr-button">
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "general" && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">General Settings</h3>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Enable Analytics</label>
                      <p className="text-sm text-gray-500">Track recommendation performance and user interactions</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.general.enable_analytics}
                      onChange={(e) => updateSetting("general", "enable_analytics", e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Mobile Support</label>
                      <p className="text-sm text-gray-500">Show recommendations on mobile devices</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.general.enable_mobile}
                      onChange={(e) => updateSetting("general", "enable_mobile", e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Debug Mode</label>
                      <p className="text-sm text-gray-500">Enable detailed logging for troubleshooting</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.general.debug_mode}
                      onChange={(e) => updateSetting("general", "debug_mode", e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cache Duration (seconds)</label>
                    <input
                      type="number"
                      value={settings.general.cache_duration}
                      onChange={(e) => updateSetting("general", "cache_duration", Number.parseInt(e.target.value))}
                      className="upspr-input"
                    />
                    <p className="text-sm text-gray-500 mt-1">How long to cache recommendation data</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Recommendations: {settings.general.max_recommendations}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={settings.general.max_recommendations}
                      onChange={(e) => updateSetting("general", "max_recommendations", Number.parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>1</span>
                      <span>50</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Auto Cleanup (days)</label>
                    <input
                      type="number"
                      value={settings.general.auto_cleanup_days}
                      onChange={(e) => updateSetting("general", "auto_cleanup_days", Number.parseInt(e.target.value))}
                      className="upspr-input"
                    />
                    <p className="text-sm text-gray-500 mt-1">Automatically delete old analytics data</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "display" && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Display Settings</h3>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Content Options</h4>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Show Prices</label>
                      <p className="text-sm text-gray-500">Display product prices in recommendations</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.display.show_prices}
                      onChange={(e) => updateSetting("display", "show_prices", e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Show Ratings</label>
                      <p className="text-sm text-gray-500">Display star ratings for products</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.display.show_ratings}
                      onChange={(e) => updateSetting("display", "show_ratings", e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Show Add to Cart</label>
                      <p className="text-sm text-gray-500">Include add to cart buttons</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.display.show_add_to_cart}
                      onChange={(e) => updateSetting("display", "show_add_to_cart", e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Layout & Styling</h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Layout Style</label>
                    <select
                      value={settings.display.layout_style}
                      onChange={(e) => updateSetting("display", "layout_style", e.target.value)}
                      className="upspr-select"
                    >
                      <option value="grid">Grid Layout</option>
                      <option value="list">List Layout</option>
                      <option value="carousel">Carousel</option>
                      <option value="slider">Slider</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.display.primary_color}
                        onChange={(e) => updateSetting("display", "primary_color", e.target.value)}
                        className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={settings.display.primary_color}
                        onChange={(e) => updateSetting("display", "primary_color", e.target.value)}
                        className="upspr-input flex-1"
                        placeholder="#22c55e"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Border Radius: {settings.display.border_radius}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={settings.display.border_radius}
                      onChange={(e) => updateSetting("display", "border_radius", Number.parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>0px</span>
                      <span>20px</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <Info className="h-5 w-5 text-blue-400" />
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      Changes to display settings will be applied to all recommendation widgets on your site.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "performance" && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Performance Settings</h3>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Caching Options</h4>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Enable Caching</label>
                      <p className="text-sm text-gray-500">Cache recommendation data for faster loading</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.performance.enable_caching}
                      onChange={(e) => updateSetting("performance", "enable_caching", e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Lazy Loading</label>
                      <p className="text-sm text-gray-500">Load recommendations only when visible</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.performance.lazy_loading}
                      onChange={(e) => updateSetting("performance", "lazy_loading", e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Optimization</h4>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Minify Output</label>
                      <p className="text-sm text-gray-500">Compress HTML, CSS, and JS output</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.performance.minify_output}
                      onChange={(e) => updateSetting("performance", "minify_output", e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">CDN Support</label>
                      <p className="text-sm text-gray-500">Use CDN for static assets</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.performance.cdn_enabled}
                      onChange={(e) => updateSetting("performance", "cdn_enabled", e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "advanced" && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Advanced Settings</h3>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">API Rate Limit (per hour)</label>
                    <input
                      type="number"
                      value={settings.advanced.api_rate_limit}
                      onChange={(e) => updateSetting("advanced", "api_rate_limit", Number.parseInt(e.target.value))}
                      className="upspr-input"
                    />
                    <p className="text-sm text-gray-500 mt-1">Maximum API requests per hour</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                    <input
                      type="url"
                      value={settings.advanced.webhook_url}
                      onChange={(e) => updateSetting("advanced", "webhook_url", e.target.value)}
                      className="upspr-input"
                      placeholder="https://example.com/webhook"
                    />
                    <p className="text-sm text-gray-500 mt-1">URL to receive recommendation events</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Log Level</label>
                    <select
                      value={settings.advanced.log_level}
                      onChange={(e) => updateSetting("advanced", "log_level", e.target.value)}
                      className="upspr-select"
                    >
                      <option value="debug">Debug</option>
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Custom CSS</label>
                    <textarea
                      value={settings.advanced.custom_css}
                      onChange={(e) => updateSetting("advanced", "custom_css", e.target.value)}
                      className="upspr-textarea font-mono text-sm"
                      rows={6}
                      placeholder="/* Add your custom CSS here */"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Custom JavaScript</label>
                    <textarea
                      value={settings.advanced.custom_js}
                      onChange={(e) => updateSetting("advanced", "custom_js", e.target.value)}
                      className="upspr-textarea font-mono text-sm"
                      rows={6}
                      placeholder="// Add your custom JavaScript here"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Custom code can affect your site's functionality. Test thoroughly before deploying to production.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Import/Export and Reset */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Backup & Reset</h3>
        <p className="text-gray-600 mb-4">Import, export, or reset your plugin settings</p>

        <div className="flex items-center gap-4">
          <button className="upspr-button-secondary">
            <Download className="h-4 w-4 mr-2" />
            Export Settings
          </button>

          <button className="upspr-button-secondary">
            <Upload className="h-4 w-4 mr-2" />
            Import Settings
          </button>

          <button
            onClick={resetSettings}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
