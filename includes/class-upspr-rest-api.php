<?php
/**
 * REST API endpoints
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class UPSPR_REST_API {

    /**
     * Instance
     */
    private static $instance = null;

    /**
     * Database instance
     */
    private $database;

    /**
     * API namespace
     */
    private $namespace = 'upspr/v1';

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
        $this->database = UPSPR_Database::get_instance();
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    /**
     * Register REST API routes
     */
    public function register_routes() {
        // Get all campaigns
        register_rest_route( $this->namespace, '/campaigns', array(
            'methods' => 'GET',
            'callback' => array( $this, 'get_campaigns' ),
            'permission_callback' => array( $this, 'check_admin_permissions' ),
            'args' => array(
                'status' => array(
                    'type' => 'string',
                    'enum' => array( 'active', 'inactive' ),
                    'sanitize_callback' => 'sanitize_text_field'
                ),
                'type' => array(
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field'
                ),
                'page' => array(
                    'type' => 'integer',
                    'default' => 1,
                    'minimum' => 1
                ),
                'per_page' => array(
                    'type' => 'integer',
                    'default' => 20,
                    'minimum' => 1,
                    'maximum' => 100
                )
            )
        ) );

        // Create campaign
        register_rest_route( $this->namespace, '/campaigns', array(
            'methods' => 'POST',
            'callback' => array( $this, 'create_campaign' ),
            'permission_callback' => array( $this, 'check_admin_permissions' ),
            'args' => array(
                'name' => array(
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field'
                ),
                'description' => array(
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_textarea_field'
                ),
                'type' => array(
                    'required' => true,
                    'type' => 'string',
                    'enum' => array( 'cross-sell', 'upsell', 'related', 'bundle', 'personalized' ),
                    'sanitize_callback' => 'sanitize_text_field'
                ),
                'location' => array(
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field'
                ),
                'products_count' => array(
                    'type' => 'integer',
                    'default' => 4,
                    'minimum' => 1,
                    'maximum' => 20
                ),
                'priority' => array(
                    'type' => 'integer',
                    'default' => 1,
                    'minimum' => 1,
                    'maximum' => 10
                ),
                'status' => array(
                    'type' => 'string',
                    'enum' => array( 'active', 'inactive' ),
                    'default' => 'active',
                    'sanitize_callback' => 'sanitize_text_field'
                ),
                'form_data' => array(
                    'type' => 'object'
                ),
                'basic_info' => array(
                    'type' => 'object'
                ),
                'filters' => array(
                    'type' => 'object'
                ),
                'amplifiers' => array(
                    'type' => 'object'
                ),
                'personalization' => array(
                    'type' => 'object'
                ),
                'visibility' => array(
                    'type' => 'object'
                ),
                'performance' => array(
                    'type' => 'object'
                )
            )
        ) );

        // Get single campaign
        register_rest_route( $this->namespace, '/campaigns/(?P<id>\d+)', array(
            'methods' => 'GET',
            'callback' => array( $this, 'get_campaign' ),
            'permission_callback' => array( $this, 'check_admin_permissions' ),
            'args' => array(
                'id' => array(
                    'required' => true,
                    'type' => 'integer',
                    'sanitize_callback' => 'absint'
                )
            )
        ) );

        // Update campaign
        register_rest_route( $this->namespace, '/campaigns/(?P<id>\d+)', array(
            'methods' => 'PUT',
            'callback' => array( $this, 'update_campaign' ),
            'permission_callback' => array( $this, 'check_admin_permissions' ),
            'args' => array(
                'id' => array(
                    'required' => true,
                    'type' => 'integer',
                    'sanitize_callback' => 'absint'
                ),
                'name' => array(
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field'
                ),
                'description' => array(
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_textarea_field'
                ),
                'type' => array(
                    'type' => 'string',
                    'enum' => array( 'cross-sell', 'upsell', 'related', 'bundle', 'personalized' ),
                    'sanitize_callback' => 'sanitize_text_field'
                ),
                'location' => array(
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field'
                ),
                'products_count' => array(
                    'type' => 'integer',
                    'minimum' => 1,
                    'maximum' => 20
                ),
                'priority' => array(
                    'type' => 'integer',
                    'minimum' => 1,
                    'maximum' => 10
                ),
                'status' => array(
                    'type' => 'string',
                    'enum' => array( 'active', 'inactive' ),
                    'sanitize_callback' => 'sanitize_text_field'
                ),
                'form_data' => array(
                    'type' => 'object'
                ),
                'basic_info' => array(
                    'type' => 'object'
                ),
                'filters' => array(
                    'type' => 'object'
                ),
                'amplifiers' => array(
                    'type' => 'object'
                ),
                'personalization' => array(
                    'type' => 'object'
                ),
                'visibility' => array(
                    'type' => 'object'
                ),
                'performance' => array(
                    'type' => 'object'
                )
            )
        ) );

        // Delete campaign
        register_rest_route( $this->namespace, '/campaigns/(?P<id>\d+)', array(
            'methods' => 'DELETE',
            'callback' => array( $this, 'delete_campaign' ),
            'permission_callback' => array( $this, 'check_admin_permissions' ),
            'args' => array(
                'id' => array(
                    'required' => true,
                    'type' => 'integer',
                    'sanitize_callback' => 'absint'
                )
            )
        ) );
    }

    /**
     * Check admin permissions
     */
    public function check_admin_permissions() {
        return current_user_can( 'manage_woocommerce' );
    }

    /**
     * Get campaigns
     */
    public function get_campaigns( $request ) {
        $page = $request->get_param( 'page' );
        $per_page = $request->get_param( 'per_page' );
        $status = $request->get_param( 'status' );
        $type = $request->get_param( 'type' );

        $args = array(
            'limit' => $per_page,
            'offset' => ( $page - 1 ) * $per_page,
            'orderby' => 'created_at',
            'order' => 'DESC'
        );

        if ( ! empty( $status ) ) {
            $args['status'] = $status;
        }

        if ( ! empty( $type ) ) {
            $args['type'] = $type;
        }

        $campaigns = $this->database->get_campaigns( $args );
        $total = $this->database->get_campaigns_count( $args );

        $response = rest_ensure_response( $campaigns );
        $response->header( 'X-WP-Total', $total );
        $response->header( 'X-WP-TotalPages', ceil( $total / $per_page ) );

        return $response;
    }

    /**
     * Create campaign
     */
    public function create_campaign( $request ) {
        $data = array(
            'name' => $request->get_param( 'name' ),
            'description' => $request->get_param( 'description' ),
            'type' => $request->get_param( 'type' ),
            'location' => $request->get_param( 'location' ),
            'products_count' => $request->get_param( 'products_count' ),
            'priority' => $request->get_param( 'priority' ),
            'status' => $request->get_param( 'status' ),
            'basic_info' => $request->get_param( 'basic_info' ),
            'filters' => $request->get_param( 'filters' ),
            'amplifiers' => $request->get_param( 'amplifiers' ),
            'personalization' => $request->get_param( 'personalization' ),
            'visibility' => $request->get_param( 'visibility' ),
            'form_data' => $request->get_param( 'form_data' ),
            'performance' => $request->get_param( 'performance' )
        );

        $campaign_id = $this->database->create_campaign( $data );

        if ( is_wp_error( $campaign_id ) ) {
            return $campaign_id;
        }

        $campaign = $this->database->get_campaign( $campaign_id );

        return rest_ensure_response( $campaign );
    }

    /**
     * Get single campaign
     */
    public function get_campaign( $request ) {
        $id = $request->get_param( 'id' );
        $campaign = $this->database->get_campaign( $id );

        if ( ! $campaign ) {
            return new WP_Error( 'campaign_not_found', 'Campaign not found', array( 'status' => 404 ) );
        }

        return rest_ensure_response( $campaign );
    }

    /**
     * Update campaign
     */
    public function update_campaign( $request ) {
        $id = $request->get_param( 'id' );

        // Check if campaign exists
        $existing_campaign = $this->database->get_campaign( $id );
        if ( ! $existing_campaign ) {
            return new WP_Error( 'campaign_not_found', 'Campaign not found', array( 'status' => 404 ) );
        }

        $data = array();
        $params = array( 'name', 'description', 'type', 'location', 'products_count', 'priority', 'status', 'basic_info', 'filters', 'amplifiers', 'personalization', 'visibility', 'form_data', 'performance' );

        foreach ( $params as $param ) {
            $value = $request->get_param( $param );
            if ( $value !== null ) {
                $data[ $param ] = $value;
            }
        }

        $success = $this->database->update_campaign( $id, $data );

        if ( ! $success ) {
            return new WP_Error( 'update_failed', 'Failed to update campaign', array( 'status' => 500 ) );
        }

        $campaign = $this->database->get_campaign( $id );

        return rest_ensure_response( $campaign );
    }

    /**
     * Delete campaign
     */
    public function delete_campaign( $request ) {
        $id = $request->get_param( 'id' );

        // Check if campaign exists
        $existing_campaign = $this->database->get_campaign( $id );
        if ( ! $existing_campaign ) {
            return new WP_Error( 'campaign_not_found', 'Campaign not found', array( 'status' => 404 ) );
        }

        $success = $this->database->delete_campaign( $id );

        if ( ! $success ) {
            return new WP_Error( 'delete_failed', 'Failed to delete campaign', array( 'status' => 500 ) );
        }

        return rest_ensure_response( array( 'deleted' => true, 'id' => $id ) );
    }
}
