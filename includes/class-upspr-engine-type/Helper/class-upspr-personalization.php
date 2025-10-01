<?php
/**
 * Personalization Helper - Handle personalized product recommendations
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class UPSPR_Personalization {

    /**
     * Apply personalization based on purchase history
     *
     * @param array $product_ids Array of product IDs to personalize
     * @param array $personalization_config Personalization configuration
     * @param int $user_id User ID (optional, defaults to current user)
     * @return array Personalized product IDs with scores
     */
    public static function upspr_apply_purchase_history_personalization( $product_ids, $personalization_config, $user_id = null ) {
        if ( empty( $product_ids ) || ! isset( $personalization_config['purchaseHistoryBased'] ) || ! $personalization_config['purchaseHistoryBased'] ) {
            return array_combine( $product_ids, array_fill( 0, count( $product_ids ), 1.0 ) );
        }

        if ( is_null( $user_id ) ) {
            $user_id = get_current_user_id();
        }

        if ( ! $user_id ) {
            return array_combine( $product_ids, array_fill( 0, count( $product_ids ), 1.0 ) );
        }

        $period = isset( $personalization_config['purchaseHistoryPeriod'] ) ? $personalization_config['purchaseHistoryPeriod'] : 'last-90-days';
        $weight = isset( $personalization_config['purchaseHistoryWeight'] ) ? $personalization_config['purchaseHistoryWeight'] : 'medium';

        // Get user's purchase history
        $purchase_history = self::upspr_get_user_purchase_history( $user_id, $period );
        
        // Calculate personalization scores
        $scores = array();
        $weight_multiplier = self::upspr_get_weight_multiplier( $weight );

        foreach ( $product_ids as $product_id ) {
            $score = 1.0; // Base score
            
            // Check if product is in same categories as previously purchased products
            $product_categories = wp_get_post_terms( $product_id, 'product_cat', array( 'fields' => 'ids' ) );
            
            if ( ! is_wp_error( $product_categories ) && ! empty( $purchase_history ) ) {
                $category_match_score = 0;
                
                foreach ( $purchase_history as $purchased_product_id ) {
                    $purchased_categories = wp_get_post_terms( $purchased_product_id, 'product_cat', array( 'fields' => 'ids' ) );
                    
                    if ( ! is_wp_error( $purchased_categories ) ) {
                        $common_categories = array_intersect( $product_categories, $purchased_categories );
                        if ( ! empty( $common_categories ) ) {
                            $category_match_score += 0.2; // Boost for each category match
                        }
                    }
                }
                
                $score += $category_match_score * $weight_multiplier;
            }
            
            $scores[ $product_id ] = $score;
        }

        return $scores;
    }

    /**
     * Apply browsing behavior personalization
     *
     * @param array $product_ids Array of product IDs to personalize
     * @param array $personalization_config Personalization configuration
     * @param int $user_id User ID (optional, defaults to current user)
     * @return array Personalized product IDs with scores
     */
    public static function upspr_apply_browsing_behavior_personalization( $product_ids, $personalization_config, $user_id = null ) {
        if ( empty( $product_ids ) || ! isset( $personalization_config['browsingBehavior'] ) || ! $personalization_config['browsingBehavior'] ) {
            return array_combine( $product_ids, array_fill( 0, count( $product_ids ), 1.0 ) );
        }

        $recently_viewed_weight = isset( $personalization_config['recentlyViewedWeight'] ) ? $personalization_config['recentlyViewedWeight'] : 'medium';
        $time_on_page_weight = isset( $personalization_config['timeOnPageWeight'] ) ? $personalization_config['timeOnPageWeight'] : 'medium';
        $search_history_weight = isset( $personalization_config['searchHistoryWeight'] ) ? $personalization_config['searchHistoryWeight'] : 'high';

        // Get recently viewed products (from cookies or user meta)
        $recently_viewed = self::upspr_get_recently_viewed_products( $user_id );
        
        // Get search history (from cookies or user meta)
        $search_history = self::upspr_get_user_search_history( $user_id );

        $scores = array();

        foreach ( $product_ids as $product_id ) {
            $score = 1.0; // Base score
            
            // Recently viewed boost
            if ( in_array( $product_id, $recently_viewed ) ) {
                $score += 0.3 * self::upspr_get_weight_multiplier( $recently_viewed_weight );
            }
            
            // Search history boost
            if ( ! empty( $search_history ) ) {
                $product_name = get_the_title( $product_id );
                $product_content = get_post_field( 'post_content', $product_id );
                
                foreach ( $search_history as $search_term ) {
                    if ( stripos( $product_name, $search_term ) !== false || 
                         stripos( $product_content, $search_term ) !== false ) {
                        $score += 0.4 * self::upspr_get_weight_multiplier( $search_history_weight );
                        break;
                    }
                }
            }
            
            $scores[ $product_id ] = $score;
        }

        return $scores;
    }

    /**
     * Apply customer segmentation personalization
     *
     * @param array $product_ids Array of product IDs to personalize
     * @param array $personalization_config Personalization configuration
     * @param int $user_id User ID (optional, defaults to current user)
     * @return array Personalized product IDs with scores
     */
    public static function upspr_apply_customer_segmentation( $product_ids, $personalization_config, $user_id = null ) {
        if ( empty( $product_ids ) || ! isset( $personalization_config['customerSegmentation'] ) || ! $personalization_config['customerSegmentation'] ) {
            return array_combine( $product_ids, array_fill( 0, count( $product_ids ), 1.0 ) );
        }

        if ( is_null( $user_id ) ) {
            $user_id = get_current_user_id();
        }

        $customer_type = isset( $personalization_config['customerType'] ) ? $personalization_config['customerType'] : 'all-customers';
        $spending_tier = isset( $personalization_config['spendingTier'] ) ? $personalization_config['spendingTier'] : 'any-tier';

        // Check if current user matches the target customer type
        if ( ! self::user_matches_customer_type( $user_id, $customer_type ) ) {
            return array_combine( $product_ids, array_fill( 0, count( $product_ids ), 0.5 ) ); // Lower scores for non-matching customers
        }

        // Check spending tier
        if ( ! self::user_matches_spending_tier( $user_id, $spending_tier ) ) {
            return array_combine( $product_ids, array_fill( 0, count( $product_ids ), 0.7 ) ); // Slightly lower scores
        }

        return array_combine( $product_ids, array_fill( 0, count( $product_ids ), 1.2 ) ); // Boost for matching customers
    }

    /**
     * Apply collaborative filtering
     *
     * @param array $product_ids Array of product IDs to personalize
     * @param array $personalization_config Personalization configuration
     * @param int $user_id User ID (optional, defaults to current user)
     * @return array Personalized product IDs with scores
     */
    public static function upspr_apply_collaborative_filtering( $product_ids, $personalization_config, $user_id = null ) {
        if ( empty( $product_ids ) || ! isset( $personalization_config['collaborativeFiltering'] ) || ! $personalization_config['collaborativeFiltering'] ) {
            return array_combine( $product_ids, array_fill( 0, count( $product_ids ), 1.0 ) );
        }

        if ( is_null( $user_id ) ) {
            $user_id = get_current_user_id();
        }

        if ( ! $user_id ) {
            return array_combine( $product_ids, array_fill( 0, count( $product_ids ), 1.0 ) );
        }

        $similar_users_count = isset( $personalization_config['similarUsersCount'] ) ? $personalization_config['similarUsersCount'] : 50;
        $similarity_threshold = isset( $personalization_config['similarityThreshold'] ) ? $personalization_config['similarityThreshold'] : 'medium';

        // Find similar users based on purchase history
        $similar_users = self::upspr_find_similar_users( $user_id, $similar_users_count, $similarity_threshold );
        
        if ( empty( $similar_users ) ) {
            return array_combine( $product_ids, array_fill( 0, count( $product_ids ), 1.0 ) );
        }

        // Get products purchased by similar users
        $similar_user_purchases = array();
        foreach ( $similar_users as $similar_user_id ) {
            $purchases = self::upspr_get_user_purchase_history( $similar_user_id, 'last-180-days' );
            $similar_user_purchases = array_merge( $similar_user_purchases, $purchases );
        }

        $purchase_frequency = array_count_values( $similar_user_purchases );

        $scores = array();
        foreach ( $product_ids as $product_id ) {
            $frequency = isset( $purchase_frequency[ $product_id ] ) ? $purchase_frequency[ $product_id ] : 0;
            $score = 1.0 + ( $frequency / count( $similar_users ) ) * 0.5; // Boost based on frequency among similar users
            $scores[ $product_id ] = $score;
        }

        return $scores;
    }

    /**
     * Apply geographic personalization
     *
     * @param array $product_ids Array of product IDs to personalize
     * @param array $personalization_config Personalization configuration
     * @param int $user_id User ID (optional, defaults to current user)
     * @return array Personalized product IDs with scores
     */
    public static function upspr_apply_geographic_personalization( $product_ids, $personalization_config, $user_id = null ) {
        if ( empty( $product_ids ) ) {
            return array_combine( $product_ids, array_fill( 0, count( $product_ids ), 1.0 ) );
        }

        $selected_countries = isset( $personalization_config['selectedCountries'] ) ? $personalization_config['selectedCountries'] : array();
        $selected_states = isset( $personalization_config['selectedStates'] ) ? $personalization_config['selectedStates'] : array();

        if ( empty( $selected_countries ) && empty( $selected_states ) ) {
            return array_combine( $product_ids, array_fill( 0, count( $product_ids ), 1.0 ) );
        }

        // Get user's location (from billing address or IP geolocation)
        $user_country = self::upspr_get_user_country( $user_id );
        $user_state = self::upspr_get_user_state( $user_id );

        $location_matches = false;

        // Check country match
        if ( ! empty( $selected_countries ) && in_array( $user_country, $selected_countries ) ) {
            $location_matches = true;
        }

        // Check state match
        if ( ! empty( $selected_states ) && in_array( $user_state, $selected_states ) ) {
            $location_matches = true;
        }

        $score_multiplier = $location_matches ? 1.3 : 0.7; // Boost or reduce based on location match

        $scores = array();
        foreach ( $product_ids as $product_id ) {
            $scores[ $product_id ] = $score_multiplier;
        }

        return $scores;
    }

    /**
     * Get weight multiplier based on weight setting
     *
     * @param string $weight Weight setting (low, medium, high)
     * @return float Weight multiplier
     */
    private static function upspr_get_weight_multiplier( $weight ) {
        switch ( $weight ) {
            case 'low':
                return 0.5;
            case 'medium':
                return 1.0;
            case 'high':
                return 1.5;
            default:
                return 1.0;
        }
    }

    /**
     * Get user's purchase history
     *
     * @param int $user_id User ID
     * @param string $period Time period
     * @return array Array of purchased product IDs
     */
    private static function upspr_get_user_purchase_history( $user_id, $period ) {
        $days = self::upspr_get_days_from_period( $period );
        
        $orders = wc_get_orders( array(
            'customer_id' => $user_id,
            'status' => array( 'completed', 'processing' ),
            'date_created' => '>' . ( time() - ( $days * DAY_IN_SECONDS ) ),
            'limit' => -1
        ) );

        $purchased_products = array();
        foreach ( $orders as $order ) {
            foreach ( $order->get_items() as $item ) {
                $purchased_products[] = $item->get_product_id();
            }
        }

        return array_unique( $purchased_products );
    }

    /**
     * Get recently viewed products
     *
     * @param int $user_id User ID
     * @return array Array of recently viewed product IDs
     */
    private static function upspr_get_recently_viewed_products( $user_id = null ) {
        // Try to get from WooCommerce recently viewed products
        if ( function_exists( 'wc_upspr_get_recently_viewed_products' ) ) {
            return wc_upspr_get_recently_viewed_products();
        }

        // Fallback to cookies
        if ( isset( $_COOKIE['woocommerce_recently_viewed'] ) ) {
            $viewed_products = (array) explode( '|', wp_unslash( $_COOKIE['woocommerce_recently_viewed'] ) );
            return array_reverse( array_filter( array_map( 'absint', $viewed_products ) ) );
        }

        return array();
    }

    /**
     * Get user's search history
     *
     * @param int $user_id User ID
     * @return array Array of search terms
     */
    private static function upspr_get_user_search_history( $user_id = null ) {
        // This would typically be stored in user meta or cookies
        // For now, return empty array - implement based on your search tracking
        return array();
    }

    /**
     * Check if user matches customer type
     *
     * @param int $user_id User ID
     * @param string $customer_type Customer type
     * @return bool Whether user matches
     */
    private static function user_matches_customer_type( $user_id, $customer_type ) {
        if ( $customer_type === 'all-customers' ) {
            return true;
        }

        // Implement logic based on your customer segmentation
        // This is a simplified example
        switch ( $customer_type ) {
            case 'new-customers':
                return self::upspr_is_new_customer( $user_id );
            case 'returning-customers':
                return ! self::upspr_is_new_customer( $user_id );
            case 'vip-customers':
                return self::upspr_is_vip_customer( $user_id );
            default:
                return true;
        }
    }

    /**
     * Check if user matches spending tier
     *
     * @param int $user_id User ID
     * @param string $spending_tier Spending tier
     * @return bool Whether user matches
     */
    private static function user_matches_spending_tier( $user_id, $spending_tier ) {
        if ( $spending_tier === 'any-tier' ) {
            return true;
        }

        $total_spent = wc_get_customer_total_spent( $user_id );

        switch ( $spending_tier ) {
            case 'low-spender':
                return $total_spent < 100;
            case 'medium-spender':
                return $total_spent >= 100 && $total_spent < 500;
            case 'high-spender':
                return $total_spent >= 500;
            default:
                return true;
        }
    }

    /**
     * Find similar users based on purchase history
     *
     * @param int $user_id User ID
     * @param int $limit Number of similar users to find
     * @param string $threshold Similarity threshold
     * @return array Array of similar user IDs
     */
    private static function upspr_find_similar_users( $user_id, $limit, $threshold ) {
        // This is a simplified implementation
        // In a real scenario, you'd use more sophisticated similarity algorithms
        
        $user_purchases = self::upspr_get_user_purchase_history( $user_id, 'last-180-days' );
        
        if ( empty( $user_purchases ) ) {
            return array();
        }

        // Get other customers who bought similar products
        $similar_users = array();
        
        $orders = wc_get_orders( array(
            'status' => array( 'completed', 'processing' ),
            'date_created' => '>' . ( time() - ( 180 * DAY_IN_SECONDS ) ),
            'limit' => 1000 // Limit for performance
        ) );

        $user_similarity = array();
        
        foreach ( $orders as $order ) {
            $customer_id = $order->get_customer_id();
            
            if ( $customer_id === $user_id || $customer_id === 0 ) {
                continue;
            }

            $customer_purchases = array();
            foreach ( $order->get_items() as $item ) {
                $customer_purchases[] = $item->get_product_id();
            }

            $common_products = array_intersect( $user_purchases, $customer_purchases );
            $similarity_score = count( $common_products ) / max( count( $user_purchases ), count( $customer_purchases ) );

            if ( $similarity_score > 0.1 ) { // Minimum similarity threshold
                if ( ! isset( $user_similarity[ $customer_id ] ) ) {
                    $user_similarity[ $customer_id ] = 0;
                }
                $user_similarity[ $customer_id ] += $similarity_score;
            }
        }

        // Sort by similarity and return top users
        arsort( $user_similarity );
        return array_slice( array_keys( $user_similarity ), 0, $limit );
    }

    /**
     * Get user's country
     *
     * @param int $user_id User ID
     * @return string Country code
     */
    private static function upspr_get_user_country( $user_id = null ) {
        if ( $user_id ) {
            return get_user_meta( $user_id, 'billing_country', true );
        }

        // Fallback to IP geolocation or default
        return WC()->customer ? WC()->customer->get_billing_country() : '';
    }

    /**
     * Get user's state
     *
     * @param int $user_id User ID
     * @return string State code
     */
    private static function upspr_get_user_state( $user_id = null ) {
        if ( $user_id ) {
            $country = get_user_meta( $user_id, 'billing_country', true );
            $state = get_user_meta( $user_id, 'billing_state', true );
            return $country . ':' . $state;
        }

        // Fallback
        if ( WC()->customer ) {
            return WC()->customer->get_billing_country() . ':' . WC()->customer->get_billing_state();
        }

        return '';
    }

    /**
     * Convert period string to days
     *
     * @param string $period Period string
     * @return int Number of days
     */
    private static function upspr_get_days_from_period( $period ) {
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
                return 90;
        }
    }

    /**
     * Check if user is a new customer
     *
     * @param int $user_id User ID
     * @return bool Whether user is new
     */
    private static function upspr_is_new_customer( $user_id ) {
        $orders = wc_get_orders( array(
            'customer_id' => $user_id,
            'status' => array( 'completed', 'processing' ),
            'limit' => 1
        ) );

        return empty( $orders );
    }

    /**
     * Check if user is a VIP customer
     *
     * @param int $user_id User ID
     * @return bool Whether user is VIP
     */
    private static function upspr_is_vip_customer( $user_id ) {
        $total_spent = wc_get_customer_total_spent( $user_id );
        return $total_spent > 1000; // Example threshold
    }
}
