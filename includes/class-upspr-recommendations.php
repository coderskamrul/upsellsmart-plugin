<?php
/**
 * Recommendations Engine
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class UPSPR_Recommendations {

    /**
     * Instance
     */
    private static $instance = null;

    /**
     * Get instance
     */
    public static function get_instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor
     */
    private function __construct() {
        // Initialize recommendations engine
        $this->init();
    }

    /**
     * Get database instance
     */
    private function get_database() {
        return UPSPR_Database::get_instance();
    }

    /**
     * Initialize
     */
    private function init() {
        // Add hooks for recommendation display
        add_action( 'woocommerce_single_product_summary', array( $this, 'display_product_recommendations' ), 25 );
        add_action( 'woocommerce_after_cart_table', array( $this, 'display_cart_recommendations' ) );
    }

    /**
     * Display product page recommendations
     */
    public function display_product_recommendations() {
        // Get active campaigns for product page
        $campaigns = $this->get_campaigns_for_location( 'product-page' );
        //echo '<pre>'; print_r('ndvhdsnv'); echo '</pre>';
        //echo 'a<pre>'; print_r($campaigns); echo '</pre>';
        if ( empty( $campaigns ) ) {
            return;
        }
        // TODO: Process and display campaigns
        // For now, we'll output a placeholder for each campaign
        foreach ( $campaigns as $campaign ) {
            echo 'a<pre>'; print_r($campaign['name']); echo '</pre>';
            // TODO: Implement actual campaign rendering logic
        }
    }

    /**
     * Display cart page recommendations
     */
    public function display_cart_recommendations() {
        // Get active campaigns for cart page
        $campaigns = $this->get_campaigns_for_location( 'cart-page' );
        
        if ( empty( $campaigns ) ) {
            return;
        }

        // TODO: Process and display campaigns
        // For now, we'll output a placeholder for each campaign
        foreach ( $campaigns as $campaign ) {
            echo '<!-- UpsellSmart Campaign: ' . esc_html( $campaign['name'] ) . ' (ID: ' . intval( $campaign['id'] ) . ') -->';
            // TODO: Implement actual campaign rendering logic
        }
    }

    /**
     * Get recommendations for a product
     */
    public function get_product_recommendations( $product_id, $campaign_type = 'cross-sell', $limit = 4 ) {
        // TODO: Implement recommendation logic
        // This will use the campaign rules to generate recommendations
        return array();
    }

    /**
     * Get all active campaigns
     *
     * @param string $location Optional. Filter by location (e.g., 'product-page', 'cart-page')
     * @param string $type Optional. Filter by campaign type (e.g., 'cross-sell', 'upsell', 'related')
     * @return array Array of active campaigns
     */
    public function get_active_campaigns( $location = '', $type = '' ) {
        $database = $this->get_database();
        
        $args = array(
            'status' => 'active',
            'orderby' => 'priority',
            'order' => 'ASC',
            'limit' => 100 // Set a reasonable limit
        );

        // Filter by location if specified
        if ( ! empty( $location ) ) {
            $args['location'] = $location;
        }

        // Filter by type if specified
        if ( ! empty( $type ) ) {
            $args['type'] = $type;
        }

        return $database->get_campaigns( $args );
    }

    /**
     * Get active campaigns for specific location
     *
     * @param string $location The location to get campaigns for
     * @return array Array of active campaigns for the location
     */
    public function get_campaigns_for_location( $location ) {
        return $this->get_active_campaigns( $location );
    }

    /**
     * Get active campaigns by type
     *
     * @param string $type The campaign type to get campaigns for
     * @return array Array of active campaigns of the specified type
     */
    public function get_campaigns_by_type( $type ) {
        return $this->get_active_campaigns( '', $type );
    }
}