<?php
/**
 * Frequently Bought Together Campaign Engine
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class UPSPR_Frequently_Bought_Together {

    /**
     * Campaign data
     */
    private $campaign_data;

    /**
     * Constructor
     */
    public function __construct( $campaign_data = array() ) {
        $this->campaign_data = $campaign_data;
    }

    /**
     * Process frequently bought together campaign
     */
    public function upspr_process() {
        if ( empty( $this->campaign_data ) ) {
            return false;
        }

        $current_product_id = $this->upspr_get_current_product_id();
        if ( ! $current_product_id ) {
            return false;
        }

        $recommendations = $this->upspr_get_frequently_bought_together( $current_product_id );
        $formatted_recommendations = $this->upspr_format_recommendations( $recommendations );

        return $formatted_recommendations;
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
     * Get frequently bought together recommendations
     */
    private function upspr_get_frequently_bought_together( $product_id ) {
        $recommendations = array();
        
        return $recommendations;
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

        $recommendations = $this->upspr_get_frequently_bought_together( $current_product_id );
        if ( empty( $recommendations ) ) {
            return '';
        }

        $formatted_recommendations = $this->upspr_format_recommendations( $recommendations );
        if ( ! empty( $formatted_recommendations ) ) {
            return UPSPR_Location_Display::upspr_get_campaign_html( $this->campaign_data, $formatted_recommendations, 'frequently-bought-together' );
        }

        return '';
    }

}
