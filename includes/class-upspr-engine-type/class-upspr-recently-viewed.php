<?php
/**
 * Recently Viewed Products Campaign Engine
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class UPSPR_Recently_Viewed {

    /**
     * Campaign data
     */
    private $campaign_data;

    /**
     * Constructor
     */
    public function __construct( $campaign_data = array() ) {
        $this->campaign_data = $campaign_data;
        $this->upspr_init_hooks();
    }

    /**
     * Initialize hooks
     */
    private function upspr_init_hooks() {
        // Track product views
        add_action( 'woocommerce_single_product_summary', array( $this, 'upspr_track_product_view' ), 5 );
    }

    /**
     * Track product view
     */
    public function upspr_track_product_view() {
        global $product;
        
        if ( ! $product ) {
            return;
        }

        $product_id = $product->get_id();
        $recently_viewed = $this->upspr_get_recently_viewed_products();
        
        // Remove current product if already in list
        $recently_viewed = array_diff( $recently_viewed, array( $product_id ) );
        
        // Add current product to beginning of array
        array_unshift( $recently_viewed, $product_id );
        
        // Limit to 10 products
        $recently_viewed = array_slice( $recently_viewed, 0, 10 );
        
        // Store in cookie
        $this->set_recently_viewed_products( $recently_viewed );
    }

    /**
     * Process recently viewed campaign
     */
    public function upspr_process() {
        if ( empty( $this->campaign_data ) ) {
            return false;
        }

        $recently_viewed = [];

        if ( empty( $recently_viewed ) ) {
            return false;
        }

        $recommendations = $this->upspr_get_recently_viewed_recommendations( $recently_viewed );
        $formatted_recommendations = $this->upspr_format_recommendations( $recommendations );

        // Display the campaign using the location display system
        if ( ! empty( $formatted_recommendations ) ) {
            UPSPR_Location_Display::upspr_display_campaign( $this->campaign_data, $formatted_recommendations, 'recently-viewed' );
        }

        return $formatted_recommendations;
    }

    /**
     * Get recently viewed recommendations
     */
    private function upspr_get_recently_viewed_recommendations( $recently_viewed ) {
        $recommendations = array();

        return $recommendations;
    }

    /**
     * Get current product ID
     */
    private function upspr_get_current_product_id() {
        global $product, $post;
        
        // Method 1: Try global $product if it's a valid WC_Product object
        if ( is_object( $product ) && is_a( $product, 'WC_Product' ) ) {
            return $product->get_id();
        }
        
        // Method 2: If we're on a product page, get ID from global $post
        if ( is_product() && is_object( $post ) && $post->post_type === 'product' ) {
            return $post->ID;
        }
        
        // Method 3: Try to get product ID from URL/query vars
        if ( is_product() ) {
            $product_id = get_queried_object_id();
            if ( $product_id && get_post_type( $product_id ) === 'product' ) {
                return $product_id;
            }
        }
        
        // Method 4: For AJAX requests or other contexts, try to get from $_GET
        if ( isset( $_GET['product_id'] ) && is_numeric( $_GET['product_id'] ) ) {
            $product_id = absint( $_GET['product_id'] );
            if ( get_post_type( $product_id ) === 'product' ) {
                return $product_id;
            }
        }
        
        // Method 5: Try to initialize product from post if not already done
        if ( is_object( $post ) && $post->post_type === 'product' && ! is_object( $product ) ) {
            $product = wc_get_product( $post->ID );
            if ( is_object( $product ) && is_a( $product, 'WC_Product' ) ) {
                return $product->get_id();
            }
        }

        return false;
    }

    /**
     * Format recommendations
     */
    private function upspr_format_recommendations( $product_ids ) {
        $formatted = array();
        if ( empty( $product_ids ) ) {
            return $formatted;
        }
        foreach ( $product_ids as $product_id ) {
            $product = wc_get_product( $product_id );
            if ( $product ) {
                $formatted[] = array(
                    'id' => $product_id,
                    'name' => $product->get_name(),
                    'price' => $product->get_price(),
                    'image' => wp_get_attachment_image_src( $product->get_image_id(), 'thumbnail' ),
                    'url' => $product->get_permalink(),
                    'stock_status' => $product->get_stock_status(),
                );
            }
        }

        return $formatted;
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

        $recently_viewed = isset( $_COOKIE['upspr_recently_viewed'] ) ? 
            json_decode( stripslashes( $_COOKIE['upspr_recently_viewed'] ), true ) : array();

        if ( empty( $recently_viewed ) ) {
            return '';
        }

        $formatted_recommendations = $this->upspr_format_recommendations( $recently_viewed );
        if ( ! empty( $formatted_recommendations ) ) {
            return UPSPR_Location_Display::upspr_get_campaign_html( $this->campaign_data, $formatted_recommendations, 'recently-viewed' );
        }

        return '';
    }

}
