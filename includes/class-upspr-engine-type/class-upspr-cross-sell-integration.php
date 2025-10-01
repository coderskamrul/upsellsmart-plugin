<?php
/**
 * Cross-sell Integration - Handles automatic processing of cross-sell campaigns
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class UPSPR_Cross_Sell_Integration {

    /**
     * Initialize integration
     */
    public static function upspr_init() {

        // Hook into WordPress init to process active cross-sell campaigns
        add_action( 'wp', array( __CLASS__, 'upspr_process_active_campaigns' ) );
        // Hook into WooCommerce order completion to track conversions
        add_action( 'woocommerce_order_status_completed', array( __CLASS__, 'upspr_track_conversions' ) );
        add_action( 'woocommerce_order_status_processing', array( __CLASS__, 'upspr_track_conversions' ) );

        // Add AJAX handler for storing campaign interactions
        add_action( 'wp_ajax_upspr_store_campaign_interaction', array( __CLASS__, 'upspr_ajax_store_campaign_interaction' ) );
        add_action( 'wp_ajax_nopriv_upspr_store_campaign_interaction', array( __CLASS__, 'upspr_ajax_store_campaign_interaction' ) );

        // Add test AJAX handler
        add_action( 'wp_ajax_upspr_test_conversion_tracking', array( __CLASS__, 'upspr_test_conversion_tracking' ) );

    }

    /**
     * Process active cross-sell campaigns
     */
    public static function upspr_process_active_campaigns() {
        // Only process on frontend
        if ( is_admin() ) {
            return;
        }

        // Get active cross-sell campaigns
        $campaigns = self::upspr_get_active_cross_sell_campaigns();

        if ( empty( $campaigns ) ) {
            return;
        }

        foreach ( $campaigns as $campaign ) {
            $cross_sell = new UPSPR_Cross_Sell( $campaign );
            $cross_sell->upspr_process();
        }
    }

    /**
     * Get active cross-sell campaigns
     *
     * @return array Array of active campaigns
     */
    private static function upspr_get_active_cross_sell_campaigns() {
        global $wpdb;

        $table_name = $wpdb->prefix . 'upspr_recommendation_campaigns';

        $campaigns = $wpdb->get_results( $wpdb->prepare(
            "SELECT * FROM {$table_name}
             WHERE type = %s
             AND status = %s
             ORDER BY priority DESC, created_at ASC",
            'cross-sell',
            'active'
        ), ARRAY_A );
        
        if ( empty( $campaigns ) ) {
            return array();
        }
        
        // Decode JSON fields
        foreach ( $campaigns as &$campaign ) {
            $campaign['basic_info'] = json_decode( $campaign['basic_info'], true );
            $campaign['filters'] = json_decode( $campaign['filters'], true );
            $campaign['amplifiers'] = json_decode( $campaign['amplifiers'], true );
            $campaign['personalization'] = json_decode( $campaign['personalization'], true );
            $campaign['visibility'] = json_decode( $campaign['visibility'], true );
            $campaign['performance'] = json_decode( $campaign['performance_data'], true );
            
            // Ensure performance data has default values
            if ( empty( $campaign['performance'] ) ) {
                $campaign['performance'] = array(
                    'impressions' => 0,
                    'clicks' => 0,
                    'conversions' => 0,
                    'revenue' => 0
                );
            }
        }
        
        return $campaigns;
    }

    /**
     * Track conversions when orders are completed
     *
     * @param int $order_id Order ID
     */
    public static function upspr_track_conversions( $order_id ) {
        $order = wc_get_order( $order_id );

        if ( ! $order ) {
            return;
        }

        // Check if this order contains products that were recommended by cross-sell campaigns
        // This would typically be tracked via cookies or session data
        // For now, we'll implement a basic version that tracks based on recent activity
        
        $customer_id = $order->get_customer_id();
        $order_items = $order->get_items();
        
        foreach ( $order_items as $item ) {
            $product_id = $item->get_product_id();
            $quantity = $item->get_quantity();
            $line_total = $item->get_total();
            
            // Check if this product was recently shown in cross-sell campaigns
            self::upspr_check_and_track_product_conversion( $product_id, $quantity, $line_total, $customer_id );
        }
    }

    /**
     * Check and track product conversion
     *
     * @param int $product_id Product ID
     * @param int $quantity Quantity purchased
     * @param float $line_total Line total
     * @param int $customer_id Customer ID
     */
    private static function upspr_check_and_track_product_conversion( $product_id, $quantity, $line_total, $customer_id ) {
        // Check if we have session data indicating which campaign this product was clicked from
        $campaign_id = self::upspr_get_campaign_from_session( $product_id );

        if ( $campaign_id ) {
            // We have specific campaign attribution data
            UPSPR_Performance_Tracker::upspr_track_conversion(
                $campaign_id,
                $product_id,
                $line_total,
                'cross-sell'
            );

            // Clear the session data to prevent double counting
            self::upspr_clear_campaign_session_data( $product_id );
        } else {
            // Fallback to the original logic for products without specific attribution
            $campaigns = self::upspr_get_active_cross_sell_campaigns();

            foreach ( $campaigns as $campaign ) {
                // Simple check: if the product could have been recommended by this campaign
                if ( self::upspr_could_campaign_recommend_product( $campaign, $product_id ) ) {
                    UPSPR_Performance_Tracker::upspr_track_conversion(
                        $campaign['id'],
                        $product_id,
                        $line_total,
                        'cross-sell'
                    );
                    break; // Only attribute to one campaign to avoid double counting
                }
            }
        }
    }

    /**
     * Get campaign ID from session data for a specific product
     *
     * @param int $product_id Product ID
     * @return int|false Campaign ID or false if not found
     */
    private static function upspr_get_campaign_from_session( $product_id ) {
        // Check if we have session data from JavaScript
        // This would typically be stored via AJAX when a user clicks on a recommendation

        // For now, we'll use a transient as a fallback since we can't directly access sessionStorage from PHP
        $session_key = 'upspr_campaign_' . $product_id . '_' . session_id();
        $campaign_data = get_transient( $session_key );

        if ( $campaign_data && isset( $campaign_data['campaign_id'] ) ) {
            return intval( $campaign_data['campaign_id'] );
        }

        return false;
    }

    /**
     * Clear campaign session data for a product
     *
     * @param int $product_id Product ID
     */
    private static function upspr_clear_campaign_session_data( $product_id ) {
        $session_key = 'upspr_campaign_' . $product_id . '_' . session_id();
        delete_transient( $session_key );
    }

    /**
     * Check if a campaign could have recommended a product
     *
     * @param array $campaign Campaign data
     * @param int $product_id Product ID
     * @return bool Whether campaign could recommend this product
     */
    private static function upspr_could_campaign_recommend_product( $campaign, $product_id ) {
        // This is a simplified check
        // In reality, you'd run the same filtering logic as the recommendation engine

        $filters = isset( $campaign['filters'] ) ? $campaign['filters'] : array();

        // Check if product is excluded
        if ( isset( $filters['excludeProducts'] ) && in_array( $product_id, $filters['excludeProducts'] ) ) {
            return false;
        }

        // Check category filters
        if ( isset( $filters['includeCategories'] ) && ! empty( $filters['includeCategories'] ) ) {
            $product_categories = wp_get_post_terms( $product_id, 'product_cat', array( 'fields' => 'ids' ) );
            if ( is_wp_error( $product_categories ) || empty( array_intersect( $product_categories, $filters['includeCategories'] ) ) ) {
                return false;
            }
        }

        // Check excluded categories
        if ( isset( $filters['excludeCategories'] ) && ! empty( $filters['excludeCategories'] ) ) {
            $product_categories = wp_get_post_terms( $product_id, 'product_cat', array( 'fields' => 'ids' ) );
            if ( ! is_wp_error( $product_categories ) && ! empty( array_intersect( $product_categories, $filters['excludeCategories'] ) ) ) {
                return false;
            }
        }

        return true; // Passed basic checks
    }

    /**
     * Get campaign performance summary
     *
     * @param int $campaign_id Campaign ID
     * @return array Performance summary
     */
    public static function upspr_get_campaign_performance_summary( $campaign_id ) {
        return UPSPR_Performance_Tracker::upspr_get_performance_summary( $campaign_id );
    }

    /**
     * Reset campaign performance
     *
     * @param int $campaign_id Campaign ID
     * @return bool Success status
     */
    public static function upspr_reset_campaign_performance( $campaign_id ) {
        return UPSPR_Performance_Tracker::upspr_reset_campaign_performance( $campaign_id );
    }

    /**
     * Get all cross-sell campaigns with performance data
     *
     * @return array Array of campaigns with performance data
     */
    public static function upspr_get_campaigns_with_performance() {
        $campaigns = self::upspr_get_active_cross_sell_campaigns();

        foreach ( $campaigns as &$campaign ) {
            $campaign['performance_summary'] = self::upspr_get_campaign_performance_summary( $campaign['id'] );
        }

        return $campaigns;
    }

    /**
     * Test cross-sell functionality with sample data
     *
     * @return array Test results
     */
    public static function upspr_test_cross_sell_functionality() {
        // Create a test campaign data structure
        $test_campaign = array(
            'id' => 999,
            'name' => 'Test Cross-sell Campaign',
            'type' => 'cross-sell',
            'status' => 'active',
            'basic_info' => array(
                'ruleName' => 'Test Cross-sell',
                'displayLocation' => 'product-page',
                'hookLocation' => 'woocommerce_product_meta_end',
                'numberOfProducts' => 4,
                'showProductPrices' => 1,
                'showProductRatings' => 1,
                'showAddToCartButton' => 1,
                'showProductCategory' => 1,
            ),
            'filters' => array(
                'stockStatus' => 'in-stock',
                'productType' => 'any',
            ),
            'amplifiers' => array(),
            'personalization' => array(),
            'visibility' => array(),
            'performance' => array(
                'impressions' => 0,
                'clicks' => 0,
                'conversions' => 0,
                'revenue' => 0
            )
        );
        
        // Test the cross-sell engine
        $cross_sell = new UPSPR_Cross_Sell( $test_campaign );
        $recommendations = $cross_sell->process();
        
        return array(
            'success' => ! empty( $recommendations ),
            'recommendations_count' => count( $recommendations ),
            'recommendations' => $recommendations,
            'message' => ! empty( $recommendations ) ? 'Cross-sell functionality working correctly' : 'No recommendations generated'
        );
    }

    /**
     * AJAX handler for storing campaign interactions
     */
    public static function upspr_ajax_store_campaign_interaction() {
        check_ajax_referer( 'upspr_tracking_nonce', 'nonce' );

        $campaign_id = intval( $_POST['campaign_id'] );
        $product_id = intval( $_POST['product_id'] );
        $interaction_type = sanitize_text_field( $_POST['type'] );

        if ( ! $campaign_id || ! $product_id ) {
            wp_send_json_error( 'Invalid campaign or product ID' );
        }

        // Store interaction data in transient for conversion tracking
        $session_key = 'upspr_campaign_' . $product_id . '_' . session_id();
        $interaction_data = array(
            'campaign_id' => $campaign_id,
            'product_id' => $product_id,
            'type' => $interaction_type,
            'timestamp' => time()
        );

        // Store for 24 hours
        set_transient( $session_key, $interaction_data, 24 * HOUR_IN_SECONDS );

        wp_send_json_success( array( 'stored' => true ) );
    }

    /**
     * Test function to manually trigger conversion tracking
     * This can be called via admin-ajax.php for testing
     */
    public static function upspr_test_conversion_tracking() {
        echo '<pre>'; print_r('Testing conversion tracking...'); echo '</pre>';

        // Simulate an order with some products
        $test_order_id = 123; // Use a fake order ID for testing
        $test_product_id = 456; // Use a fake product ID
        $test_line_total = 29.99;
        $test_customer_id = 1;

        echo '<pre>'; print_r('Calling upspr_check_and_track_product_conversion...'); echo '</pre>';
        self::upspr_check_and_track_product_conversion( $test_product_id, 1, $test_line_total, $test_customer_id );

        echo '<pre>'; print_r('Test completed'); echo '</pre>';
    }
}

// Integration will be initialized from the main plugin file
