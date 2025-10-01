<?php
/**
 * Upsell Campaign Engine
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

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
       // echo 'k<pre>'; print_r('upsell'); echo '</pre>';
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

        // Get current product ID
        $current_product_id = $this->upspr_get_current_product_id();
        if ( ! $current_product_id ) {
            return false;
        }

        // Get upsell recommendations based on campaign rules
        $recommendations = $this->upspr_get_upsell_recommendations( $current_product_id );
        $formatted_recommendations = $this->upspr_format_recommendations( $recommendations );

        // Display the campaign using the location display system
        if ( ! empty( $formatted_recommendations ) ) {
            UPSPR_Location_Display::upspr_display_campaign( $this->campaign_data, $formatted_recommendations, 'upsell' );
        }

        return $formatted_recommendations;
    }

    /**
     * Get current product ID
     *
     * @return int|false Product ID or false if not found
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
     * Get upsell recommendations
     *
     * @param int $product_id Current product ID
     * @return array Array of recommended product IDs
     */
    private function upspr_get_upsell_recommendations( $product_id ) {
       
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

        foreach ( $product_ids as $product_id ) {
            $product = wc_get_product( $product_id );
            if ( $product ) {
                $formatted[] = array(
                    'id' => $product_id,
                    'name' => $product->get_name(),
                    'price' => $product->get_price(),
                    'regular_price' => $product->get_regular_price(),
                    'sale_price' => $product->get_sale_price(),
                    'image' => wp_get_attachment_image_src( $product->get_image_id(), 'thumbnail' ),
                    'url' => $product->get_permalink(),
                    'savings' => $this->calculate_savings( $product ),
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

        $current_product_id = $this->upspr_get_current_product_id();
        if ( ! $current_product_id ) {
            return '';
        }

        $recommendations = $this->upspr_get_upsell_recommendations( $current_product_id );
        if ( empty( $recommendations ) ) {
            return '';
        }

        $formatted_recommendations = $this->upspr_format_recommendations( $recommendations );
        if ( ! empty( $formatted_recommendations ) ) {
            return UPSPR_Location_Display::upspr_get_campaign_html( $this->campaign_data, $formatted_recommendations, 'upsell' );
        }

        return '';
    }

}
