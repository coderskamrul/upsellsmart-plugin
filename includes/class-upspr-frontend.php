<?php
/**
 * Frontend display functionality
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class UPSPR_Frontend {

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
        $this->upspr_init();
    }

    /**
     * Initialize
     */
    private function upspr_init() {
        // Enqueue frontend scripts and styles
        add_action( 'wp_enqueue_scripts', array( $this, 'upspr_enqueue_frontend_scripts' ) );

        // Initialize AJAX tracking handlers immediately
        if ( class_exists( 'UPSPR_Performance_Tracker' ) ) {
            UPSPR_Performance_Tracker::upspr_init_ajax_tracking();
        }
    }

    /**
     * Enqueue frontend scripts
     */
    public function upspr_enqueue_frontend_scripts() {
        // Only load on WooCommerce pages
        if ( ! is_woocommerce() && ! is_cart() && ! is_checkout() ) {
            return;
        }

        wp_enqueue_style(
            'upspr-frontend',
            UPSPR_PLUGIN_URL . 'assets/dist/css/frontend.css',
            array(),
            UPSPR_VERSION
        );

        // Enqueue campaign widgets CSS
        wp_enqueue_style(
            'upspr-campaign-widgets',
            UPSPR_PLUGIN_URL . 'assets/css/campaign-widgets.css',
            array(),
            UPSPR_VERSION
        );

        // Enqueue campaign tracking JavaScript
        wp_enqueue_script(
            'upspr-campaign-tracking',
            UPSPR_PLUGIN_URL . 'assets/dist/js/frontend.js',
            array( 'jquery' ),
            UPSPR_VERSION,
            true
        );

        // Localize script for AJAX tracking
        wp_localize_script( 'upspr-campaign-tracking', 'upspr_frontend', array(
            'ajax_url' => admin_url( 'admin-ajax.php' ),
            'nonce' => wp_create_nonce( 'upspr_tracking_nonce' ),
            'rest_url' => rest_url( 'upspr/v1/' ),
            'track_events' => true
        ) );
    }
}
