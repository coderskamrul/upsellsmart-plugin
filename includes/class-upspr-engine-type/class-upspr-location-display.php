<?php
/**
 * Location Display Handler - Manages display locations and hook mappings for all campaign types
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class UPSPR_Location_Display {

    /**
     * Display location to hook mapping
     */
    private static $location_hooks = array(
        'home-page' => array(
            'wp_head' => 'Before Page Head',
            'wp_body_open' => 'After Body Open',
            'get_header' => 'After Header',
            'wp_footer' => 'Before Footer',
            'get_footer' => 'After Footer',
            'the_content' => 'Content Area',
            'loop_start' => 'Before Posts Loop',
            'loop_end' => 'After Posts Loop',
        ),
        'product-page' => array(
            'woocommerce_before_single_product' => 'Before Single Product',
            'woocommerce_single_product_summary' => 'Single Product Summary',
            'woocommerce_before_add_to_cart_form' => 'Before Add to Cart Form',
            'woocommerce_before_add_to_cart_quantity' => 'Before Add to Cart Quantity',
            'woocommerce_after_add_to_cart_quantity' => 'After Add to Cart Quantity',
            'woocommerce_after_single_variation' => 'After Single Variation',
            'woocommerce_product_meta_end' => 'Product Meta End',
            'woocommerce_after_single_product_summary' => 'After Single Product Summary',
            'woocommerce_after_single_product' => 'After Single Product',
        ),
        'cart-page' => array(
            'woocommerce_before_cart' => 'Before Cart',
            'woocommerce_before_cart_table' => 'Before Cart Table',
            'woocommerce_before_cart_contents' => 'Before Cart Contents',
            'woocommerce_cart_contents' => 'Cart Contents',
            'woocommerce_cart_coupon' => 'Cart Coupon Area',
            'woocommerce_after_cart_contents' => 'After Cart Contents',
            'woocommerce_after_cart_table' => 'After Cart Table',
            'woocommerce_cart_collaterals' => 'Cart Collaterals',
            'woocommerce_after_cart' => 'After Cart',
        ),
        'checkout-page' => array(
            'woocommerce_before_checkout_form' => 'Before Checkout Form',
            'woocommerce_checkout_before_customer_details' => 'Before Customer Details',
            'woocommerce_checkout_billing' => 'Billing Section',
            'woocommerce_checkout_shipping' => 'Shipping Section',
            'woocommerce_checkout_after_customer_details' => 'After Customer Details',
            'woocommerce_checkout_before_order_review' => 'Before Order Review',
            'woocommerce_checkout_order_review' => 'Order Review',
            'woocommerce_review_order_before_cart_contents' => 'Before Cart Contents in Review',
            'woocommerce_review_order_after_cart_contents' => 'After Cart Contents in Review',
            'woocommerce_review_order_before_submit' => 'Before Submit Button',
            'woocommerce_checkout_after_order_review' => 'After Order Review',
            'woocommerce_after_checkout_form' => 'After Checkout Form',
        ),
        'my-account-page' => array(
            'woocommerce_before_account_navigation' => 'Before Account Navigation',
            'woocommerce_account_navigation' => 'Account Navigation',
            'woocommerce_after_account_navigation' => 'After Account Navigation',
            'woocommerce_account_content' => 'Account Content Area',
            'woocommerce_before_account_orders' => 'Before Account Orders',
            'woocommerce_after_account_orders' => 'After Account Orders',
            'woocommerce_before_account_downloads' => 'Before Account Downloads',
            'woocommerce_after_account_downloads' => 'After Account Downloads',
            'woocommerce_before_account_payment_methods' => 'Before Payment Methods',
            'woocommerce_after_account_payment_methods' => 'After Payment Methods',
            'woocommerce_account_dashboard' => 'Account Dashboard',
        ),
        'sidebar' => array(
            'dynamic_sidebar' => 'Widget Area',
            'wp_footer' => 'Footer Area',
        ),
        'footer' => array(
            'wp_footer' => 'Footer Area',
            'get_footer' => 'After Footer',
        ),
        'popup' => array(
            'wp_footer' => 'Footer (Popup Script)',
            'wp_head' => 'Head (Popup Script)',
        ),
    );

    /**
     * Display campaign at specified location
     *
     * @param array $campaign_data Campaign data containing basic_info with displayLocation and hookLocation
     * @param array $recommendations Formatted recommendations to display
     * @param string $campaign_type Campaign type (cross-sell, upsell, etc.)
     * @return bool True if displayed successfully, false otherwise
     */
    public static function display_campaign( $campaign_data, $recommendations, $campaign_type = '' ) {
        //if ( empty( $campaign_data ) || empty( $recommendations ) ) {
        if ( empty( $campaign_data ) ) {
            return false;
        }

        // Get display location and hook location from campaign data
        $display_location = isset( $campaign_data['basic_info']['displayLocation'] ) ? $campaign_data['basic_info']['displayLocation'] : '';
        $hook_location = isset( $campaign_data['basic_info']['hookLocation'] ) ? $campaign_data['basic_info']['hookLocation'] : '';
        if ( empty( $display_location ) || empty( $hook_location ) ) {
            return false;
        }

        // Validate that the hook location is valid for the display location
        if ( ! self::is_valid_hook_for_location( $display_location, $hook_location ) ) {
            return false;
        }

        // Check if we should display on current page
        if ( ! self::should_display_on_current_page( $display_location ) ) {
            return false;
        }

        // Add the hook to display the campaign
        add_action( $hook_location, function() use ( $campaign_data, $recommendations, $campaign_type ) {
            self::render_campaign_widget( $campaign_data, $recommendations, $campaign_type );
        }, 10 );

        return true;
    }

    /**
     * Check if hook location is valid for display location
     *
     * @param string $display_location Display location
     * @param string $hook_location Hook location
     * @return bool True if valid, false otherwise
     */
    private static function is_valid_hook_for_location( $display_location, $hook_location ) {
        if ( ! isset( self::$location_hooks[ $display_location ] ) ) {
            return false;
        }

        return array_key_exists( $hook_location, self::$location_hooks[ $display_location ] );
    }

    /**
     * Check if campaign should display on current page
     *
     * @param string $display_location Display location
     * @return bool True if should display, false otherwise
     */
    private static function should_display_on_current_page( $display_location ) {
        switch ( $display_location ) {
            case 'home-page':
                return is_front_page() || is_home();
            
            case 'product-page':
                return is_product();
            
            case 'cart-page':
                return is_cart();
            
            case 'checkout-page':
                return is_checkout();
            
            case 'my-account-page':
                return is_account_page();
            
            case 'sidebar':
            case 'footer':
            case 'popup':
                return true; // These can display on any page
            
            default:
                return false;
        }
    }

    /**
     * Render campaign widget
     *
     * @param array $campaign_data Campaign data
     * @param array $recommendations Recommendations to display
     * @param string $campaign_type Campaign type
     */
    private static function render_campaign_widget( $campaign_data, $recommendations, $campaign_type ) {
        $basic_info = isset( $campaign_data['basic_info'] ) ? $campaign_data['basic_info'] : array();
        
        // Get widget settings
        $show_prices = isset( $basic_info['showProductPrices'] ) ? $basic_info['showProductPrices'] : true;
        $show_ratings = isset( $basic_info['showProductRatings'] ) ? $basic_info['showProductRatings'] : true;
        $show_add_to_cart = isset( $basic_info['showAddToCartButton'] ) ? $basic_info['showAddToCartButton'] : true;
        $show_category = isset( $basic_info['showProductCategory'] ) ? $basic_info['showProductCategory'] : true;
        $rule_name = isset( $basic_info['ruleName'] ) ? $basic_info['ruleName'] : '';

        // Start widget output
        echo '<div class="upspr-campaign-widget upspr-' . esc_attr( $campaign_type ) . '-widget" data-campaign-id="' . esc_attr( $campaign_data['id'] ) . '">';
        
        if ( ! empty( $rule_name ) ) {
            echo '<h3 class="upspr-widget-title">' . esc_html( $rule_name ) . '</h3>';
        }
        
        echo '<div class="upspr-products-grid">';
        
        foreach ( $recommendations as $product ) {
            self::render_product_item( $product, $show_prices, $show_ratings, $show_add_to_cart, $show_category );
        }
        
        echo '</div>';
        echo '</div>';
    }

    /**
     * Render individual product item
     *
     * @param array $product Product data
     * @param bool $show_prices Show product prices
     * @param bool $show_ratings Show product ratings
     * @param bool $show_add_to_cart Show add to cart button
     * @param bool $show_category Show product category
     */
    private static function render_product_item( $product, $show_prices, $show_ratings, $show_add_to_cart, $show_category ) {
        echo '<div class="upspr-product-item" data-product-id="' . esc_attr( $product['id'] ) . '">';
        
        // Product image
        if ( ! empty( $product['image'] ) ) {
            echo '<div class="upspr-product-image">';
            echo '<a href="' . esc_url( $product['url'] ) . '" class="upspr-product-link">';
            echo '<img src="' . esc_url( $product['image'][0] ) . '" alt="' . esc_attr( $product['name'] ) . '">';
            echo '</a>';
            echo '</div>';
        }
        
        echo '<div class="upspr-product-details">';
        
        // Product name
        echo '<h4 class="upspr-product-name">';
        echo '<a href="' . esc_url( $product['url'] ) . '" class="upspr-product-link">' . esc_html( $product['name'] ) . '</a>';
        echo '</h4>';
        
        // Product category
        if ( $show_category && ! empty( $product['category'] ) ) {
            echo '<div class="upspr-product-category">' . esc_html( $product['category'] ) . '</div>';
        }
        
        // Product rating
        if ( $show_ratings && ! empty( $product['rating'] ) ) {
            echo '<div class="upspr-product-rating">';
            echo wc_get_rating_html( $product['rating'] );
            echo '</div>';
        }
        
        // Product price
        if ( $show_prices && ! empty( $product['price'] ) ) {
            echo '<div class="upspr-product-price">' . wc_price( $product['price'] ) . '</div>';
        }
        
        // Add to cart button
        if ( $show_add_to_cart ) {
            echo '<div class="upspr-add-to-cart">';
            echo '<a href="?add-to-cart=' . esc_attr( $product['id'] ) . '" class="button add_to_cart_button upspr-add-to-cart-btn" data-product_id="' . esc_attr( $product['id'] ) . '">';
            echo __( 'Add to Cart', 'upsellsmart' );
            echo '</a>';
            echo '</div>';
        }
        
        echo '</div>';
        echo '</div>';
    }

    /**
     * Get available hooks for a display location
     *
     * @param string $display_location Display location
     * @return array Available hooks
     */
    public static function get_hooks_for_location( $display_location ) {
        return isset( self::$location_hooks[ $display_location ] ) ? self::$location_hooks[ $display_location ] : array();
    }

    /**
     * Get all available display locations
     *
     * @return array Display locations
     */
    public static function get_display_locations() {
        return array_keys( self::$location_hooks );
    }

    /**
     * Get display location label
     *
     * @param string $location Location key
     * @return string Location label
     */
    public static function get_location_label( $location ) {
        $labels = array(
            'home-page' => __( 'Home Page', 'upsellsmart' ),
            'product-page' => __( 'Product Page', 'upsellsmart' ),
            'cart-page' => __( 'Cart Page', 'upsellsmart' ),
            'checkout-page' => __( 'Checkout Page', 'upsellsmart' ),
            'my-account-page' => __( 'My Account Page', 'upsellsmart' ),
            'sidebar' => __( 'Sidebar', 'upsellsmart' ),
            'footer' => __( 'Footer', 'upsellsmart' ),
            'popup' => __( 'Popup', 'upsellsmart' ),
        );

        return isset( $labels[ $location ] ) ? $labels[ $location ] : $location;
    }

    /**
     * Get hook location label
     *
     * @param string $display_location Display location
     * @param string $hook_location Hook location
     * @return string Hook location label
     */
    public static function get_hook_label( $display_location, $hook_location ) {
        $hooks = self::get_hooks_for_location( $display_location );
        return isset( $hooks[ $hook_location ] ) ? $hooks[ $hook_location ] : $hook_location;
    }

    /**
     * Get default hook for a display location
     *
     * @param string $display_location Display location
     * @return string Default hook location
     */
    public static function get_default_hook( $display_location ) {
        $defaults = array(
            'home-page' => 'the_content',
            'product-page' => 'woocommerce_product_meta_end',
            'cart-page' => 'woocommerce_after_cart_table',
            'checkout-page' => 'woocommerce_checkout_after_order_review',
            'my-account-page' => 'woocommerce_account_content',
            'sidebar' => 'dynamic_sidebar',
            'footer' => 'wp_footer',
            'popup' => 'wp_footer',
        );

        return isset( $defaults[ $display_location ] ) ? $defaults[ $display_location ] : '';
    }

    /**
     * Validate campaign data for location display
     *
     * @param array $campaign_data Campaign data
     * @return bool True if valid, false otherwise
     */
    public static function validate_campaign_data( $campaign_data ) {
        if ( empty( $campaign_data ) || ! isset( $campaign_data['basic_info'] ) ) {
            return false;
        }

        $basic_info = $campaign_data['basic_info'];

        if ( empty( $basic_info['displayLocation'] ) || empty( $basic_info['hookLocation'] ) ) {
            return false;
        }

        return self::is_valid_hook_for_location( $basic_info['displayLocation'], $basic_info['hookLocation'] );
    }

    /**
     * Get campaign widget HTML without echoing it
     *
     * @param array $campaign_data Campaign data
     * @param array $recommendations Recommendations to display
     * @param string $campaign_type Campaign type
     * @return string HTML output
     */
    public static function get_campaign_html( $campaign_data, $recommendations, $campaign_type = '' ) {
        ob_start();
        self::render_campaign_widget( $campaign_data, $recommendations, $campaign_type );
        return ob_get_clean();
    }
}
