# UpsellSmart Location Display System

This document explains how to use the unified location display system for all campaign types in the UpsellSmart plugin.

## Overview

The `UPSPR_Location_Display` class provides a centralized system for displaying campaigns at specific locations on your WordPress/WooCommerce site. All campaign types (cross-sell, upsell, related products, etc.) now use this unified system.

## Available Display Locations

The system supports the following display locations:

- **home-page**: Home page or front page
- **product-page**: Individual product pages
- **cart-page**: Shopping cart page
- **checkout-page**: Checkout page
- **my-account-page**: Customer account pages
- **sidebar**: Widget areas/sidebars
- **footer**: Footer area
- **popup**: Popup/modal display

## Hook Locations by Display Location

### Home Page (`home-page`)
- `wp_head` - Before Page Head
- `wp_body_open` - After Body Open
- `get_header` - After Header
- `wp_footer` - Before Footer
- `get_footer` - After Footer
- `the_content` - Content Area
- `loop_start` - Before Posts Loop
- `loop_end` - After Posts Loop

### Product Page (`product-page`)
- `woocommerce_before_single_product` - Before Single Product
- `woocommerce_single_product_summary` - Single Product Summary
- `woocommerce_before_add_to_cart_form` - Before Add to Cart Form
- `woocommerce_before_add_to_cart_quantity` - Before Add to Cart Quantity
- `woocommerce_after_add_to_cart_quantity` - After Add to Cart Quantity
- `woocommerce_after_single_variation` - After Single Variation
- `woocommerce_product_meta_end` - Product Meta End (Default)
- `woocommerce_after_single_product_summary` - After Single Product Summary
- `woocommerce_after_single_product` - After Single Product

### Cart Page (`cart-page`)
- `woocommerce_before_cart` - Before Cart
- `woocommerce_before_cart_table` - Before Cart Table
- `woocommerce_before_cart_contents` - Before Cart Contents
- `woocommerce_cart_contents` - Cart Contents
- `woocommerce_cart_coupon` - Cart Coupon Area
- `woocommerce_after_cart_contents` - After Cart Contents
- `woocommerce_after_cart_table` - After Cart Table (Default)
- `woocommerce_cart_collaterals` - Cart Collaterals
- `woocommerce_after_cart` - After Cart

### Checkout Page (`checkout-page`)
- `woocommerce_before_checkout_form` - Before Checkout Form
- `woocommerce_checkout_before_customer_details` - Before Customer Details
- `woocommerce_checkout_billing` - Billing Section
- `woocommerce_checkout_shipping` - Shipping Section
- `woocommerce_checkout_after_customer_details` - After Customer Details
- `woocommerce_checkout_before_order_review` - Before Order Review
- `woocommerce_checkout_order_review` - Order Review
- `woocommerce_review_order_before_cart_contents` - Before Cart Contents in Review
- `woocommerce_review_order_after_cart_contents` - After Cart Contents in Review
- `woocommerce_review_order_before_submit` - Before Submit Button
- `woocommerce_checkout_after_order_review` - After Order Review (Default)
- `woocommerce_after_checkout_form` - After Checkout Form

### My Account Page (`my-account-page`)
- `woocommerce_before_account_navigation` - Before Account Navigation
- `woocommerce_account_navigation` - Account Navigation
- `woocommerce_after_account_navigation` - After Account Navigation
- `woocommerce_account_content` - Account Content Area (Default)
- `woocommerce_before_account_orders` - Before Account Orders
- `woocommerce_after_account_orders` - After Account Orders
- `woocommerce_before_account_downloads` - Before Account Downloads
- `woocommerce_after_account_downloads` - After Account Downloads
- `woocommerce_before_account_payment_methods` - Before Payment Methods
- `woocommerce_after_account_payment_methods` - After Payment Methods
- `woocommerce_account_dashboard` - Account Dashboard

## Usage Examples

### Basic Usage in Campaign Classes

All campaign type classes now automatically use the location display system in their `process()` method:

```php
public function process() {
    // ... get recommendations logic ...
    
    $formatted_recommendations = $this->format_recommendations( $recommendations );

    // Display the campaign using the location display system
    if ( ! empty( $formatted_recommendations ) ) {
        UPSPR_Location_Display::display_campaign( 
            $this->campaign_data, 
            $formatted_recommendations, 
            'cross-sell' 
        );
    }

    return $formatted_recommendations;
}
```

### Using Helper Functions

```php
// Display a campaign at a specific location
$success = upspr_display_campaign_at_location( $campaign_data, $recommendations, 'cross-sell' );

// Get available hooks for a location
$hooks = upspr_get_location_hooks( 'product-page' );

// Get default hook for a location
$default_hook = upspr_get_default_hook( 'product-page' ); // Returns 'woocommerce_product_meta_end'

// Validate campaign data
$is_valid = upspr_validate_campaign_location( $campaign_data );
```

### Campaign Data Structure

Your campaign data should include the `basic_info` array with `displayLocation` and `hookLocation`:

```php
$campaign_data = array(
    'id' => 9,
    'name' => 'Product Rule',
    'type' => 'cross-sell',
    'basic_info' => array(
        'displayLocation' => 'product-page',
        'hookLocation' => 'woocommerce_product_meta_end',
        'ruleName' => 'Product Rule',
        'showProductPrices' => true,
        'showProductRatings' => true,
        'showAddToCartButton' => true,
        'showProductCategory' => true,
        // ... other settings
    ),
    // ... other campaign data
);
```

## Widget Settings

The system supports the following widget display settings from `basic_info`:

- `showProductPrices` - Display product prices
- `showProductRatings` - Display star ratings
- `showAddToCartButton` - Show add to cart buttons
- `showProductCategory` - Display product categories
- `ruleName` - Widget title

## Styling

The system generates HTML with CSS classes for easy styling:

- `.upspr-campaign-widget` - Main widget container
- `.upspr-{campaign-type}-widget` - Campaign type specific class
- `.upspr-products-grid` - Products grid container
- `.upspr-product-item` - Individual product item
- `.upspr-product-image`, `.upspr-product-name`, etc. - Product elements

CSS file is located at: `assets/css/campaign-widgets.css`

## Page Context Validation

The system automatically validates that campaigns only display on appropriate pages:

- `home-page` campaigns only show on front page/home
- `product-page` campaigns only show on product pages
- `cart-page` campaigns only show on cart page
- `checkout-page` campaigns only show on checkout page
- `my-account-page` campaigns only show on account pages
- `sidebar`, `footer`, `popup` can display on any page

## Error Handling

The system includes validation for:

- Empty campaign data or recommendations
- Invalid display location and hook location combinations
- Page context validation
- Hook location validation for each display location

## Integration

The location display system is automatically loaded when you include the campaign engine types:

```php
require_once UPSPR_PLUGIN_PATH . 'includes/class-upspr-engine-type/index.php';
```

This loads all campaign types and the location display system, making it available throughout your plugin.
