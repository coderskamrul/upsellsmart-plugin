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
        $this->campaign_data = $campaign_data;
    }

    /**
     * Process trending products campaign
     */
    public function upspr_process() {
        if ( empty( $this->campaign_data ) ) {
            return false;
        }

        $recommendations = $this->upspr_get_trending_products();
        $formatted_recommendations = $this->upspr_format_recommendations( $recommendations );

        // Display the campaign using the location display system
        if ( ! empty( $formatted_recommendations ) ) {
            UPSPR_Location_Display::upspr_display_campaign( $this->campaign_data, $formatted_recommendations, 'trending-products' );
        }

        return $formatted_recommendations;
    }

    /**
     * Get trending products
     */
    private function upspr_get_trending_products() {
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
                    'rating' => $product->get_average_rating(),
                    'sales_count' => $this->get_product_sales_count( $product_id ),
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

        $trending_products = $this->upspr_get_trending_products();
        if ( empty( $trending_products ) ) {
            return '';
        }

        $formatted_recommendations = $this->upspr_format_recommendations( $trending_products );
        if ( ! empty( $formatted_recommendations ) ) {
            return UPSPR_Location_Display::upspr_get_campaign_html( $this->campaign_data, $formatted_recommendations, 'trending-products' );
        }

        return '';
    }

}
