<?php
/**
 * Amplifier Helper - Apply amplification rules to boost product recommendations
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class UPSPR_Amplifier {

    /**
     * Apply sales performance boost
     *
     * @param array $product_ids Array of product IDs to amplify
     * @param array $amplifier_config Amplifier configuration
     * @return array Product IDs with boost scores
     */
    public static function apply_sales_performance_boost( $product_ids, $amplifier_config ) {
        if ( empty( $product_ids ) || ! isset( $amplifier_config['salesPerformanceBoost'] ) || ! $amplifier_config['salesPerformanceBoost'] ) {
            return array_combine( $product_ids, array_fill( 0, count( $product_ids ), 1.0 ) );
        }

        $boost_factor = isset( $amplifier_config['salesBoostFactor'] ) ? $amplifier_config['salesBoostFactor'] : 'medium';
        $time_period = isset( $amplifier_config['salesTimePeriod'] ) ? $amplifier_config['salesTimePeriod'] : 'last-30-days';

        $days = self::get_days_from_period( $time_period );
        $multiplier = self::get_boost_multiplier( $boost_factor );

        // Get sales data for products
        $sales_data = self::get_product_sales_data( $product_ids, $days );

        $scores = array();
        $max_sales = max( array_values( $sales_data ) );
        
        if ( $max_sales === 0 ) {
            return array_combine( $product_ids, array_fill( 0, count( $product_ids ), 1.0 ) );
        }

        foreach ( $product_ids as $product_id ) {
            $sales_count = isset( $sales_data[ $product_id ] ) ? $sales_data[ $product_id ] : 0;
            $normalized_score = $sales_count / $max_sales;
            $boost_score = 1.0 + ( $normalized_score * $multiplier );
            $scores[ $product_id ] = $boost_score;
        }

        return $scores;
    }

    /**
     * Apply inventory level boost
     *
     * @param array $product_ids Array of product IDs to amplify
     * @param array $amplifier_config Amplifier configuration
     * @return array Product IDs with boost scores
     */
    public static function apply_inventory_level_boost( $product_ids, $amplifier_config ) {
        if ( empty( $product_ids ) || ! isset( $amplifier_config['inventoryLevelBoost'] ) || ! $amplifier_config['inventoryLevelBoost'] ) {
            return array_combine( $product_ids, array_fill( 0, count( $product_ids ), 1.0 ) );
        }

        $boost_type = isset( $amplifier_config['inventoryBoostType'] ) ? $amplifier_config['inventoryBoostType'] : 'low-stock';
        $threshold = isset( $amplifier_config['inventoryThreshold'] ) ? intval( $amplifier_config['inventoryThreshold'] ) : 10;

        $scores = array();

        foreach ( $product_ids as $product_id ) {
            $product = wc_get_product( $product_id );
            
            if ( ! $product ) {
                $scores[ $product_id ] = 1.0;
                continue;
            }

            $stock_quantity = $product->get_stock_quantity();
            $score = 1.0;

            switch ( $boost_type ) {
                case 'low-stock':
                    // Boost products with low stock to move them faster
                    if ( $stock_quantity !== null && $stock_quantity <= $threshold && $stock_quantity > 0 ) {
                        $score = 1.5; // 50% boost for low stock items
                    }
                    break;

                case 'high-stock':
                    // Boost products with high stock
                    if ( $stock_quantity !== null && $stock_quantity > $threshold ) {
                        $score = 1.3; // 30% boost for high stock items
                    }
                    break;

                case 'out-of-stock':
                    // Reduce score for out of stock items
                    if ( ! $product->is_in_stock() ) {
                        $score = 0.1; // Heavily reduce out of stock items
                    }
                    break;
            }

            $scores[ $product_id ] = $score;
        }

        return $scores;
    }

    /**
     * Apply seasonal trending boost
     *
     * @param array $product_ids Array of product IDs to amplify
     * @param array $amplifier_config Amplifier configuration
     * @return array Product IDs with boost scores
     */
    public static function apply_seasonal_trending_boost( $product_ids, $amplifier_config ) {
        if ( empty( $product_ids ) || ! isset( $amplifier_config['seasonalTrendingBoost'] ) || ! $amplifier_config['seasonalTrendingBoost'] ) {
            return array_combine( $product_ids, array_fill( 0, count( $product_ids ), 1.0 ) );
        }

        $trending_keywords = isset( $amplifier_config['trendingKeywords'] ) ? $amplifier_config['trendingKeywords'] : array();
        $trending_duration = isset( $amplifier_config['trendingDuration'] ) ? intval( $amplifier_config['trendingDuration'] ) : 30;

        if ( empty( $trending_keywords ) ) {
            return array_combine( $product_ids, array_fill( 0, count( $product_ids ), 1.0 ) );
        }

        // Get sales data for the trending duration to identify actually trending products
        $trending_sales_data = self::get_product_sales_data( $product_ids, $trending_duration );
        $max_trending_sales = max( array_values( $trending_sales_data ) );

        // Debug log for trending sales data
        if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
            error_log( 'UPSPR Trending Sales Data: ' . wp_json_encode( array(
                'trending_duration' => $trending_duration,
                'max_trending_sales' => $max_trending_sales,
                'sales_data' => $trending_sales_data
            ) ) );
        }

        $scores = array();

        foreach ( $product_ids as $product_id ) {
            $score = 1.0;
            
            // Get product data
            $product_title = get_the_title( $product_id );
            $product_content = get_post_field( 'post_content', $product_id );
            $product_excerpt = get_post_field( 'post_excerpt', $product_id );
            
            // Get product categories and tags
            $categories = wp_get_post_terms( $product_id, 'product_cat', array( 'fields' => 'names' ) );
            $tags = wp_get_post_terms( $product_id, 'product_tag', array( 'fields' => 'names' ) );
            
            $searchable_content = strtolower( $product_title . ' ' . $product_content . ' ' . $product_excerpt );
            
            if ( ! is_wp_error( $categories ) ) {
                $searchable_content .= ' ' . strtolower( implode( ' ', $categories ) );
            }
            
            if ( ! is_wp_error( $tags ) ) {
                $searchable_content .= ' ' . strtolower( implode( ' ', $tags ) );
            }

            // Check for trending keywords
            $keyword_matches = 0;
            foreach ( $trending_keywords as $keyword ) {
                if ( stripos( $searchable_content, strtolower( $keyword ) ) !== false ) {
                    $keyword_matches++;
                }
            }

            if ( $keyword_matches > 0 ) {
                // Base boost for keyword matches
                $keyword_boost = min( $keyword_matches * 0.2, 0.6 ); // Max 60% boost from keywords
                
                // Additional boost based on actual sales performance during trending period
                $sales_boost = 0;
                if ( $max_trending_sales > 0 ) {
                    $product_sales = isset( $trending_sales_data[ $product_id ] ) ? $trending_sales_data[ $product_id ] : 0;
                    $sales_performance = $product_sales / $max_trending_sales;
                    $sales_boost = $sales_performance * 0.4; // Up to 40% additional boost for high sales
                }
                
                // Combine keyword relevance with actual trending performance
                $total_boost = $keyword_boost + $sales_boost;
                $score = 1.0 + min( $total_boost, 1.0 ); // Cap at 100% total boost
            }

            $scores[ $product_id ] = $score;
        }

        return $scores;
    }

    /**
     * Apply margin-based boost
     *
     * @param array $product_ids Array of product IDs to amplify
     * @param float $margin_threshold Minimum margin percentage to boost
     * @return array Product IDs with boost scores
     */
    public static function apply_margin_boost( $product_ids, $margin_threshold = 30.0 ) {
        if ( empty( $product_ids ) ) {
            return array_combine( $product_ids, array_fill( 0, count( $product_ids ), 1.0 ) );
        }

        $scores = array();

        foreach ( $product_ids as $product_id ) {
            $product = wc_get_product( $product_id );
            
            if ( ! $product ) {
                $scores[ $product_id ] = 1.0;
                continue;
            }

            $regular_price = (float) $product->get_regular_price();
            $cost_price = (float) get_post_meta( $product_id, '_cost_price', true ); // Assuming cost is stored in meta
            
            $score = 1.0;

            if ( $regular_price > 0 && $cost_price > 0 ) {
                $margin_percentage = ( ( $regular_price - $cost_price ) / $regular_price ) * 100;
                
                if ( $margin_percentage >= $margin_threshold ) {
                    // Boost high-margin products
                    $boost_factor = min( ( $margin_percentage - $margin_threshold ) / 100, 0.5 ); // Max 50% boost
                    $score = 1.0 + $boost_factor;
                }
            }

            $scores[ $product_id ] = $score;
        }

        return $scores;
    }

    /**
     * Apply rating-based boost
     *
     * @param array $product_ids Array of product IDs to amplify
     * @param float $min_rating Minimum rating to boost
     * @return array Product IDs with boost scores
     */
    public static function apply_rating_boost( $product_ids, $min_rating = 4.0 ) {
        if ( empty( $product_ids ) ) {
            return array_combine( $product_ids, array_fill( 0, count( $product_ids ), 1.0 ) );
        }

        $scores = array();

        foreach ( $product_ids as $product_id ) {
            $product = wc_get_product( $product_id );
            
            if ( ! $product ) {
                $scores[ $product_id ] = 1.0;
                continue;
            }

            $average_rating = (float) $product->get_average_rating();
            $review_count = $product->get_review_count();
            
            $score = 1.0;

            if ( $average_rating >= $min_rating && $review_count >= 5 ) {
                // Boost highly rated products with sufficient reviews
                $rating_boost = ( $average_rating - $min_rating ) * 0.2; // 20% boost per rating point above minimum
                $review_boost = min( $review_count / 50, 0.3 ); // Up to 30% boost based on review count
                $score = 1.0 + $rating_boost + $review_boost;
            }

            $scores[ $product_id ] = $score;
        }

        return $scores;
    }

    /**
     * Apply new product boost
     *
     * @param array $product_ids Array of product IDs to amplify
     * @param int $new_product_days Number of days to consider a product "new"
     * @return array Product IDs with boost scores
     */
    public static function apply_new_product_boost( $product_ids, $new_product_days = 30 ) {
        if ( empty( $product_ids ) ) {
            return array_combine( $product_ids, array_fill( 0, count( $product_ids ), 1.0 ) );
        }

        $scores = array();
        $cutoff_date = time() - ( $new_product_days * DAY_IN_SECONDS );

        foreach ( $product_ids as $product_id ) {
            $product_date = get_post_time( 'U', false, $product_id );
            
            $score = 1.0;

            if ( $product_date > $cutoff_date ) {
                // Boost new products
                $days_old = ( time() - $product_date ) / DAY_IN_SECONDS;
                $newness_factor = 1 - ( $days_old / $new_product_days ); // More boost for newer products
                $score = 1.0 + ( $newness_factor * 0.4 ); // Up to 40% boost for brand new products
            }

            $scores[ $product_id ] = $score;
        }

        return $scores;
    }

    /**
     * Get product sales data for a time period
     *
     * @param array $product_ids Array of product IDs
     * @param int $days Number of days to look back
     * @return array Product ID => sales count mapping
     */
    private static function get_product_sales_data( $product_ids, $days ) {
        global $wpdb;

        if ( empty( $product_ids ) ) {
            return array();
        }

        $product_ids_str = implode( ',', array_map( 'intval', $product_ids ) );
        
        // Calculate start date - add buffer to include today's orders
        $lookback_days = max( 1, $days ); // Ensure at least 1 day
        $start_timestamp = time() - ( $lookback_days * DAY_IN_SECONDS );
        $start_date = date( 'Y-m-d 00:00:00', $start_timestamp );
        
        // Current time for upper bound
        $current_date = date( 'Y-m-d H:i:s' );

        // Enhanced query with more order statuses and better date handling
        $query = "
            SELECT 
                oim.meta_value as product_id,
                SUM(CAST(oim2.meta_value AS UNSIGNED)) as total_sales,
                COUNT(DISTINCT oi.order_id) as order_count,
                MAX(p.post_date) as latest_order_date
            FROM {$wpdb->prefix}woocommerce_order_items oi
            INNER JOIN {$wpdb->prefix}woocommerce_order_itemmeta oim ON oi.order_item_id = oim.order_item_id
            INNER JOIN {$wpdb->prefix}woocommerce_order_itemmeta oim2 ON oi.order_item_id = oim2.order_item_id
            INNER JOIN {$wpdb->posts} p ON oi.order_id = p.ID
            WHERE oim.meta_key = '_product_id'
            AND oim2.meta_key = '_qty'
            AND oim.meta_value IN ({$product_ids_str})
            AND p.post_type = 'shop_order'
            AND p.post_status IN ('wc-completed', 'wc-processing', 'wc-on-hold', 'wc-pending')
            AND p.post_date >= %s
            AND p.post_date <= %s
            GROUP BY oim.meta_value
        ";

        $results = $wpdb->get_results( $wpdb->prepare( $query, $start_date, $current_date ) );
        // Debug logging when WP_DEBUG is enabled
        if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
            error_log( 'UPSPR Sales Data Query Debug: ' . wp_json_encode( array(
                'product_ids' => $product_ids,
                'days' => $days,
                'start_date' => $start_date,
                'current_date' => $current_date,
                'query_results_count' => count( $results ),
                'prepared_query' => $wpdb->prepare( $query, $start_date, $current_date )
            ) ) );
        }

        $sales_data = array_fill_keys( $product_ids, 0 );

        foreach ( $results as $result ) {
            $product_id = intval( $result->product_id );
            $sales_data[ $product_id ] = intval( $result->total_sales );
            
            // Additional debug info per product
            if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
                error_log( "UPSPR Product Sales - ID: {$product_id}, Sales: {$result->total_sales}, Orders: {$result->order_count}, Latest: {$result->latest_order_date}" );
            }
        }

        return $sales_data;
    }

    /**
     * Get boost multiplier based on boost factor setting
     *
     * @param string $boost_factor Boost factor (low, medium, high)
     * @return float Boost multiplier
     */
    private static function get_boost_multiplier( $boost_factor ) {
        switch ( $boost_factor ) {
            case 'low':
                return 0.3;
            case 'medium':
                return 0.6;
            case 'high':
                return 1.0;
            default:
                return 0.6;
        }
    }

    /**
     * Convert period string to days
     *
     * @param string $period Period string
     * @return int Number of days
     */
    private static function get_days_from_period( $period ) {
        switch ( $period ) {
            case 'last-7-days':
                return 7;
            case 'last-30-days':
                return 30;
            case 'last-90-days':
                return 90;
            case 'last-180-days':
                return 180;
            case 'last-365-days':
                return 365;
            default:
                return 30;
        }
    }

    /**
     * Combine multiple amplifier scores
     *
     * @param array $score_arrays Array of score arrays to combine
     * @return array Combined scores
     */
    public static function combine_amplifier_scores( $score_arrays ) {
        if ( empty( $score_arrays ) ) {
            return array();
        }

        $combined_scores = array();
        $product_ids = array_keys( $score_arrays[0] );

        foreach ( $product_ids as $product_id ) {
            $combined_score = 1.0;
            
            foreach ( $score_arrays as $scores ) {
                if ( isset( $scores[ $product_id ] ) ) {
                    $combined_score *= $scores[ $product_id ];
                }
            }
            
            $combined_scores[ $product_id ] = $combined_score;
        }

        return $combined_scores;
    }
}
