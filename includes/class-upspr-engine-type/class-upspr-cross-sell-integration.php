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
    public static function init() {
        // Hook into WordPress init to process active cross-sell campaigns
        add_action( 'wp', array( __CLASS__, 'process_active_campaigns' ) );
        
        // Hook into WooCommerce order completion to track conversions
        add_action( 'woocommerce_order_status_completed', array( __CLASS__, 'track_conversions' ) );
        add_action( 'woocommerce_order_status_processing', array( __CLASS__, 'track_conversions' ) );
    }

    /**
     * Process active cross-sell campaigns
     */
    public static function process_active_campaigns() {
        // Only process on frontend
        if ( is_admin() ) {
            return;
        }

        // Get active cross-sell campaigns
        $campaigns = self::get_active_cross_sell_campaigns();
        
        if ( empty( $campaigns ) ) {
            return;
        }

        foreach ( $campaigns as $campaign ) {
            $cross_sell = new UPSPR_Cross_Sell( $campaign );
            $cross_sell->process();
        }
    }

    /**
     * Get active cross-sell campaigns
     *
     * @return array Array of active campaigns
     */
    private static function get_active_cross_sell_campaigns() {
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
    public static function track_conversions( $order_id ) {
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
            self::check_and_track_product_conversion( $product_id, $quantity, $line_total, $customer_id );
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
    private static function check_and_track_product_conversion( $product_id, $quantity, $line_total, $customer_id ) {
        // This is a simplified implementation
        // In a real scenario, you'd track which campaigns showed which products to which users
        // and match conversions accordingly
        
        // For now, we'll attribute conversions to any active cross-sell campaign
        // that could have shown this product
        $campaigns = self::get_active_cross_sell_campaigns();
        
        foreach ( $campaigns as $campaign ) {
            // Simple check: if the product could have been recommended by this campaign
            if ( self::could_campaign_recommend_product( $campaign, $product_id ) ) {
                UPSPR_Performance_Tracker::track_conversion( 
                    $campaign['id'], 
                    $product_id, 
                    $line_total 
                );
                break; // Only attribute to one campaign to avoid double counting
            }
        }
    }

    /**
     * Check if a campaign could have recommended a product
     *
     * @param array $campaign Campaign data
     * @param int $product_id Product ID
     * @return bool Whether campaign could recommend this product
     */
    private static function could_campaign_recommend_product( $campaign, $product_id ) {
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
    public static function get_campaign_performance_summary( $campaign_id ) {
        return UPSPR_Performance_Tracker::get_performance_summary( $campaign_id );
    }

    /**
     * Reset campaign performance
     *
     * @param int $campaign_id Campaign ID
     * @return bool Success status
     */
    public static function reset_campaign_performance( $campaign_id ) {
        return UPSPR_Performance_Tracker::reset_campaign_performance( $campaign_id );
    }

    /**
     * Get all cross-sell campaigns with performance data
     *
     * @return array Array of campaigns with performance data
     */
    public static function get_campaigns_with_performance() {
        $campaigns = self::get_active_cross_sell_campaigns();
        
        foreach ( $campaigns as &$campaign ) {
            $campaign['performance_summary'] = self::get_campaign_performance_summary( $campaign['id'] );
        }
        
        return $campaigns;
    }

    /**
     * Test cross-sell functionality with sample data
     *
     * @return array Test results
     */
    public static function test_cross_sell_functionality() {
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
}

// Initialize the integration
UPSPR_Cross_Sell_Integration::init();
