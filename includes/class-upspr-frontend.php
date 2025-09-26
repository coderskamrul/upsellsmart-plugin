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
        $this->init();
    }

    /**
     * Initialize
     */
    private function init() {
        // Enqueue frontend scripts and styles
        add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_frontend_scripts' ) );
    }

    /**
     * Enqueue frontend scripts
     */
    public function enqueue_frontend_scripts() {
        // Only load on WooCommerce pages
        if ( ! is_woocommerce() && ! is_cart() && ! is_checkout() ) {
            return;
        }

        wp_enqueue_style(
            'upspr-frontend',
            UPSPR_PLUGIN_URL . 'css/frontend.css',
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

        wp_enqueue_script(
            'upspr-frontend',
            UPSPR_PLUGIN_URL . 'js/frontend.js',
            array( 'jquery' ),
            UPSPR_VERSION,
            true
        );
    }
}
