<?php
/**
 * Cross-sell Campaign Engine
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

class UPSPR_Cross_Sell {

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

        // Initialize performance tracking AJAX handlers
        add_action( 'init', array( 'UPSPR_Performance_Tracker', 'init_ajax_tracking' ) );

        // Add tracking scripts to footer
        add_action( 'wp_footer', array( $this, 'add_tracking_scripts' ) );
    }

    /**
     * Process cross-sell campaign
     *
     * @return array|false Array of recommended products or false on failure
     */
    public function process() {
        if ( empty( $this->campaign_data ) ) {
            return false;
        }
        
        // Check visibility rules first
        $visibility_config = isset( $this->campaign_data['visibility'] ) ? $this->campaign_data['visibility'] : array();
        if ( ! UPSPR_Visibility_Checker::should_display_campaign( $visibility_config ) ) {
            return false; // Campaign should not be displayed based on visibility rules
        }

        // Get cross-sell recommendations based on campaign rules
        $recommendations = $this->get_cross_sell_recommendations();
        if ( empty( $recommendations ) ) {
            return false;
        }

        $formatted_recommendations = $this->format_recommendations( $recommendations );

        // Display the campaign using the location display system
        if ( ! empty( $formatted_recommendations ) ) {
            UPSPR_Location_Display::display_campaign( $this->campaign_data, $formatted_recommendations, 'cross-sell' );

            // Track impression
            $product_ids = array_column( $formatted_recommendations, 'id' );
            UPSPR_Performance_Tracker::track_impression( $this->campaign_data['id'], $product_ids );
        }

        return $formatted_recommendations;
    }

    /**
     * Render the campaign and return HTML
     *
     * @return string HTML output or empty string if no recommendations
     */
    public function render() {
        if ( empty( $this->campaign_data ) ) {
            return '';
        }
        
        // Check visibility rules first
        $visibility_config = isset( $this->campaign_data['visibility'] ) ? $this->campaign_data['visibility'] : array();
        if ( ! UPSPR_Visibility_Checker::should_display_campaign( $visibility_config ) ) {
            return '';
        }

        // Get cross-sell recommendations based on campaign rules
        $recommendations = $this->get_cross_sell_recommendations();
        if ( empty( $recommendations ) ) {
            return '';
        }

        $formatted_recommendations = $this->format_recommendations( $recommendations );

        // Get HTML from location display system
        if ( ! empty( $formatted_recommendations ) ) {
            // Track impression
            $product_ids = array_column( $formatted_recommendations, 'id' );
            UPSPR_Performance_Tracker::track_impression( $this->campaign_data['id'], $product_ids );
            
            return UPSPR_Location_Display::get_campaign_html( $this->campaign_data, $formatted_recommendations, 'cross-sell' );
        }

        return '';
    }

    /**
     * Get current product ID or cart product IDs based on context
     *
     * @return int|array|false Product ID, array of cart product IDs, or false if not found
     */
    private function get_current_product_id() {
        global $product, $post;
        
        // Method 1: Check if we're on cart or checkout page - get cart product IDs
        if ( is_cart() || is_checkout() ) {
            return $this->get_cart_product_ids();
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
    private function get_cart_product_ids() {
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
     * Get WooCommerce cross-sell products for cart items
     *
     * @param array $cart_product_ids Array of cart product IDs
     * @return array Array of cross-sell product IDs
     */
    private function get_woocommerce_cross_sells( $cart_product_ids ) {
        $cross_sell_ids = array();
        
        foreach ( $cart_product_ids as $product_id ) {
            $product = wc_get_product( $product_id );
            if ( $product ) {
                // Get cross-sell IDs set in WooCommerce product settings
                $product_cross_sells = $product->get_cross_sell_ids();
                if ( ! empty( $product_cross_sells ) ) {
                    $cross_sell_ids = array_merge( $cross_sell_ids, $product_cross_sells );
                }
                
                // For variable products, also check parent product cross-sells
                if ( $product->is_type( 'variation' ) ) {
                    $parent_product = wc_get_product( $product->get_parent_id() );
                    if ( $parent_product ) {
                        $parent_cross_sells = $parent_product->get_cross_sell_ids();
                        if ( ! empty( $parent_cross_sells ) ) {
                            $cross_sell_ids = array_merge( $cross_sell_ids, $parent_cross_sells );
                        }
                    }
                }
            }
        }
        
        return array_unique( $cross_sell_ids );
    }

    /**
     * Get cross-sell recommendations
     *
     * @return array Array of recommended product IDs with scores
     */
    private function get_cross_sell_recommendations() {
        $basic_info = isset( $this->campaign_data['basic_info'] ) ? $this->campaign_data['basic_info'] : array();
        $filters = isset( $this->campaign_data['filters'] ) ? $this->campaign_data['filters'] : array();
        $amplifiers = isset( $this->campaign_data['amplifiers'] ) ? $this->campaign_data['amplifiers'] : array();
        $personalization = isset( $this->campaign_data['personalization'] ) ? $this->campaign_data['personalization'] : array();

        $products_count = isset( $basic_info['numberOfProducts'] ) ? intval( $basic_info['numberOfProducts'] ) : 4;

        // Get current product ID(s) for cross-sell context
        $current_product_data = $this->get_current_product_id();
        // If we can't get current product data, try fallback recommendations
        if ( ! $current_product_data || ( is_array( $current_product_data ) && empty( $current_product_data ) ) ) {
            // Log debug info for troubleshooting
            if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
                error_log( 'UPSPR Cross-sell: Unable to determine current product ID(s). Context: ' . wp_json_encode( array(
                    'is_product' => is_product(),
                    'is_cart' => is_cart(),
                    'is_checkout' => is_checkout(),
                    'global_product_type' => gettype( $GLOBALS['product'] ?? null ),
                    'global_post_type' => get_post_type(),
                    'request_uri' => $_SERVER['REQUEST_URI'] ?? 'unknown',
                    'cart_item_count' => function_exists( 'WC' ) && WC()->cart ? WC()->cart->get_cart_contents_count() : 0
                ) ) );
            }
            
            // Try to get general recommendations instead of product-specific cross-sells
            return $this->get_fallback_recommendations( $products_count );
        }

        // Step 1: Get base product pool
        $base_products = $this->get_base_product_pool( $current_product_data );
        //echo 'ccb<pre>'; print_r($base_products); echo '</pre>';

        if ( empty( $base_products ) ) {
            return array();
        }

        // Step 2: Apply filters
       $filtered_products = $this->apply_filters( $base_products, $filters );

        if ( empty( $filtered_products ) ) {
            return array();
        }

        // Step 3: Apply amplifiers (boosting)
        $amplified_scores = $this->apply_amplifiers( $filtered_products, $amplifiers );

        // Step 4: Apply personalization
        $personalized_scores = $this->apply_personalization( $filtered_products, $personalization );

        // Step 5: Combine scores and sort
        $final_scores = $this->combine_scores( $amplified_scores, $personalized_scores );
        // Step 6: Sort by score and limit results
        arsort( $final_scores );
        $recommended_products = array_slice( array_keys( $final_scores ), 0, $products_count, true );

        return $recommended_products;
    }

    /**
     * Get base product pool for cross-sell recommendations
     *
     * @param int|array $current_product_data Current product ID or array of cart product IDs
     * @return array Array of product IDs
     */
    private function get_base_product_pool( $current_product_data ) {
        $base_products = array();
        $exclude_products = array();
        $all_categories = array();

        // Handle both single product ID and array of cart product IDs
        if ( is_array( $current_product_data ) ) {
            // Cart/checkout context - multiple products
            $exclude_products = $current_product_data;
            
            // Get categories from all cart products
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
            // Single product context (product page)
            $current_product_id = $current_product_data;
            
            // Validate current product ID
            if ( ! $current_product_id || ! is_numeric( $current_product_id ) || get_post_type( $current_product_id ) !== 'product' ) {
                return $base_products;
            }
            
            $exclude_products = array( $current_product_id );
            
            // Get current product categories
            $all_categories = wp_get_post_terms( $current_product_id, 'product_cat', array( 'fields' => 'ids' ) );
            if ( is_wp_error( $all_categories ) ) {
                $all_categories = array();
            }
        }

        // Get cross-sell products based on categories
        if ( ! empty( $all_categories ) ) {
            $args = array(
                'post_type' => 'product',
                'post_status' => 'publish',
                'posts_per_page' => 200, // Get a large pool to filter from
                'post__not_in' => $exclude_products, // Exclude current/cart products
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

            $products = get_posts( $args );
            $base_products = wp_list_pluck( $products, 'ID' );
            
            // For cart/checkout context, also get cross-sell and upsell meta from WooCommerce
            if ( is_array( $current_product_data ) ) {
                $base_products = array_merge( $base_products, $this->get_woocommerce_cross_sells( $current_product_data ) );
                $base_products = array_unique( $base_products );
            }
        }

        // If no products found, get general product pool
        if ( empty( $base_products ) ) {
            $args = array(
                'post_type' => 'product',
                'post_status' => 'publish',
                'posts_per_page' => 200,
                'meta_query' => array(
                    array(
                        'key' => '_stock_status',
                        'value' => 'instock',
                        'compare' => '='
                    )
                )
            );

            // Exclude products that are already in cart/current product
            if ( ! empty( $exclude_products ) ) {
                $args['post__not_in'] = $exclude_products;
            }

            $products = get_posts( $args );
            $base_products = wp_list_pluck( $products, 'ID' );
        }

        return $base_products;
    }

    /**
     * Apply filters to product pool
     *
     * @param array $product_ids Array of product IDs
     * @param array $filters Filter configuration
     * @return array Filtered product IDs
     */
    private function apply_filters( $product_ids, $filters ) {
        if ( empty( $product_ids ) || empty( $filters ) ) {
            return $product_ids;
        }

        $filtered_products = $product_ids;

        // Include categories filter
        if ( isset( $filters['includeCategories'] ) && ! empty( $filters['includeCategories'] ) ) {
            $filtered_products = UPSPR_Product_Filter::filter_by_categories(
                $filtered_products,
                $filters['includeCategories'],
                true
            );
        }
        // Include tags filter
        if ( isset( $filters['includeTags'] ) && ! empty( $filters['includeTags'] ) ) {
            $filtered_products = UPSPR_Product_Filter::filter_by_tags(
                $filtered_products,
                $filters['includeTags'],
                true
            );
        }

        // Price range filter
        if ( isset( $filters['priceRange'] ) && ! empty( $filters['priceRange'] )  && ( ( isset($filters['priceRange']['min']) && $filters['priceRange']['min'] !== '' )  || ( isset($filters['priceRange']['max']) && $filters['priceRange']['max'] !== '' )  ) ) {
            $min_price = isset( $filters['priceRange']['min'] ) ? $filters['priceRange']['min'] : null;
            $max_price = isset( $filters['priceRange']['max'] ) ? $filters['priceRange']['max'] : null;
            $filtered_products = UPSPR_Product_Filter::filter_by_price_range(
                $filtered_products,
                $min_price,
                $max_price
            );
        }

        // Stock status filter
        if ( isset( $filters['stockStatus'] ) && ! empty( $filters['stockStatus'] ) ) {
            $filtered_products = UPSPR_Product_Filter::filter_by_stock_status(
                $filtered_products,
                $filters['stockStatus']
            );
        }

        // Product type filter
        if ( isset( $filters['productType'] ) && ! empty( $filters['productType'] ) ) {
            $filtered_products = UPSPR_Product_Filter::filter_by_product_type(
                $filtered_products,
                $filters['productType']
            );
        }

        // Brands filter
        if ( isset( $filters['brands'] ) && ! empty( $filters['brands'] ) ) {
            $filtered_products = UPSPR_Product_Filter::filter_by_brands(
                $filtered_products,
                $filters['brands'],
                true
            );
        }

        // Attributes filter
        if ( isset( $filters['attributes'] ) && ! empty( $filters['attributes'] ) ) {
            $filtered_products = UPSPR_Product_Filter::filter_by_attributes(
                $filtered_products,
                $filters['attributes'],
                true
            );
        }

        // Exclude products
        if ( isset( $filters['excludeProducts'] ) && ! empty( $filters['excludeProducts'] ) ) {
            $filtered_products = UPSPR_Product_Filter::exclude_products(
                $filtered_products,
                $filters['excludeProducts']
            );
        }

        // Exclude categories
        if ( isset( $filters['excludeCategories'] ) && ! empty( $filters['excludeCategories'] ) ) {
            $filtered_products = UPSPR_Product_Filter::filter_by_categories(
                $filtered_products,
                $filters['excludeCategories'],
                false
            );
        }

        // Exclude sale products
        if ( isset( $filters['excludeSaleProducts'] ) && $filters['excludeSaleProducts'] ) {
            $filtered_products = UPSPR_Product_Filter::exclude_sale_products(
                $filtered_products,
                true
            );
        }

        // Exclude featured products
        if ( isset( $filters['excludeFeaturedProducts'] ) && $filters['excludeFeaturedProducts'] ) {
            $filtered_products = UPSPR_Product_Filter::exclude_featured_products(
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
    private function apply_amplifiers( $product_ids, $amplifiers ) {
        if ( empty( $product_ids ) || empty( $amplifiers ) ) {
            return array_combine( $product_ids, array_fill( 0, count( $product_ids ), 1.0 ) );
        }

        $score_arrays = array();

        // Sales performance boost
        if ( isset( $amplifiers['salesPerformanceBoost'] ) && $amplifiers['salesPerformanceBoost'] ) {
            $score_arrays[] = UPSPR_Amplifier::apply_sales_performance_boost( $product_ids, $amplifiers );
        }

        // Inventory level boost
        if ( isset( $amplifiers['inventoryLevelBoost'] ) && $amplifiers['inventoryLevelBoost'] ) {
            $score_arrays[] = UPSPR_Amplifier::apply_inventory_level_boost( $product_ids, $amplifiers );
        }

        // Seasonal trending boost
        if ( isset( $amplifiers['seasonalTrendingBoost'] ) && $amplifiers['seasonalTrendingBoost'] ) {
            $score_arrays[] = UPSPR_Amplifier::apply_seasonal_trending_boost( $product_ids, $amplifiers );
        }

        // Apply additional amplifiers
        $score_arrays[] = UPSPR_Amplifier::apply_rating_boost( $product_ids, 4.0 );
        $score_arrays[] = UPSPR_Amplifier::apply_new_product_boost( $product_ids, 30 );

        // Combine all amplifier scores
        if ( empty( $score_arrays ) ) {
            return array_combine( $product_ids, array_fill( 0, count( $product_ids ), 1.0 ) );
        }
        return UPSPR_Amplifier::combine_amplifier_scores( $score_arrays );
    }

    /**
     * Apply personalization to product scores
     *
     * @param array $product_ids Array of product IDs
     * @param array $personalization Personalization configuration
     * @return array Product IDs with personalization scores
     */
    private function apply_personalization( $product_ids, $personalization ) {
        if ( empty( $product_ids ) || empty( $personalization ) ) {
            return array_combine( $product_ids, array_fill( 0, count( $product_ids ), 1.0 ) );
        }

        $score_arrays = array();

        // Purchase history personalization
        if ( isset( $personalization['purchaseHistoryBased'] ) && $personalization['purchaseHistoryBased'] ) {
            $score_arrays[] = UPSPR_Personalization::apply_purchase_history_personalization(
                $product_ids,
                $personalization
            );
        }

        // Browsing behavior personalization
        if ( isset( $personalization['browsingBehavior'] ) && $personalization['browsingBehavior'] ) {
            $score_arrays[] = UPSPR_Personalization::apply_browsing_behavior_personalization(
                $product_ids,
                $personalization
            );
        }

        // Customer segmentation
        if ( isset( $personalization['customerSegmentation'] ) && $personalization['customerSegmentation'] ) {
            $score_arrays[] = UPSPR_Personalization::apply_customer_segmentation(
                $product_ids,
                $personalization
            );
        }

        // Collaborative filtering
        if ( isset( $personalization['collaborativeFiltering'] ) && $personalization['collaborativeFiltering'] ) {
            $score_arrays[] = UPSPR_Personalization::apply_collaborative_filtering(
                $product_ids,
                $personalization
            );
        }

        // Geographic personalization
        $score_arrays[] = UPSPR_Personalization::apply_geographic_personalization(
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
    private function combine_scores( $amplifier_scores, $personalization_scores ) {
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
    private function format_recommendations( $product_ids ) {
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
     * Add tracking scripts to footer
     */
    public function add_tracking_scripts() {
        if ( empty( $this->campaign_data ) ) {
            return;
        }
        ?>
        <script type="text/javascript">
        jQuery(document).ready(function($) {
            // Track clicks on recommendation products
            $('.upspr-cross-sell-widget .upspr-product-item a, .upspr-cross-sell-widget .add_to_cart_button').on('click', function() {
                var campaignId = $(this).closest('.upspr-campaign-widget').data('campaign-id');
                var productId = $(this).closest('.upspr-product-item').find('.add_to_cart_button').data('product_id');

                if (campaignId && productId) {
                    $.ajax({
                        url: '<?php echo admin_url( 'admin-ajax.php' ); ?>',
                        type: 'POST',
                        data: {
                            action: 'upspr_track_click',
                            campaign_id: campaignId,
                            product_id: productId,
                            nonce: '<?php echo wp_create_nonce( 'upspr_tracking_nonce' ); ?>'
                        }
                    });
                }
            });
        });
        </script>
        <?php
    }

    /**
     * Get fallback recommendations when current product ID cannot be determined
     *
     * @param int $products_count Number of products to return
     * @return array Array of product IDs
     */
    private function get_fallback_recommendations( $products_count = 4 ) {
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
