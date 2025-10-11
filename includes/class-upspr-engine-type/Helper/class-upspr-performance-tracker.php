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
            // echo '$product_ids<pre>'; print_r($product_ids); echo '</pre>';
            // echo '$campaign_data<pre>'; print_r($campaign_data); echo '</pre>';
            if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
                error_log( 'UPSPR: Impression validation failed for campaign ' . $campaign_id . ' (Type: ' . ($campaign_data['type'] ?? 'unknown') . ')' );
            }
            // echo '<pre>'; print_r('upspr_track_impression hdmd'); echo '</pre>';

            return false;
        }

        // Track in analytics table for date-based filtering
        $success = self::upspr_insert_analytics_event( $campaign_id, 'impression', null, 0 );

        // Update summary performance data
        $performance = self::upspr_get_campaign_performance( $campaign_id );
        $performance['impressions'] = isset( $performance['impressions'] ) ? $performance['impressions'] + 1 : 1;
        self::upspr_update_campaign_performance( $campaign_id, $performance );
        return $success;
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

        // Validate based on campaign type
        switch ( $campaign_type ) {
            case 'cross-sell':
                return self::upspr_validate_cross_sell_impression( $display_location, $product_ids );

            case 'upsell':
                return self::upspr_validate_upsell_impression( $display_location, $product_ids );

            // Add more campaign types here as needed
            default:
                // For other campaign types, use basic validation
                return ! empty( $product_ids );
        }
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
     * Validate upsell campaign impression
     *
     * @param string $display_location Display location
     * @param array $product_ids Product IDs
     * @return bool True if valid
     */
    private static function upspr_validate_upsell_impression( $display_location, $product_ids ) {
        // Upsell campaigns are valid on product, cart, and checkout pages
        $valid_locations = array( 'product-page', 'cart-page', 'checkout-page' );

        if ( ! in_array( $display_location, $valid_locations, true ) ) {
            return false;
        }

        // Must have at least 1 product
        if ( count( $product_ids ) < 1 ) {
            return false;
        }

        // Check if we're actually on the correct page type
        if ( $display_location === 'product-page' && ! is_product() ) {
            return false;
        }

        if ( $display_location === 'cart-page' && ! is_cart() ) {
            return false;
        }

        if ( $display_location === 'checkout-page' && ! is_checkout() ) {
            return false;
        }

        // For product page, we need a valid product
        if ( $display_location === 'product-page' ) {
            global $product, $post;

            // Check if we have a valid product
            if ( ! is_object( $product ) || ! is_a( $product, 'WC_Product' ) ) {
                // Try to get product from post
                if ( is_object( $post ) && $post->post_type === 'product' ) {
                    $product = wc_get_product( $post->ID );
                    if ( ! is_object( $product ) || ! is_a( $product, 'WC_Product' ) ) {
                        return false;
                    }
                } else {
                    return false;
                }
            }
        }

        // For cart/checkout pages, cart must have items
        if ( in_array( $display_location, array( 'cart-page', 'checkout-page' ), true ) ) {
            if ( function_exists( 'WC' ) && WC()->cart ) {
                if ( WC()->cart->get_cart_contents_count() === 0 ) {
                    return false;
                }
            } else {
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

        // Track in analytics table for date-based filtering
        $success = self::upspr_insert_analytics_event( $campaign_id, 'click', $product_id, 0 );

        // Update summary performance data
        $performance = self::upspr_get_campaign_performance( $campaign_id );
        $performance['clicks'] = isset( $performance['clicks'] ) ? intval($performance['clicks']) + 1 : 1;

        // Track product-level clicks for detailed reporting
        if ( ! empty( $product_id ) ) {
            if ( ! isset( $performance['product_clicks'] ) ) {
                $performance['product_clicks'] = array();
            }
            if ( ! isset( $performance['product_clicks'][ $product_id ] ) ) {
                $performance['product_clicks'][ $product_id ] = 0;
            }
            $performance['product_clicks'][ $product_id ]++;
        }

        self::upspr_update_campaign_performance( $campaign_id, $performance );

        return $success;
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

        // Track in analytics table for date-based filtering
        $success = self::upspr_insert_analytics_event( $campaign_id, 'conversion', $product_id, $revenue );

        // Update summary performance data
        $performance = self::upspr_get_campaign_performance( $campaign_id );
        $performance['conversions'] = isset( $performance['conversions'] ) ? $performance['conversions'] + 1 : 1;
        $performance['revenue'] = isset( $performance['revenue'] ) ? $performance['revenue'] + $revenue : $revenue;

        // Track product-level conversions for detailed reporting
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

        self::upspr_update_campaign_performance( $campaign_id, $performance );

        return $success;
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

    /**
     * Insert analytics event into the analytics table
     *
     * @param int $campaign_id Campaign ID
     * @param string $event_type Event type (impression, click, conversion)
     * @param int|null $product_id Product ID (optional)
     * @param float $revenue Revenue amount (for conversions)
     * @return bool Success status
     */
    private static function upspr_insert_analytics_event( $campaign_id, $event_type, $product_id = null, $revenue = 0 ) {
        global $wpdb;

        $analytics_table = $wpdb->prefix . 'upspr_analytics';
        $current_datetime = current_time( 'mysql' );
        $current_date = current_time( 'Y-m-d' );

        $result = $wpdb->insert(
            $analytics_table,
            array(
                'campaign_id' => $campaign_id,
                'event_type' => $event_type,
                'product_id' => $product_id,
                'revenue' => $revenue,
                'event_date' => $current_date,
                'event_datetime' => $current_datetime
            ),
            array( '%d', '%s', '%d', '%f', '%s', '%s' )
        );

        return $result !== false;
    }

    /**
     * Get analytics data for a campaign within a date range
     *
     * @param int $campaign_id Campaign ID
     * @param string $start_date Start date (Y-m-d format)
     * @param string $end_date End date (Y-m-d format)
     * @return array Analytics data grouped by date
     */
    public static function upspr_get_analytics_by_date_range( $campaign_id, $start_date = null, $end_date = null ) {
        global $wpdb;

        $analytics_table = $wpdb->prefix . 'upspr_analytics';

        // Default to last 30 days if no dates provided
        if ( empty( $start_date ) ) {
            $start_date = date( 'Y-m-d', strtotime( '-30 days' ) );
        }
        if ( empty( $end_date ) ) {
            $end_date = current_time( 'Y-m-d' );
        }

        $query = $wpdb->prepare(
            "SELECT
                event_date,
                event_type,
                COUNT(*) as count,
                SUM(revenue) as total_revenue
            FROM {$analytics_table}
            WHERE campaign_id = %d
            AND event_date BETWEEN %s AND %s
            GROUP BY event_date, event_type
            ORDER BY event_date ASC",
            $campaign_id,
            $start_date,
            $end_date
        );

        $results = $wpdb->get_results( $query, ARRAY_A );

        // Format the data for easier consumption
        $formatted_data = array();
        foreach ( $results as $row ) {
            $date = $row['event_date'];
            if ( ! isset( $formatted_data[ $date ] ) ) {
                $formatted_data[ $date ] = array(
                    'date' => $date,
                    'impressions' => 0,
                    'clicks' => 0,
                    'conversions' => 0,
                    'revenue' => 0
                );
            }

            $formatted_data[ $date ][ $row['event_type'] . 's' ] = intval( $row['count'] );
            if ( $row['event_type'] === 'conversion' ) {
                $formatted_data[ $date ]['revenue'] = floatval( $row['total_revenue'] );
            }
        }

        return array_values( $formatted_data );
    }

    /**
     * Get performance summary for a campaign with optional date range
     *
     * @param int $campaign_id Campaign ID
     * @param string $start_date Start date (Y-m-d format, optional)
     * @param string $end_date End date (Y-m-d format, optional)
     * @return array Performance summary
     */
    public static function upspr_get_performance_summary_by_date( $campaign_id, $start_date = null, $end_date = null ) {
        global $wpdb;

        $analytics_table = $wpdb->prefix . 'upspr_analytics';

        // Build date filter
        $date_filter = '';
        $params = array( $campaign_id );

        if ( ! empty( $start_date ) && ! empty( $end_date ) ) {
            $date_filter = 'AND event_date BETWEEN %s AND %s';
            $params[] = $start_date;
            $params[] = $end_date;
        }

        $query = $wpdb->prepare(
            "SELECT
                event_type,
                COUNT(*) as count,
                SUM(revenue) as total_revenue
            FROM {$analytics_table}
            WHERE campaign_id = %d
            {$date_filter}
            GROUP BY event_type",
            $params
        );

        $results = $wpdb->get_results( $query, ARRAY_A );

        // Initialize summary
        $summary = array(
            'impressions' => 0,
            'clicks' => 0,
            'conversions' => 0,
            'revenue' => 0,
            'ctr' => 0,
            'conversion_rate' => 0,
            'aov' => 0
        );

        // Populate from results
        foreach ( $results as $row ) {
            $type = $row['event_type'];
            $summary[ $type . 's' ] = intval( $row['count'] );
            if ( $type === 'conversion' ) {
                $summary['revenue'] = floatval( $row['total_revenue'] );
            }
        }

        // Calculate metrics
        if ( $summary['impressions'] > 0 ) {
            $summary['ctr'] = ( $summary['clicks'] / $summary['impressions'] ) * 100;
        }
        if ( $summary['clicks'] > 0 ) {
            $summary['conversion_rate'] = ( $summary['conversions'] / $summary['clicks'] ) * 100;
        }
        if ( $summary['conversions'] > 0 ) {
            $summary['aov'] = $summary['revenue'] / $summary['conversions'];
        }

        return $summary;
    }

    /**
     * Get product-level performance for a campaign with optional date range
     *
     * @param int $campaign_id Campaign ID
     * @param string $start_date Start date (Y-m-d format, optional)
     * @param string $end_date End date (Y-m-d format, optional)
     * @return array Product performance data
     */
    public static function upspr_get_product_performance_by_date( $campaign_id, $start_date = null, $end_date = null ) {
        global $wpdb;

        $analytics_table = $wpdb->prefix . 'upspr_analytics';

        // Build date filter
        $date_filter = '';
        $params = array( $campaign_id );

        if ( ! empty( $start_date ) && ! empty( $end_date ) ) {
            $date_filter = 'AND event_date BETWEEN %s AND %s';
            $params[] = $start_date;
            $params[] = $end_date;
        }

        $query = $wpdb->prepare(
            "SELECT
                product_id,
                event_type,
                COUNT(*) as count,
                SUM(revenue) as total_revenue
            FROM {$analytics_table}
            WHERE campaign_id = %d
            AND product_id IS NOT NULL
            {$date_filter}
            GROUP BY product_id, event_type
            ORDER BY product_id ASC",
            $params
        );

        $results = $wpdb->get_results( $query, ARRAY_A );

        // Format the data
        $product_data = array();
        foreach ( $results as $row ) {
            $product_id = $row['product_id'];
            if ( ! isset( $product_data[ $product_id ] ) ) {
                $product_data[ $product_id ] = array(
                    'product_id' => $product_id,
                    'clicks' => 0,
                    'conversions' => 0,
                    'revenue' => 0
                );
            }

            if ( $row['event_type'] === 'click' ) {
                $product_data[ $product_id ]['clicks'] = intval( $row['count'] );
            } elseif ( $row['event_type'] === 'conversion' ) {
                $product_data[ $product_id ]['conversions'] = intval( $row['count'] );
                $product_data[ $product_id ]['revenue'] = floatval( $row['total_revenue'] );
            }
        }

        return array_values( $product_data );
    }
}
