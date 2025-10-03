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
    public static function upspr_get_instance() {
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
        $this->upspr_init();
    }

    /**
     * Get database instance
     */
    private function upspr_get_database() {
        return UPSPR_Database::upspr_get_instance();
    }

    /**
     * Initialize
     */
    private function upspr_init() {
        // Load all campaign engine types
        require_once plugin_dir_path( __FILE__ ) . 'class-upspr-engine-type/index.php';

        // Add hooks for recommendation display
       // add_action( 'woocommerce_single_product_summary', array( $this, 'upspr_display_product_recommendations' ), 25 );
        add_action( 'wp', array( $this, 'upspr_display_product_recommendations' ), 20 );
        //$this->upspr_display_product_recommendations();
    }

    /**
     * Display product page recommendations
     */
    public function upspr_display_product_recommendations() {
        // Get active campaigns for product page
        $campaigns = $this->upspr_get_campaigns_for_location( '' );

        if ( empty( $campaigns ) ) {
            return;
        }
        echo '<pre>'; print_r($campaigns[0]['performance']); echo '</pre>';
        echo UPSPR_Campaign_Factory::upspr_render_campaigns( $campaigns );
    }

    /**
     * Get recommendations for a product
     */
    public function upspr_get_product_recommendations( $product_id, $campaign_type = 'cross-sell', $limit = 4 ) {
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
    public function upspr_get_active_campaigns( $location = '', $type = '' ) {
        $database = $this->upspr_get_database();

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

        return $database->upspr_get_campaigns( $args );
    }

    /**
     * Get active campaigns for specific location
     *
     * @param string $location The location to get campaigns for
     * @return array Array of active campaigns for the location
     */
    public function upspr_get_campaigns_for_location( $location ) {
        return $this->upspr_get_active_campaigns( $location );
    }

    /**
     * Get active campaigns by type
     *
     * @param string $type The campaign type to get campaigns for
     * @return array Array of active campaigns of the specified type
     */
    public function upspr_get_campaigns_by_type( $type ) {
        return $this->upspr_get_active_campaigns( '', $type );
    }

    /**
     * Get campaign statistics
     *
     * @return array Campaign statistics
     */
    public function upspr_get_campaign_statistics() {
        $all_campaigns = $this->upspr_get_active_campaigns();
        return UPSPR_Campaign_Factory::upspr_get_campaign_statistics( $all_campaigns );
    }

    /**
     * Process specific campaign
     *
     * @param array $campaign_data Campaign data
     * @return array|false Processed campaign data or false on failure
     */
    public function upspr_process_campaign( $campaign_data ) {
        $campaign_instance = UPSPR_Campaign_Factory::upspr_create_campaign( $campaign_data );

        if ( $campaign_instance ) {
            return $campaign_instance->upspr_process();
        }

        return false;
    }

    /**
     * Render specific campaign
     *
     * @param array $campaign_data Campaign data
     * @return string HTML output
     */
    public function upspr_render_campaign( $campaign_data ) {
        $campaign_instance = UPSPR_Campaign_Factory::upspr_create_campaign( $campaign_data );

        if ( $campaign_instance ) {
            return $campaign_instance->upspr_render();
        }

        return '';
    }
}