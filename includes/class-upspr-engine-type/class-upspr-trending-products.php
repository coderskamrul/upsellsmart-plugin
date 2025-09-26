<?php
/**
 * Trending Products Campaign Engine
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class UPSPR_Trending_Products {

    /**
     * Campaign data
     */
    private $campaign_data;

    /**
     * Constructor
     */
    public function __construct( $campaign_data = array() ) {
        echo 'kxx<pre>'; print_r('trending-products'); echo '</pre>';
        $this->campaign_data = $campaign_data;
    }

    /**
     * Process trending products campaign
     */
    public function process() {
        if ( empty( $this->campaign_data ) ) {
            return false;
        }

        $recommendations = $this->get_trending_products();
        return $this->format_recommendations( $recommendations );
    }

    /**
     * Get trending products
     */
    private function get_trending_products() {
        $recommendations = array();

        return $recommendations;
    }

    /**
     * Format recommendations
     */
    private function format_recommendations( $product_ids ) {
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
                    'rating' => $product->get_average_rating(),
                    'sales_count' => $this->get_product_sales_count( $product_id ),
                );
            }
        }

        return $formatted;
    }

}
