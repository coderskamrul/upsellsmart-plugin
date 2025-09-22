"use client"

const BasicInfoStep = ({ formData, updateFormData }) => {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Basic Information</h3>
        <p className="text-gray-600">Configure the fundamental settings for your recommendation rule</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rule Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rule Name
          </label>
          <input
            type="text"
            placeholder="e.g. Cross-sell Electronics"
            value={formData.ruleName}
            onChange={(e) => updateFormData('ruleName', e.target.value)}
            className="upspr-input"
          />
        </div>

        {/* Recommendation Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recommendation Type
          </label>
          <select
            value={formData.recommendationType}
            onChange={(e) => updateFormData('recommendationType', e.target.value)}
            className="upspr-select"
          >
            <option value="">Select type</option>
            <option value="cross-sell">Cross-sell</option>
            <option value="upsell">Upsell</option>
            <option value="related-products">Related Products</option>
            <option value="frequently-bought-together">Frequently Bought Together</option>
            <option value="personalized-recommendations">Personalized Recommendations</option>
            <option value="trending-products">Trending Products</option>
            <option value="recently-viewed">Recently Viewed</option>

          </select>
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            placeholder="Brief description of this recommendation rule and its purpose"
            value={formData.description}
            onChange={(e) => updateFormData('description', e.target.value)}
            rows={3}
            className="upspr-textarea"
          />
        </div>

        {/* Display Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Display Location
          </label>
          <select
            value={formData.displayLocation}
            onChange={(e) => updateFormData('displayLocation', e.target.value)}
            className="upspr-select"
          >
            <option value="">Select location</option>
            <option value="home-page">Home Page</option>
            <option value="product-page">Product Page</option>
            <option value="cart-page">Cart Page</option>
            <option value="checkout-page">Checkout Page</option>
            <option value="my-account-page">My Account Page</option>
            <option value="sidebar">Sidebar</option>
            <option value="footer">Footer</option>
            <option value="popup">Popup</option>
          </select>
        </div>

        {/* Hook Location - Conditional field based on display location */}
        {(formData.displayLocation === 'home-page' ||
          formData.displayLocation === 'product-page' ||
          formData.displayLocation === 'cart-page' ||
          formData.displayLocation === 'checkout-page' ||
          formData.displayLocation === 'my-account-page') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.displayLocation === 'home-page' && 'Home Page Hook Location'}
                {formData.displayLocation === 'product-page' && 'Product Page Hook Location'}
                {formData.displayLocation === 'cart-page' && 'Cart Page Hook Location'}
                {formData.displayLocation === 'checkout-page' && 'Checkout Page Hook Location'}
                {formData.displayLocation === 'my-account-page' && 'My Account Page Hook Location'}
              </label>
              <select
                value={formData.hookLocation || ''}
                onChange={(e) => updateFormData('hookLocation', e.target.value)}
                className="upspr-select"
              >
                <option value="">Select hook location</option>

                {/* Home Page Hooks */}
                {formData.displayLocation === 'home-page' && (
                  <>
                    <option value="wp_head">Before Page Head</option>
                    <option value="wp_body_open">After Body Open</option>
                    <option value="get_header">After Header</option>
                    <option value="wp_footer">Before Footer</option>
                    <option value="get_footer">After Footer</option>
                    <option value="the_content">Content Area</option>
                    <option value="loop_start">Before Posts Loop</option>
                    <option value="loop_end">After Posts Loop</option>
                  </>
                )}

                {/* Product Page Hooks */}
                {formData.displayLocation === 'product-page' && (
                  <>
                    <option value="woocommerce_before_single_product">Before Single Product</option>
                    <option value="woocommerce_single_product_summary">Single Product Summary</option>
                    <option value="woocommerce_before_add_to_cart_form">Before Add to Cart Form</option>
                    <option value="woocommerce_before_add_to_cart_quantity">Before Add to Cart Quantity</option>
                    <option value="woocommerce_after_add_to_cart_quantity">After Add to Cart Quantity</option>
                    <option value="woocommerce_after_single_variation">After Single Variation</option>
                    <option value="woocommerce_product_meta_end">Product Meta End</option>
                    <option value="woocommerce_after_single_product_summary">After Single Product Summary</option>
                    <option value="woocommerce_after_single_product">After Single Product</option>
                  </>
                )}

                {/* Cart Page Hooks */}
                {formData.displayLocation === 'cart-page' && (
                  <>
                    <option value="woocommerce_before_cart">Before Cart</option>
                    <option value="woocommerce_before_cart_table">Before Cart Table</option>
                    <option value="woocommerce_before_cart_contents">Before Cart Contents</option>
                    <option value="woocommerce_cart_contents">Cart Contents</option>
                    <option value="woocommerce_cart_coupon">Cart Coupon Area</option>
                    <option value="woocommerce_after_cart_contents">After Cart Contents</option>
                    <option value="woocommerce_after_cart_table">After Cart Table</option>
                    <option value="woocommerce_cart_collaterals">Cart Collaterals</option>
                    <option value="woocommerce_after_cart">After Cart</option>
                  </>
                )}

                {/* Checkout Page Hooks */}
                {formData.displayLocation === 'checkout-page' && (
                  <>
                    <option value="woocommerce_before_checkout_form">Before Checkout Form</option>
                    <option value="woocommerce_checkout_before_customer_details">Before Customer Details</option>
                    <option value="woocommerce_checkout_billing">Billing Section</option>
                    <option value="woocommerce_checkout_shipping">Shipping Section</option>
                    <option value="woocommerce_checkout_after_customer_details">After Customer Details</option>
                    <option value="woocommerce_checkout_before_order_review">Before Order Review</option>
                    <option value="woocommerce_checkout_order_review">Order Review</option>
                    <option value="woocommerce_review_order_before_cart_contents">Before Cart Contents in Review</option>
                    <option value="woocommerce_review_order_after_cart_contents">After Cart Contents in Review</option>
                    <option value="woocommerce_review_order_before_submit">Before Submit Button</option>
                    <option value="woocommerce_checkout_after_order_review">After Order Review</option>
                    <option value="woocommerce_after_checkout_form">After Checkout Form</option>
                  </>
                )}

                {/* My Account Page Hooks */}
                {formData.displayLocation === 'my-account-page' && (
                  <>
                    <option value="woocommerce_before_account_navigation">Before Account Navigation</option>
                    <option value="woocommerce_account_navigation">Account Navigation</option>
                    <option value="woocommerce_after_account_navigation">After Account Navigation</option>
                    <option value="woocommerce_account_content">Account Content Area</option>
                    <option value="woocommerce_before_account_orders">Before Account Orders</option>
                    <option value="woocommerce_after_account_orders">After Account Orders</option>
                    <option value="woocommerce_before_account_downloads">Before Account Downloads</option>
                    <option value="woocommerce_after_account_downloads">After Account Downloads</option>
                    <option value="woocommerce_before_account_payment_methods">Before Payment Methods</option>
                    <option value="woocommerce_after_account_payment_methods">After Payment Methods</option>
                    <option value="woocommerce_account_dashboard">Account Dashboard</option>
                  </>
                )}
              </select>
            </div>
          )}

        {/* Number of Products */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Products
          </label>
          <select
            value={formData.numberOfProducts}
            onChange={(e) => updateFormData('numberOfProducts', e.target.value)}
            className="upspr-select"
          >
            <option value="">Select count</option>
            <option value="2">2 Products</option>
            <option value="3">3 Products</option>
            <option value="4">4 Products</option>
            <option value="6">6 Products</option>
            <option value="8">8 Products</option>
            <option value="12">12 Products</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <select
            value={formData.priority}
            onChange={(e) => updateFormData('priority', e.target.value)}
            className="upspr-select"
          >
            <option value="">Select priority</option>
            <option value="1">High (1)</option>
            <option value="2">Medium (2)</option>
            <option value="3">Low (3)</option>
          </select>
        </div>
      </div>

      {/* Widget Settings */}
      <div className="mt-8">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Widget Settings</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Show Product Prices */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Show Product Prices</label>
              <p className="text-sm text-gray-500">Display product prices in the widget</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showProductPrices}
                onChange={(e) => updateFormData('showProductPrices', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          {/* Show Add to Cart Button */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Show Add to Cart Button</label>
              <p className="text-sm text-gray-500">Include quick add to cart functionality</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showAddToCartButton}
                onChange={(e) => updateFormData('showAddToCartButton', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          {/* Show Product Ratings */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Show Product Ratings</label>
              <p className="text-sm text-gray-500">Display star ratings</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showProductRatings}
                onChange={(e) => updateFormData('showProductRatings', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          {/* Show Product Category */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Show Product Category</label>
              <p className="text-sm text-gray-500">Display the product category</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showProductCategory}
                onChange={(e) => updateFormData('showProductCategory', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BasicInfoStep
