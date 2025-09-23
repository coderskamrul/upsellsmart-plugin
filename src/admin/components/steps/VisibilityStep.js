"use client"

import ProductSelector from '../ProductSelector'
import CategorySelector from '../CategorySelector'

const VisibilityStep = ({ formData, updateFormData }) => {
  const handleDayToggle = (day) => {
    updateFormData('daysOfWeek', {
      ...formData.daysOfWeek,
      [day]: !formData.daysOfWeek[day]
    })
  }

  const handleTimeRangeUpdate = (type, value) => {
    updateFormData('timeRange', {
      ...formData.timeRange,
      [type]: value
    })
  }

  const handleDeviceToggle = (device) => {
    updateFormData('deviceType', {
      ...formData.deviceType,
      [device]: !formData.deviceType[device]
    })
  }

  const handleCartValueRangeUpdate = (type, value) => {
    updateFormData('cartValueRange', {
      ...formData.cartValueRange,
      [type]: value
    })
  }

  const handleCartItemsCountUpdate = (type, value) => {
    updateFormData('cartItemsCount', {
      ...formData.cartItemsCount,
      [type]: value
    })
  }

  const handleArrayUpdate = (field, value) => {
    const values = value.split(',').map(v => v.trim()).filter(v => v)
    updateFormData(field, values)
  }

  const handleRequiredProductsChange = (productIds, productNames) => {
    updateFormData('requiredProductsInCart', productIds)
    updateFormData('requiredProductNamesInCart', productNames)
  }

  const handleRequiredCategoriesChange = (categoryIds, categoryNames) => {
    updateFormData('requiredCategoriesInCart', categoryIds)
    updateFormData('requiredCategoryNamesInCart', categoryNames)
  }

  // Toggle Switch Component
  const ToggleSwitch = ({ checked, onChange, label }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">{label}</span>
      <div
        className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors ${checked ? 'bg-green-600' : 'bg-gray-200'
          }`}
        onClick={onChange}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'
            }`}
        />
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Visibility Conditions</h3>
        <p className="text-gray-600">Control when and where this recommendation rule should be displayed</p>
      </div>

      {/* Time-based Conditions Card */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Time-based Conditions</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="text"
              placeholder="mm/dd/yyyy"
              value={formData.startDate}
              onChange={(e) => updateFormData('startDate', e.target.value)}
              className="upspr-input"
              onFocus={(e) => e.target.type = 'date'}
              onBlur={(e) => e.target.type = 'text'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="text"
              placeholder="mm/dd/yyyy"
              value={formData.endDate}
              onChange={(e) => updateFormData('endDate', e.target.value)}
              className="upspr-input"
              onFocus={(e) => e.target.type = 'date'}
              onBlur={(e) => e.target.type = 'text'}
            />
          </div>
        </div>

        {/* Days of Week - Flex Design */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Days of Week
          </label>
          <div className="flex flex-wrap gap-4">
            {Object.entries(formData.daysOfWeek || {}).map(([day, isActive]) => (
              <div key={day} className="flex-1 min-w-[100px]">
                <ToggleSwitch
                  checked={isActive}
                  onChange={() => handleDayToggle(day)}
                  label={day.charAt(0).toUpperCase() + day.slice(1, 3)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Time Range - Flex Design */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Time Range
          </label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <select
                value={formData.timeRange?.start || '12:00 AM'}
                onChange={(e) => handleTimeRangeUpdate('start', e.target.value)}
                className="upspr-select w-full"
              >
                <option value="12:00 AM">12:00 AM</option>
                <option value="01:00 AM">01:00 AM</option>
                <option value="02:00 AM">02:00 AM</option>
                <option value="03:00 AM">03:00 AM</option>
                <option value="04:00 AM">04:00 AM</option>
                <option value="05:00 AM">05:00 AM</option>
                <option value="06:00 AM">06:00 AM</option>
                <option value="07:00 AM">07:00 AM</option>
                <option value="08:00 AM">08:00 AM</option>
                <option value="09:00 AM">09:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="12:00 PM">12:00 PM</option>
                <option value="01:00 PM">01:00 PM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="03:00 PM">03:00 PM</option>
                <option value="04:00 PM">04:00 PM</option>
                <option value="05:00 PM">05:00 PM</option>
                <option value="06:00 PM">06:00 PM</option>
                <option value="07:00 PM">07:00 PM</option>
                <option value="08:00 PM">08:00 PM</option>
                <option value="09:00 PM">09:00 PM</option>
                <option value="10:00 PM">10:00 PM</option>
                <option value="11:00 PM">11:00 PM</option>
              </select>
            </div>

            <div className="flex items-center">
              <span className="text-gray-500 mx-2">📅</span>
            </div>

            <div className="flex-1">
              <select
                value={formData.timeRange?.end || '11:59 PM'}
                onChange={(e) => handleTimeRangeUpdate('end', e.target.value)}
                className="upspr-select w-full"
              >
                <option value="12:00 AM">12:00 AM</option>
                <option value="01:00 AM">01:00 AM</option>
                <option value="02:00 AM">02:00 AM</option>
                <option value="03:00 AM">03:00 AM</option>
                <option value="04:00 AM">04:00 AM</option>
                <option value="05:00 AM">05:00 AM</option>
                <option value="06:00 AM">06:00 AM</option>
                <option value="07:00 AM">07:00 AM</option>
                <option value="08:00 AM">08:00 AM</option>
                <option value="09:00 AM">09:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="12:00 PM">12:00 PM</option>
                <option value="01:00 PM">01:00 PM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="03:00 PM">03:00 PM</option>
                <option value="04:00 PM">04:00 PM</option>
                <option value="05:00 PM">05:00 PM</option>
                <option value="06:00 PM">06:00 PM</option>
                <option value="07:00 PM">07:00 PM</option>
                <option value="08:00 PM">08:00 PM</option>
                <option value="09:00 PM">09:00 PM</option>
                <option value="10:00 PM">10:00 PM</option>
                <option value="11:00 PM">11:00 PM</option>
                <option value="11:59 PM">11:59 PM</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* User Conditions Card */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h4 className="text-md font-semibold text-gray-900 mb-4">User Conditions</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User Login Status
            </label>
            <select
              value={formData.userLoginStatus}
              onChange={(e) => updateFormData('userLoginStatus', e.target.value)}
              className="upspr-select"
            >
              <option value="any-user">Any User</option>
              <option value="logged-in">Logged In Users</option>
              <option value="guest">Guest Users</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User Roles
            </label>
            <select
              value={formData.userRoles}
              onChange={(e) => updateFormData('userRoles', e.target.value)}
              className="upspr-select"
            >
              <option value="all-roles">All roles</option>
              <option value="customer">Customer</option>
              <option value="subscriber">Subscriber</option>
              <option value="vip">VIP</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Orders
            </label>
            <input
              type="number"
              placeholder="0"
              value={formData.minimumOrders}
              onChange={(e) => updateFormData('minimumOrders', e.target.value)}
              className="upspr-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Spent
            </label>
            <input
              type="number"
              placeholder="0"
              value={formData.minimumSpent}
              onChange={(e) => updateFormData('minimumSpent', e.target.value)}
              className="upspr-input"
            />
          </div>
        </div>
      </div>

      {/* Device & Browser Conditions Card */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Device & Browser Conditions</h4>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Device Type
          </label>
          <div className="flex flex-wrap gap-4">
            {Object.entries(formData.deviceType || {}).map(([device, isActive]) => (
              <div key={device} className="flex-1 min-w-[200px] p-1 rounded-lg border border-[#c2bbbb] border-solid">
                <ToggleSwitch
                  key={device}
                  checked={isActive}
                  onChange={() => handleDeviceToggle(device)}
                  label={device.charAt(0).toUpperCase() + device.slice(1)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cart & Product Conditions Card */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Cart & Product Conditions</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cart Value Range
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={formData.cartValueRange.min}
                onChange={(e) => handleCartValueRangeUpdate('min', e.target.value)}
                className="upspr-input"
              />
              <input
                type="number"
                placeholder="Max"
                value={formData.cartValueRange.max}
                onChange={(e) => handleCartValueRangeUpdate('max', e.target.value)}
                className="upspr-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cart Items Count
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={formData.cartItemsCount.min}
                onChange={(e) => handleCartItemsCountUpdate('min', e.target.value)}
                className="upspr-input"
              />
              <input
                type="number"
                placeholder="Max"
                value={formData.cartItemsCount.max}
                onChange={(e) => handleCartItemsCountUpdate('max', e.target.value)}
                className="upspr-input"
              />
            </div>
          </div>
          <div>
            <ProductSelector
              selectedProducts={formData.requiredProductsInCart || []}
              selectedProductNames={formData.requiredProductNamesInCart || []}
              onProductChange={handleRequiredProductsChange}
              placeholder="Search and select required products..."
              label="Required Products in Cart"
            />
            <p className="text-xs text-gray-500 mt-1">Show only when these products are in cart</p>
          </div>
          <div>
            <CategorySelector
              selectedCategories={formData.requiredCategoriesInCart || []}
              selectedCategoryNames={formData.requiredCategoryNamesInCart || []}
              onCategoryChange={handleRequiredCategoriesChange}
              placeholder="Search and select required categories..."
              label="Required Categories in Cart"
            />
            <p className="text-xs text-gray-500 mt-1">Show only when products from these categories are in cart</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VisibilityStep
