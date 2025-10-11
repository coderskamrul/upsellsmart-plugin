<?php
/**
 * Upsell Campaign Engine
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Include helper classes
require_once plugin_dir_path( __FILE__ ) . 'Helper/class-upspr-product-filter.php';
require_once plugin_dir_path( __FILE__ ) . 'Helper/class-upspr-performance-tracker.php';
require_once plugin_dir_path( __FILE__ ) . 'Helper/class-upspr-personalization.php';
require_once plugin_dir_path( __FILE__ ) . 'Helper/class-upspr-amplifier.php';
require_once plugin_dir_path( __FILE__ ) . 'Helper/class-upspr-visibility-checker.php';

class UPSPR_Upsell {

    /**
     * Campaign data
     */
    private $campaign_data;

    /**
     * Constructor
     *
     * @param array $campaign_data The campaign data
     */
    public function __construct( $campaign_data = array() ) {
        $this->campaign_data = $campaign_data;
    }

    /**
     * Process upsell campaign
     *
     * @return array|false Array of recommended products or false on failure
     */
    public function upspr_process() {
        if ( empty( $this->campaign_data ) ) {
            return false;
        }

        // Check visibility rules first
        $visibility_config = isset( $this->campaign_data['visibility'] ) ? $this->campaign_data['visibility'] : array();
        if ( ! UPSPR_Visibility_Checker::upspr_should_display_campaign( $visibility_config ) ) {
            return false; // Campaign should not be displayed based on visibility rules
        }

        // Get upsell recommendations based on campaign rules
        $recommendations = $this->upspr_get_upsell_recommendations();
        if ( empty( $recommendations ) ) {
            return false;
        }

        $formatted_recommendations = $this->upspr_format_recommendations( $recommendations );
        // Display the campaign using the location display system
        if ( ! empty( $formatted_recommendations ) ) {
            UPSPR_Location_Display::upspr_display_campaign( $this->campaign_data, $formatted_recommendations, 'upsell' );

            // Track impression with campaign-specific validation
            $product_ids = array_column( $formatted_recommendations, 'id' );
            UPSPR_Performance_Tracker::upspr_track_impression( $this->campaign_data['id'], $product_ids, $this->campaign_data );
        }

        return $formatted_recommendations;
    }

    /**
     * Render the campaign and return HTML
     *
     * @return string HTML output or empty string if no recommendations
     */
    public function upspr_render() {
        if ( empty( $this->campaign_data ) ) {
            return '';
        }

        // Check visibility rules first
        $visibility_config = isset( $this->campaign_data['visibility'] ) ? $this->campaign_data['visibility'] : array();
        if ( ! UPSPR_Visibility_Checker::upspr_should_display_campaign( $visibility_config ) ) {
            return '';
        }

        // Get upsell recommendations based on campaign rules
        $recommendations = $this->upspr_get_upsell_recommendations();
        if ( empty( $recommendations ) ) {
            return '';
        }

        $formatted_recommendations = $this->upspr_format_recommendations( $recommendations );

        // Get HTML from location display system
        if ( ! empty( $formatted_recommendations ) ) {
            // Track impression with campaign-specific validation
            $product_ids = array_column( $formatted_recommendations, 'id' );
            UPSPR_Performance_Tracker::upspr_track_impression( $this->campaign_data['id'], $product_ids, $this->campaign_data );

            return UPSPR_Location_Display::upspr_get_campaign_html( $this->campaign_data, $formatted_recommendations, 'upsell' );
        }

        return '';
    }

    /**
     * Get current product ID or cart product IDs based on context
     *
     * @return int|array|false Product ID, array of cart product IDs, or false if not found
     */
    private function upspr_upsell_get_current_product_id() {
        global $product, $post;

        // Method 1: Check if we're on cart or checkout page - get cart product IDs
        if ( is_cart() || is_checkout() ) {
            return $this->upspr_upsell_get_cart_product_ids();
        }

        // Method 2: Try global $product if it's a valid WC_Product object (product page)
        if ( is_object( $product ) && is_a( $product, 'WC_Product' ) ) {
            return $product->get_id();
        }

        // Method 3: If we're on a product page, get ID from global $post
        if ( is_product() && is_object( $post ) && $post->post_type === 'product' ) {
            return $post->ID;
        }

        // Method 4: Try to get product ID from URL/query vars
        if ( is_product() ) {
            $product_id = get_queried_object_id();
            if ( $product_id && get_post_type( $product_id ) === 'product' ) {
                return $product_id;
            }
        }

        // Method 5: For AJAX requests or other contexts, try to get from $_GET
        if ( isset( $_GET['product_id'] ) && is_numeric( $_GET['product_id'] ) ) {
            $product_id = absint( $_GET['product_id'] );
            if ( get_post_type( $product_id ) === 'product' ) {
                return $product_id;
            }
        }

        // Method 6: Try to initialize product from post if not already done
        if ( is_object( $post ) && $post->post_type === 'product' && ! is_object( $product ) ) {
            $product = wc_get_product( $post->ID );
            if ( is_object( $product ) && is_a( $product, 'WC_Product' ) ) {
                return $product->get_id();
            }
        }

        return false;
    }

    /**
     * Get product IDs from current cart
     *
     * @return array Array of product IDs in cart
     */
    private function upspr_upsell_get_cart_product_ids() {
        if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
            return array();
        }

        $cart_product_ids = array();
        $cart_items = WC()->cart->get_cart();

        foreach ( $cart_items as $cart_item ) {
            $product_id = $cart_item['product_id'];

            // For variable products, also consider the variation ID
            if ( isset( $cart_item['variation_id'] ) && $cart_item['variation_id'] > 0 ) {
                $cart_product_ids[] = $cart_item['variation_id'];
                // Also include parent product for broader recommendations
                $cart_product_ids[] = $product_id;
            } else {
                $cart_product_ids[] = $product_id;
            }
        }

        return array_unique( $cart_product_ids );
    }

    /**
     * Get WooCommerce upsell products
     *
     * @param int|array $product_data Product ID or array of cart product IDs
     * @return array Array of upsell product IDs
     */
    private function upspr_upsell_get_woocommerce_upsells( $product_data ) {
        $upsell_ids = array();

        // Handle both single product ID and array of cart product IDs
        $product_ids = is_array( $product_data ) ? $product_data : array( $product_data );

        foreach ( $product_ids as $product_id ) {
            $product = wc_get_product( $product_id );
            if ( $product ) {
                // Get upsell IDs set in WooCommerce product settings
                $product_upsells = $product->get_upsell_ids();
                if ( ! empty( $product_upsells ) ) {
                    $upsell_ids = array_merge( $upsell_ids, $product_upsells );
                }

                // For variable products, also check parent product upsells
                if ( $product->is_type( 'variation' ) ) {
                    $parent_product = wc_get_product( $product->get_parent_id() );
                    if ( $parent_product ) {
                        $parent_upsells = $parent_product->get_upsell_ids();
                        if ( ! empty( $parent_upsells ) ) {
                            $upsell_ids = array_merge( $upsell_ids, $parent_upsells );
                        }
                    }
                }
            }
        }

        return array_unique( $upsell_ids );
    }

    /**
     * Get upsell recommendations
     *
     * @return array Array of recommended product IDs with scores
     */
    private function upspr_get_upsell_recommendations() {
        $basic_info = isset( $this->campaign_data['basic_info'] ) ? $this->campaign_data['basic_info'] : array();
        $filters = isset( $this->campaign_data['filters'] ) ? $this->campaign_data['filters'] : array();
        $amplifiers = isset( $this->campaign_data['amplifiers'] ) ? $this->campaign_data['amplifiers'] : array();
        $personalization = isset( $this->campaign_data['personalization'] ) ? $this->campaign_data['personalization'] : array();

        $products_count = isset( $basic_info['numberOfProducts'] ) ? intval( $basic_info['numberOfProducts'] ) : 4;

        // Get current product ID(s) for upsell context
        $current_product_data = $this->upspr_upsell_get_current_product_id();

        // If we can't get current product data, try fallback recommendations
        if ( ! $current_product_data || ( is_array( $current_product_data ) && empty( $current_product_data ) ) ) {
            // Log debug info for troubleshooting
            if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
                error_log( 'UPSPR Upsell: Unable to determine current product ID(s). Context: ' . wp_json_encode( array(
                    'is_product' => is_product(),
                    'is_cart' => is_cart(),
                    'is_checkout' => is_checkout(),
                    'global_product_type' => gettype( $GLOBALS['product'] ?? null ),
                    'global_post_type' => get_post_type(),
                    'request_uri' => $_SERVER['REQUEST_URI'] ?? 'unknown',
                    'cart_item_count' => function_exists( 'WC' ) && WC()->cart ? WC()->cart->get_cart_contents_count() : 0
                ) ) );
            }

            // Try to get general recommendations instead of product-specific upsells
            return $this->upspr_upsell_get_fallback_recommendations( $products_count );
        }

        // Step 1: Get base product pool
        $base_products = $this->upspr_upsell_get_base_product_pool( $current_product_data );

        if ( empty( $base_products ) ) {
            return array();
        }

        // Step 2: Apply filters
        $filtered_products = $this->upspr_upsell_apply_filters( $base_products, $filters );

        if ( empty( $filtered_products ) ) {
            return array();
        }

        // Step 3: Apply amplifiers (boosting)
        $amplified_scores = $this->upspr_upsell_apply_amplifiers( $filtered_products, $amplifiers );

        // Step 4: Apply personalization
        $personalized_scores = $this->upspr_upsell_apply_personalization( $filtered_products, $personalization );

        // Step 5: Combine scores and sort
        $final_scores = $this->upspr_upsell_combine_scores( $amplified_scores, $personalized_scores );

        // Step 6: Sort by score and limit results
        arsort( $final_scores );
        $recommended_products = array_slice( array_keys( $final_scores ), 0, $products_count, true );

        return $recommended_products;
    }

    /**
     * Get base product pool for upsell recommendations
     *
     * @param int|array $current_product_data Current product ID or array of cart product IDs
     * @return array Array of product IDs
     */
    private function upspr_upsell_get_base_product_pool( $current_product_data ) {
        $base_products = array();
        $exclude_products = array();
        $current_product_price = 0;

        // Handle both single product ID and array of cart product IDs
        if ( is_array( $current_product_data ) ) {
            // Cart/checkout context - multiple products
            $exclude_products = $current_product_data;

            // Get average price from cart products for upsell targeting
            $total_price = 0;
            $price_count = 0;
            foreach ( $current_product_data as $product_id ) {
                if ( is_numeric( $product_id ) && get_post_type( $product_id ) === 'product' ) {
                    $product = wc_get_product( $product_id );
                    if ( $product ) {
                        $total_price += (float) $product->get_price();
                        $price_count++;
                    }
                }
            }
            $current_product_price = $price_count > 0 ? $total_price / $price_count : 0;

        } else {
            // Single product context (product page)
            $current_product_id = $current_product_data;

            // Validate current product ID
            if ( ! $current_product_id || ! is_numeric( $current_product_id ) || get_post_type( $current_product_id ) !== 'product' ) {
                return $base_products;
            }

            $exclude_products = array( $current_product_id );

            // Get current product price for upsell targeting
            $current_product = wc_get_product( $current_product_id );
            if ( $current_product ) {
                $current_product_price = (float) $current_product->get_price();
            }
        }

        // Step 1: Get WooCommerce upsell products
        $wc_upsells = $this->upspr_upsell_get_woocommerce_upsells( $current_product_data );
        if ( ! empty( $wc_upsells ) ) {
            $base_products = array_merge( $base_products, $wc_upsells );
        }

        // Step 2: Get higher-priced products (typical upsell strategy)
        // Upsells should be products with higher value/price
        $min_upsell_price = $current_product_price * 1.2; // At least 20% more expensive
        $max_upsell_price = $current_product_price * 3.0; // Up to 3x the price

        $args = array(
            'post_type' => 'product',
            'post_status' => 'publish',
            'posts_per_page' => 200, // Get a large pool to filter from
            'post__not_in' => $exclude_products, // Exclude current/cart products
            'meta_query' => array(
                'relation' => 'AND',
                array(
                    'key' => '_stock_status',
                    'value' => 'instock',
                    'compare' => '='
                ),
                array(
                    'key' => '_price',
                    'value' => $min_upsell_price,
                    'type' => 'NUMERIC',
                    'compare' => '>='
                ),
                array(
                    'key' => '_price',
                    'value' => $max_upsell_price,
                    'type' => 'NUMERIC',
                    'compare' => '<='
                )
            ),
            'orderby' => 'meta_value_num',
            'meta_key' => '_price',
            'order' => 'ASC'
        );

        $products = get_posts( $args );
        $higher_priced_products = wp_list_pluck( $products, 'ID' );

        if ( ! empty( $higher_priced_products ) ) {
            $base_products = array_merge( $base_products, $higher_priced_products );
        }

        // Step 3: If still not enough products, get products from same categories
        if ( count( $base_products ) < 50 ) {
            $all_categories = array();

            if ( is_array( $current_product_data ) ) {
                foreach ( $current_product_data as $product_id ) {
                    if ( is_numeric( $product_id ) && get_post_type( $product_id ) === 'product' ) {
                        $categories = wp_get_post_terms( $product_id, 'product_cat', array( 'fields' => 'ids' ) );
                        if ( ! is_wp_error( $categories ) && ! empty( $categories ) ) {
                            $all_categories = array_merge( $all_categories, $categories );
                        }
                    }
                }
                $all_categories = array_unique( $all_categories );
            } else {
                $all_categories = wp_get_post_terms( $current_product_data, 'product_cat', array( 'fields' => 'ids' ) );
                if ( is_wp_error( $all_categories ) ) {
                    $all_categories = array();
                }
            }

            if ( ! empty( $all_categories ) ) {
                $category_args = array(
                    'post_type' => 'product',
                    'post_status' => 'publish',
                    'posts_per_page' => 100,
                    'post__not_in' => $exclude_products,
                    'tax_query' => array(
                        array(
                            'taxonomy' => 'product_cat',
                            'field' => 'term_id',
                            'terms' => $all_categories,
                            'operator' => 'IN'
                        )
                    ),
                    'meta_query' => array(
                        array(
                            'key' => '_stock_status',
                            'value' => 'instock',
                            'compare' => '='
                        )
                    )
                );

                $category_products = get_posts( $category_args );
                $category_product_ids = wp_list_pluck( $category_products, 'ID' );

                if ( ! empty( $category_product_ids ) ) {
                    $base_products = array_merge( $base_products, $category_product_ids );
                }
            }
        }

        return array_unique( $base_products );
    }

    /**
     * Apply filters to product pool
     *
     * @param array $product_ids Array of product IDs
     * @param array $filters Filter configuration
     * @return array Filtered product IDs
     */
    private function upspr_upsell_apply_filters( $product_ids, $filters ) {
        if ( empty( $product_ids ) || empty( $filters ) ) {
            return $product_ids;
        }

        $filtered_products = $product_ids;

        // Include categories filter
        if ( isset( $filters['includeCategories'] ) && ! empty( $filters['includeCategories'] ) ) {
            $filtered_products = UPSPR_Product_Filter::upspr_filter_by_categories(
                $filtered_products,
                $filters['includeCategories'],
                true
            );
        }

        // Include tags filter
        if ( isset( $filters['includeTags'] ) && ! empty( $filters['includeTags'] ) ) {
            $filtered_products = UPSPR_Product_Filter::upspr_filter_by_tags(
                $filtered_products,
                $filters['includeTags'],
                true
            );
        }

        // Price range filter
        if ( isset( $filters['priceRange'] ) && ! empty( $filters['priceRange'] ) && ( ( isset( $filters['priceRange']['min'] ) && $filters['priceRange']['min'] !== '' ) || ( isset( $filters['priceRange']['max'] ) && $filters['priceRange']['max'] !== '' ) ) ) {
            $min_price = isset( $filters['priceRange']['min'] ) ? $filters['priceRange']['min'] : null;
            $max_price = isset( $filters['priceRange']['max'] ) ? $filters['priceRange']['max'] : null;
            $filtered_products = UPSPR_Product_Filter::upspr_filter_by_price_range(
                $filtered_products,
                $min_price,
                $max_price
            );
        }

        // Stock status filter
        if ( isset( $filters['stockStatus'] ) && ! empty( $filters['stockStatus'] ) ) {
            $filtered_products = UPSPR_Product_Filter::upspr_filter_by_stock_status(
                $filtered_products,
                $filters['stockStatus']
            );
        }

        // Product type filter
        if ( isset( $filters['productType'] ) && ! empty( $filters['productType'] ) ) {
            $filtered_products = UPSPR_Product_Filter::upspr_filter_by_product_type(
                $filtered_products,
                $filters['productType']
            );
        }

        // Brands filter
        if ( isset( $filters['brands'] ) && ! empty( $filters['brands'] ) ) {
            $filtered_products = UPSPR_Product_Filter::upspr_filter_by_brands(
                $filtered_products,
                $filters['brands'],
                true
            );
        }

        // Attributes filter
        if ( isset( $filters['attributes'] ) && ! empty( $filters['attributes'] ) ) {
            $filtered_products = UPSPR_Product_Filter::upspr_filter_by_attributes(
                $filtered_products,
                $filters['attributes'],
                true
            );
        }

        // Exclude products
        if ( isset( $filters['excludeProducts'] ) && ! empty( $filters['excludeProducts'] ) ) {
            $filtered_products = UPSPR_Product_Filter::upspr_exclude_products(
                $filtered_products,
                $filters['excludeProducts']
            );
        }

        // Exclude categories
        if ( isset( $filters['excludeCategories'] ) && ! empty( $filters['excludeCategories'] ) ) {
            $filtered_products = UPSPR_Product_Filter::upspr_filter_by_categories(
                $filtered_products,
                $filters['excludeCategories'],
                false
            );
        }

        // Exclude sale products
        if ( isset( $filters['excludeSaleProducts'] ) && $filters['excludeSaleProducts'] ) {
            $filtered_products = UPSPR_Product_Filter::upspr_exclude_sale_products(
                $filtered_products,
                true
            );
        }

        // Exclude featured products
        if ( isset( $filters['excludeFeaturedProducts'] ) && $filters['excludeFeaturedProducts'] ) {
            $filtered_products = UPSPR_Product_Filter::upspr_exclude_featured_products(
                $filtered_products,
                true
            );
        }

        return $filtered_products;
    }

    /**
     * Apply amplifiers to boost product scores
     *
     * @param array $product_ids Array of product IDs
     * @param array $amplifiers Amplifier configuration
     * @return array Product IDs with amplifier scores
     */
    private function upspr_upsell_apply_amplifiers( $product_ids, $amplifiers ) {
        if ( empty( $product_ids ) || empty( $amplifiers ) ) {
            return array_combine( $product_ids, array_fill( 0, count( $product_ids ), 1.0 ) );
        }

        $score_arrays = array();

        // Sales performance boost
        if ( isset( $amplifiers['salesPerformanceBoost'] ) && $amplifiers['salesPerformanceBoost'] ) {
            $score_arrays[] = UPSPR_Amplifier::upspr_apply_sales_performance_boost( $product_ids, $amplifiers );
        }

        // Inventory level boost
        if ( isset( $amplifiers['inventoryLevelBoost'] ) && $amplifiers['inventoryLevelBoost'] ) {
            $score_arrays[] = UPSPR_Amplifier::upspr_apply_inventory_level_boost( $product_ids, $amplifiers );
        }

        // Seasonal trending boost
        if ( isset( $amplifiers['seasonalTrendingBoost'] ) && $amplifiers['seasonalTrendingBoost'] ) {
            $score_arrays[] = UPSPR_Amplifier::upspr_apply_seasonal_trending_boost( $product_ids, $amplifiers );
        }

        // Apply additional amplifiers
        $score_arrays[] = UPSPR_Amplifier::upspr_apply_rating_boost( $product_ids, 4.0 );
        $score_arrays[] = UPSPR_Amplifier::upspr_apply_new_product_boost( $product_ids, 30 );

        // Combine all amplifier scores
        if ( empty( $score_arrays ) ) {
            return array_combine( $product_ids, array_fill( 0, count( $product_ids ), 1.0 ) );
        }

        return UPSPR_Amplifier::upspr_combine_amplifier_scores( $score_arrays );
    }

    /**
     * Apply personalization to product scores
     *
     * @param array $product_ids Array of product IDs
     * @param array $personalization Personalization configuration
     * @return array Product IDs with personalization scores
     */
    private function upspr_upsell_apply_personalization( $product_ids, $personalization ) {
        if ( empty( $product_ids ) || empty( $personalization ) ) {
            return array_combine( $product_ids, array_fill( 0, count( $product_ids ), 1.0 ) );
        }

        $score_arrays = array();

        // Purchase history personalization
        if ( isset( $personalization['purchaseHistoryBased'] ) && $personalization['purchaseHistoryBased'] ) {
            $score_arrays[] = UPSPR_Personalization::upspr_apply_purchase_history_personalization(
                $product_ids,
                $personalization
            );
        }

        // Browsing behavior personalization
        if ( isset( $personalization['browsingBehavior'] ) && $personalization['browsingBehavior'] ) {
            $score_arrays[] = UPSPR_Personalization::upspr_apply_browsing_behavior_personalization(
                $product_ids,
                $personalization
            );
        }

        // Customer segmentation
        if ( isset( $personalization['customerSegmentation'] ) && $personalization['customerSegmentation'] ) {
            $score_arrays[] = UPSPR_Personalization::upspr_apply_customer_segmentation(
                $product_ids,
                $personalization
            );
        }

        // Collaborative filtering
        if ( isset( $personalization['collaborativeFiltering'] ) && $personalization['collaborativeFiltering'] ) {
            $score_arrays[] = UPSPR_Personalization::upspr_apply_collaborative_filtering(
                $product_ids,
                $personalization
            );
        }

        // Geographic personalization
        $score_arrays[] = UPSPR_Personalization::upspr_apply_geographic_personalization(
            $product_ids,
            $personalization
        );

        // Combine all personalization scores
        if ( empty( $score_arrays ) ) {
            return array_combine( $product_ids, array_fill( 0, count( $product_ids ), 1.0 ) );
        }

        // Average the personalization scores
        $combined_scores = array();
        foreach ( $product_ids as $product_id ) {
            $total_score = 0;
            $score_count = 0;

            foreach ( $score_arrays as $scores ) {
                if ( isset( $scores[ $product_id ] ) ) {
                    $total_score += $scores[ $product_id ];
                    $score_count++;
                }
            }

            $combined_scores[ $product_id ] = $score_count > 0 ? $total_score / $score_count : 1.0;
        }

        return $combined_scores;
    }

    /**
     * Combine amplifier and personalization scores
     *
     * @param array $amplifier_scores Amplifier scores
     * @param array $personalization_scores Personalization scores
     * @return array Combined scores
     */
    private function upspr_upsell_combine_scores( $amplifier_scores, $personalization_scores ) {
        $combined_scores = array();

        $all_product_ids = array_unique( array_merge(
            array_keys( $amplifier_scores ),
            array_keys( $personalization_scores )
        ) );

        foreach ( $all_product_ids as $product_id ) {
            $amplifier_score = isset( $amplifier_scores[ $product_id ] ) ? $amplifier_scores[ $product_id ] : 1.0;
            $personalization_score = isset( $personalization_scores[ $product_id ] ) ? $personalization_scores[ $product_id ] : 1.0;

            // Multiply scores (amplifiers boost, personalization adjusts)
            $combined_scores[ $product_id ] = $amplifier_score * $personalization_score;
        }

        return $combined_scores;
    }

    /**
     * Format recommendations for output
     *
     * @param array $product_ids Array of product IDs
     * @return array Formatted recommendations
     */
    private function upspr_format_recommendations( $product_ids ) {
        $formatted = array();
        if ( empty( $product_ids ) ) {
            return $formatted;
        }

        $basic_info = isset( $this->campaign_data['basic_info'] ) ? $this->campaign_data['basic_info'] : array();
        $show_category = isset( $basic_info['showProductCategory'] ) ? $basic_info['showProductCategory'] : true;

        foreach ( $product_ids as $product_id ) {
            $product = wc_get_product( $product_id );
            if ( $product ) {
                $formatted_product = array(
                    'id' => $product_id,
                    'name' => $product->get_name(),
                    'price' => $product->get_price(),
                    'image' => wp_get_attachment_image_src( $product->get_image_id(), 'thumbnail' ),
                    'url' => $product->get_permalink(),
                    'rating' => $product->get_average_rating(),
                );

                // Add category if enabled
                if ( $show_category ) {
                    $categories = wp_get_post_terms( $product_id, 'product_cat', array( 'fields' => 'names' ) );
                    if ( ! is_wp_error( $categories ) && ! empty( $categories ) ) {
                        $formatted_product['category'] = $categories[0]; // Show first category
                    }
                }

                $formatted[] = $formatted_product;
            }
        }

        return $formatted;
    }

    /**
     * Get fallback recommendations when current product ID cannot be determined
     *
     * @param int $products_count Number of products to return
     * @return array Array of product IDs
     */
    private function upspr_upsell_get_fallback_recommendations( $products_count = 4 ) {
        // Get popular or featured products as fallback
        $args = array(
            'post_type' => 'product',
            'post_status' => 'publish',
            'posts_per_page' => $products_count,
            'meta_query' => array(
                array(
                    'key' => '_stock_status',
                    'value' => 'instock',
                    'compare' => '='
                )
            ),
            'orderby' => 'menu_order',
            'order' => 'ASC'
        );

        // Try to get featured products first
        $featured_args = $args;
        $featured_args['tax_query'] = array(
            array(
                'taxonomy' => 'product_visibility',
                'field'    => 'name',
                'terms'    => 'featured',
            ),
        );

        $featured_products = get_posts( $featured_args );

        if ( ! empty( $featured_products ) ) {
            $product_ids = wp_list_pluck( $featured_products, 'ID' );
            return array_slice( $product_ids, 0, $products_count );
        }

        // If no featured products, get recent products
        $args['orderby'] = 'date';
        $args['order'] = 'DESC';
        $recent_products = get_posts( $args );

        if ( ! empty( $recent_products ) ) {
            return wp_list_pluck( $recent_products, 'ID' );
        }

        return array();
    }

}
