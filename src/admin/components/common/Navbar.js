import { useState } from "react"
import { Menu, X, ChevronDown, BarChart3, Zap, Settings, HelpCircle } from "lucide-react"

const Navbar = ({ currentPage, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'recommendations', label: 'Campaigns', icon: Zap },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const moreItems = [
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
    { id: 'docs', label: 'Documentation', icon: HelpCircle, external: true, url: '#' },
  ]

  const handleNavClick = (itemId) => {
    // Use the onNavigate callback instead of page reload
    if (onNavigate) {
      onNavigate(itemId)
    }
    setMobileMenuOpen(false)
    setMoreMenuOpen(false)
  }

  const isActive = (itemId) => {
    return currentPage === itemId
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-4 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-gray-900">UpsellSmart</span>
                  <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    v2.2.0
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block ml-10">
              <div className="flex items-center space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${isActive(item.id)
                        ? 'bg-green-50 text-green-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  )
                })}

                {/* More Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                    className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center gap-1"
                  >
                    More
                    <ChevronDown className={`h-4 w-4 transition-transform ${moreMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {moreMenuOpen && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setMoreMenuOpen(false)}
                      />
                      {/* Dropdown Menu */}
                      <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                        <div className="py-1">
                          {moreItems.map((item) => {
                            const Icon = item.icon
                            return (
                              <button
                                key={item.id}
                                onClick={() => {
                                  if (item.external) {
                                    window.open(item.url, '_blank')
                                  } else {
                                    handleNavClick(item.id)
                                  }
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Icon className="h-4 w-4" />
                                {item.label}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Upgrade Button */}
          <div className="hidden md:flex items-center gap-3">
            <button className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 rounded-md text-sm font-semibold hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-sm flex items-center gap-2">
              <span>✨</span>
              Upgrade to Pro
            </button>
            <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
              <HelpCircle className="h-5 w-5 text-gray-700" />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-base font-medium flex items-center gap-2 ${isActive(item.id)
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              )
            })}

            {/* More Items in Mobile */}
            <div className="pt-2 border-t border-gray-200">
              {moreItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.external) {
                        window.open(item.url, '_blank')
                      } else {
                        handleNavClick(item.id)
                      }
                    }}
                    className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </button>
                )
              })}
            </div>

            {/* Mobile Upgrade Button */}
            <div className="pt-3 border-t border-gray-200">
              <button className="w-full px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 rounded-md text-base font-semibold hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-sm flex items-center justify-center gap-2">
                <span>✨</span>
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar

