<?php
/**
 * Performance Tracker Helper - Track campaign performance metrics
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class UPSPR_Performance_Tracker {

    /**
     * Track impression for a campaign
     *
     * @param int $campaign_id Campaign ID
     * @param array $product_ids Array of product IDs that were shown
     * @return bool Success status
     */
    public static function track_impression( $campaign_id, $product_ids = array() ) {
        if ( empty( $campaign_id ) ) {
            return false;
        }

        // Get current performance data
        $performance = self::get_campaign_performance( $campaign_id );
        
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

        return self::update_campaign_performance( $campaign_id, $performance );
    }

    /**
     * Track click for a campaign
     *
     * @param int $campaign_id Campaign ID
     * @param int $product_id Product ID that was clicked
     * @return bool Success status
     */
    public static function track_click( $campaign_id, $product_id = null ) {
        if ( empty( $campaign_id ) ) {
            return false;
        }

        // Get current performance data
        $performance = self::get_campaign_performance( $campaign_id );
        
        // Increment clicks
        $performance['clicks'] = isset( $performance['clicks'] ) ? $performance['clicks'] + 1 : 1;
        
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

        return self::update_campaign_performance( $campaign_id, $performance );
    }

    /**
     * Track conversion for a campaign
     *
     * @param int $campaign_id Campaign ID
     * @param int $product_id Product ID that was purchased
     * @param float $revenue Revenue generated from this conversion
     * @return bool Success status
     */
    public static function track_conversion( $campaign_id, $product_id = null, $revenue = 0 ) {
        if ( empty( $campaign_id ) ) {
            return false;
        }

        // Get current performance data
        $performance = self::get_campaign_performance( $campaign_id );
        
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

        return self::update_campaign_performance( $campaign_id, $performance );
    }

    /**
     * Get campaign performance data
     *
     * @param int $campaign_id Campaign ID
     * @return array Performance data
     */
    public static function get_campaign_performance( $campaign_id ) {
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
    public static function update_campaign_performance( $campaign_id, $performance ) {
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
    public static function calculate_ctr( $performance ) {
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
    public static function calculate_conversion_rate( $performance ) {
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
    public static function calculate_aov( $performance ) {
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
    public static function get_performance_summary( $campaign_id ) {
        $performance = self::get_campaign_performance( $campaign_id );
        
        return array(
            'impressions' => $performance['impressions'],
            'clicks' => $performance['clicks'],
            'conversions' => $performance['conversions'],
            'revenue' => $performance['revenue'],
            'ctr' => self::calculate_ctr( $performance ),
            'conversion_rate' => self::calculate_conversion_rate( $performance ),
            'aov' => self::calculate_aov( $performance )
        );
    }

    /**
     * Reset campaign performance data
     *
     * @param int $campaign_id Campaign ID
     * @return bool Success status
     */
    public static function reset_campaign_performance( $campaign_id ) {
        $reset_data = array(
            'impressions' => 0,
            'clicks' => 0,
            'conversions' => 0,
            'revenue' => 0
        );
        
        return self::update_campaign_performance( $campaign_id, $reset_data );
    }

    /**
     * Track campaign performance via AJAX (for frontend tracking)
     */
    public static function init_ajax_tracking() {
        add_action( 'wp_ajax_upspr_track_impression', array( __CLASS__, 'ajax_track_impression' ) );
        add_action( 'wp_ajax_nopriv_upspr_track_impression', array( __CLASS__, 'ajax_track_impression' ) );
        
        add_action( 'wp_ajax_upspr_track_click', array( __CLASS__, 'ajax_track_click' ) );
        add_action( 'wp_ajax_nopriv_upspr_track_click', array( __CLASS__, 'ajax_track_click' ) );
    }

    /**
     * AJAX handler for tracking impressions
     */
    public static function ajax_track_impression() {
        check_ajax_referer( 'upspr_tracking_nonce', 'nonce' );
        
        $campaign_id = intval( $_POST['campaign_id'] );
        $product_ids = isset( $_POST['product_ids'] ) ? array_map( 'intval', $_POST['product_ids'] ) : array();
        
        $result = self::track_impression( $campaign_id, $product_ids );
        
        wp_send_json_success( array( 'tracked' => $result ) );
    }

    /**
     * AJAX handler for tracking clicks
     */
    public static function ajax_track_click() {
        check_ajax_referer( 'upspr_tracking_nonce', 'nonce' );
        
        $campaign_id = intval( $_POST['campaign_id'] );
        $product_id = isset( $_POST['product_id'] ) ? intval( $_POST['product_id'] ) : null;
        
        $result = self::track_click( $campaign_id, $product_id );
        
        wp_send_json_success( array( 'tracked' => $result ) );
    }
}
