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
        $this->init_hooks();
    }

    /**
     * Initialize hooks
     */
    private function init_hooks() {
        // Track product views
        add_action( 'woocommerce_single_product_summary', array( $this, 'track_product_view' ), 5 );
    }

    /**
     * Track product view
     */
    public function track_product_view() {
        global $product;
        
        if ( ! $product ) {
            return;
        }

        $product_id = $product->get_id();
        $recently_viewed = $this->get_recently_viewed_products();
        
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
    public function process() {
        if ( empty( $this->campaign_data ) ) {
            return false;
        }

        $recently_viewed = [];

        if ( empty( $recently_viewed ) ) {
            return false;
        }

        $recommendations = $this->get_recently_viewed_recommendations( $recently_viewed );
        $formatted_recommendations = $this->format_recommendations( $recommendations );

        // Display the campaign using the location display system
        if ( ! empty( $formatted_recommendations ) ) {
            UPSPR_Location_Display::display_campaign( $this->campaign_data, $formatted_recommendations, 'recently-viewed' );
        }

        return $formatted_recommendations;
    }

    /**
     * Get recently viewed recommendations
     */
    private function get_recently_viewed_recommendations( $recently_viewed ) {
        $recommendations = array();

        return $recommendations;
    }

    /**
     * Get current product ID
     */
    private function get_current_product_id() {
        global $product;
        
        if ( is_product() && $product ) {
            return $product->get_id();
        }
        return false;
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
                    'stock_status' => $product->get_stock_status(),
                );
            }
        }

        return $formatted;
    }

}
