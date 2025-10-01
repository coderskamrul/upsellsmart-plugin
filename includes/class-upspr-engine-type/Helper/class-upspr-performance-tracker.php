<?php
/**
 * Performance Tracker Helper - Track campaign performance metrics
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class UPSPR_Performance_Tracker {

    /**
     * Track impression for a campaign with campaign-specific validation
     *
     * @param int $campaign_id Campaign ID
     * @param array $product_ids Array of product IDs that were shown
     * @param array $campaign_data Optional campaign data for validation (if not provided, will be fetched)
     * @return bool Success status
     */
    public static function upspr_track_impression( $campaign_id, $product_ids = array(), $campaign_data = null ) {
        if ( empty( $campaign_id ) ) {
            return false;
        }

        // Get campaign data if not provided
        if ( $campaign_data === null ) {
            $campaign_data = self::upspr_get_campaign_data( $campaign_id );
            if ( ! $campaign_data ) {
                return false;
            }
        }

        // Validate impression using campaign-specific rules
        if ( ! self::upspr_should_track_impression( $campaign_data, $product_ids ) ) {
            // Log validation failure for debugging
            if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
                error_log( 'UPSPR: Impression validation failed for campaign ' . $campaign_id . ' (Type: ' . ($campaign_data['type'] ?? 'unknown') . ')' );
            }
            return false;
        }

        // Get current performance data
        $performance = self::upspr_get_campaign_performance( $campaign_id );

        // Increment impressions
        $performance['impressions'] = isset( $performance['impressions'] ) ? $performance['impressions'] + 1 : 1;

        // Update last impression timestamp
        $performance['last_impression'] = current_time( 'mysql' );

        // Track which products were shown
        if ( ! empty( $product_ids ) ) {
            if ( ! isset( $performance['product_impressions'] ) ) {
                $performance['product_impressions'] = array();
            }

            foreach ( $product_ids as $product_id ) {
                if ( ! isset( $performance['product_impressions'][ $product_id ] ) ) {
                    $performance['product_impressions'][ $product_id ] = 0;
                }
                $performance['product_impressions'][ $product_id ]++;
            }
        }
        return self::upspr_update_campaign_performance( $campaign_id, $performance );
    }

    /**
     * Validate if impression should be tracked based on campaign type
     *
     * @param array $campaign_data Campaign data
     * @param array $product_ids Product IDs that were shown
     * @return bool True if impression should be tracked
     */
    private static function upspr_should_track_impression( $campaign_data, $product_ids = array() ) {
        // Basic validation - must have campaign type and basic info
        if ( empty( $campaign_data['type'] ) || empty( $campaign_data['basic_info'] ) ) {
            return false;
        }

        // Must have at least one product
        if ( empty( $product_ids ) ) {
            return false;
        }

        // Must have valid display configuration
        $basic_info = $campaign_data['basic_info'];
        if ( empty( $basic_info['displayLocation'] ) || empty( $basic_info['hookLocation'] ) ) {
            return false;
        }

        $campaign_type = $campaign_data['type'];
        $display_location = $basic_info['displayLocation'];

        // Only validate cross-sell campaigns for now
        if ( $campaign_type === 'cross-sell' ) {
            return self::upspr_validate_cross_sell_impression( $display_location, $product_ids );
        }

        // Skip validation for other campaign types
        return false;
    }

    /**
     * Validate cross-sell campaign impression
     *
     * @param string $display_location Display location
     * @param array $product_ids Product IDs
     * @return bool True if valid
     */
    private static function upspr_validate_cross_sell_impression( $display_location, $product_ids ) {
        // Cross-sell campaigns are only valid on cart and checkout pages
        $valid_locations = array( 'cart-page', 'checkout-page' );

        if ( ! in_array( $display_location, $valid_locations, true ) ) {
            return false;
        }

        // Must have at least 1 product
        if ( count( $product_ids ) < 1 ) {
            return false;
        }

        // Check if we're actually on the correct page type
        if ( $display_location === 'cart-page' && ! is_cart() ) {
            return false;
        }

        if ( $display_location === 'checkout-page' && ! is_checkout() ) {
            return false;
        }

        // For cart/checkout pages, cart must have items
        if ( function_exists( 'WC' ) && WC()->cart ) {
            if ( WC()->cart->get_cart_contents_count() === 0 ) {
                return false;
            }
        }

        return true;
    }

    /**
     * Track click for a campaign
     *
     * @param int $campaign_id Campaign ID
     * @param int $product_id Product ID that was clicked
     * @param string $campaign_type Campaign type (cross-sell, upsell, etc.)
     * @return bool Success status
     */
    public static function upspr_track_click( $campaign_id, $product_id = null, $campaign_type = 'cross-sell' ) {
        if ( empty( $campaign_id ) ) {
            return false;
        }

        // Only track clicks for cross-sell campaigns for now
        if ( $campaign_type !== 'cross-sell' ) {
            return false;
        }

        // Get current performance data
        $performance = self::upspr_get_campaign_performance( $campaign_id );

        // Increment clicks
        $performance['clicks'] = isset( $performance['clicks'] ) ? intval($performance['clicks']) + 1 : 1;

        // Update last click timestamp
        $performance['last_click'] = current_time( 'mysql' );

        // Track which product was clicked
        if ( ! empty( $product_id ) ) {
            if ( ! isset( $performance['product_clicks'] ) ) {
                $performance['product_clicks'] = array();
            }

            if ( ! isset( $performance['product_clicks'][ $product_id ] ) ) {
                $performance['product_clicks'][ $product_id ] = 0;
            }
            $performance['product_clicks'][ $product_id ]++;
        }

        return self::upspr_update_campaign_performance( $campaign_id, $performance );
    }

    /**
     * Track conversion for a campaign
     *
     * @param int $campaign_id Campaign ID
     * @param int $product_id Product ID that was purchased
     * @param float $revenue Revenue generated from this conversion
     * @param string $campaign_type Campaign type (cross-sell, upsell, etc.)
     * @return bool Success status
     */
    public static function upspr_track_conversion( $campaign_id, $product_id = null, $revenue = 0, $campaign_type = 'cross-sell' ) {
        if ( empty( $campaign_id ) ) {
            return false;
        }

        // Only track conversions for cross-sell campaigns for now
        if ( $campaign_type !== 'cross-sell' ) {
            return false;
        }

        // Get current performance data
        $performance = self::upspr_get_campaign_performance( $campaign_id );

        // Increment conversions
        $performance['conversions'] = isset( $performance['conversions'] ) ? $performance['conversions'] + 1 : 1;

        // Add revenue
        $performance['revenue'] = isset( $performance['revenue'] ) ? $performance['revenue'] + $revenue : $revenue;

        // Update last conversion timestamp
        $performance['last_conversion'] = current_time( 'mysql' );

        // Track which product was converted
        if ( ! empty( $product_id ) ) {
            if ( ! isset( $performance['product_conversions'] ) ) {
                $performance['product_conversions'] = array();
            }

            if ( ! isset( $performance['product_conversions'][ $product_id ] ) ) {
                $performance['product_conversions'][ $product_id ] = array(
                    'count' => 0,
                    'revenue' => 0
                );
            }

            $performance['product_conversions'][ $product_id ]['count']++;
            $performance['product_conversions'][ $product_id ]['revenue'] += $revenue;
        }

        return self::upspr_update_campaign_performance( $campaign_id, $performance );
    }

    /**
     * Get campaign data for validation
     *
     * @param int $campaign_id Campaign ID
     * @return array|false Campaign data or false if not found
     */
    public static function upspr_get_campaign_data( $campaign_id ) {
        global $wpdb;

        $table_name = $wpdb->prefix . 'upspr_recommendation_campaigns';

        $campaign = $wpdb->get_row( $wpdb->prepare(
            "SELECT * FROM {$table_name} WHERE id = %d AND status = 'active'",
            $campaign_id
        ), ARRAY_A );

        if ( ! $campaign ) {
            return false;
        }

        // Decode JSON fields
        $campaign['basic_info'] = json_decode( $campaign['basic_info'], true );
        $campaign['filters'] = json_decode( $campaign['filters'], true );
        $campaign['amplifiers'] = json_decode( $campaign['amplifiers'], true );
        $campaign['personalization'] = json_decode( $campaign['personalization'], true );
        $campaign['visibility'] = json_decode( $campaign['visibility'], true );

        return $campaign;
    }

    /**
     * Get campaign performance data
     *
     * @param int $campaign_id Campaign ID
     * @return array Performance data
     */
    public static function upspr_get_campaign_performance( $campaign_id ) {
        global $wpdb;

        $table_name = $wpdb->prefix . 'upspr_recommendation_campaigns';

        $performance_data = $wpdb->get_var( $wpdb->prepare(
            "SELECT performance_data FROM {$table_name} WHERE id = %d",
            $campaign_id
        ) );

        if ( empty( $performance_data ) ) {
            return array(
                'impressions' => 0,
                'clicks' => 0,
                'conversions' => 0,
                'revenue' => 0
            );
        }
        $decoded = json_decode( $performance_data, true );
        return is_array( $decoded ) ? $decoded : array(
            'impressions' => 0,
            'clicks' => 0,
            'conversions' => 0,
            'revenue' => 0
        );
    }

    /**
     * Update campaign performance data
     *
     * @param int $campaign_id Campaign ID
     * @param array $performance Performance data
     * @return bool Success status
     */
    public static function upspr_update_campaign_performance( $campaign_id, $performance ) {
        global $wpdb;

        $table_name = $wpdb->prefix . 'upspr_recommendation_campaigns';

        $result = $wpdb->update(
            $table_name,
            array(
                'performance_data' => wp_json_encode( $performance ),
                'updated_at' => current_time( 'mysql' )
            ),
            array( 'id' => $campaign_id ),
            array( '%s', '%s' ),
            array( '%d' )
        );

        return $result !== false;
    }

    /**
     * Calculate click-through rate (CTR)
     *
     * @param array $performance Performance data
     * @return float CTR percentage
     */
    public static function upspr_calculate_ctr( $performance ) {
        $impressions = isset( $performance['impressions'] ) ? $performance['impressions'] : 0;
        $clicks = isset( $performance['clicks'] ) ? $performance['clicks'] : 0;

        if ( $impressions === 0 ) {
            return 0;
        }

        return ( $clicks / $impressions ) * 100;
    }

    /**
     * Calculate conversion rate
     *
     * @param array $performance Performance data
     * @return float Conversion rate percentage
     */
    public static function upspr_calculate_conversion_rate( $performance ) {
        $clicks = isset( $performance['clicks'] ) ? $performance['clicks'] : 0;
        $conversions = isset( $performance['conversions'] ) ? $performance['conversions'] : 0;

        if ( $clicks === 0 ) {
            return 0;
        }

        return ( $conversions / $clicks ) * 100;
    }

    /**
     * Calculate average order value (AOV)
     *
     * @param array $performance Performance data
     * @return float Average order value
     */
    public static function upspr_calculate_aov( $performance ) {
        $conversions = isset( $performance['conversions'] ) ? $performance['conversions'] : 0;
        $revenue = isset( $performance['revenue'] ) ? $performance['revenue'] : 0;

        if ( $conversions === 0 ) {
            return 0;
        }

        return $revenue / $conversions;
    }

    /**
     * Get performance summary for a campaign
     *
     * @param int $campaign_id Campaign ID
     * @return array Performance summary
     */
    public static function upspr_get_performance_summary( $campaign_id ) {
        $performance = self::upspr_get_campaign_performance( $campaign_id );
        return array(
            'impressions' =>     $performance['impressions'],
            'clicks' =>          $performance['clicks'],
            'conversions' =>     $performance['conversions'],
            'revenue' =>         $performance['revenue'],
            'ctr' =>             self::upspr_calculate_ctr( $performance ),
            'conversion_rate' => self::upspr_calculate_conversion_rate( $performance ),
            'aov' =>             self::upspr_calculate_aov( $performance )
        );
    }

    /**
     * Reset campaign performance data
     *
     * @param int $campaign_id Campaign ID
     * @return bool Success status
     */
    public static function upspr_reset_campaign_performance( $campaign_id ) {
        $reset_data = array(
            'impressions' => 0,
            'clicks' => 0,
            'conversions' => 0,
            'revenue' => 0
        );

        return self::upspr_update_campaign_performance( $campaign_id, $reset_data );
    }

    /**
     * Track campaign performance via AJAX (for frontend tracking)
     */
    public static function upspr_init_ajax_tracking() {
        add_action( 'wp_ajax_upspr_track_impression', array( __CLASS__, 'upspr_ajax_track_impression' ) );
        add_action( 'wp_ajax_nopriv_upspr_track_impression', array( __CLASS__, 'upspr_ajax_track_impression' ) );

        add_action( 'wp_ajax_upspr_track_click', array( __CLASS__, 'upspr_ajax_track_click' ) );
        add_action( 'wp_ajax_nopriv_upspr_track_click', array( __CLASS__, 'upspr_ajax_track_click' ) );
    }

    /**
     * AJAX handler for tracking impressions
     */
    public static function upspr_ajax_track_impression() {
        check_ajax_referer( 'upspr_tracking_nonce', 'nonce' );

        $campaign_id = intval( $_POST['campaign_id'] );
        $product_ids = isset( $_POST['product_ids'] ) ? array_map( 'intval', $_POST['product_ids'] ) : array();

        $result = self::upspr_track_impression( $campaign_id, $product_ids );

        wp_send_json_success( array( 'tracked' => $result ) );
    }

    /**
     * AJAX handler for tracking clicks
     */
    public static function upspr_ajax_track_click() {
        check_ajax_referer( 'upspr_tracking_nonce', 'nonce' );

        $campaign_id = intval( $_POST['campaign_id'] );
        $product_id = isset( $_POST['product_id'] ) ? intval( $_POST['product_id'] ) : null;
        $campaign_type = isset( $_POST['campaign_type'] ) ? sanitize_text_field( $_POST['campaign_type'] ) : 'cross-sell';

        $result = self::upspr_track_click( $campaign_id, $product_id, $campaign_type );

        wp_send_json_success( array( 'tracked' => $result ) );
    }
}
