<?php
/**
 * Settings management
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class UPSPR_Settings {

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
        // Initialize settings
        add_action( 'admin_init', array( $this, 'register_settings' ) );
    }

    /**
     * Register settings
     */
    public function register_settings() {
        // Register plugin settings
        register_setting( 'upspr_settings', 'upspr_settings' );

        // Add settings sections and fields
        add_settings_section(
            'upspr_general_settings',
            __( 'General Settings', 'upsellsmart-product-recommendations' ),
            array( $this, 'general_settings_callback' ),
            'upspr_settings'
        );

        add_settings_field(
            'enable_recommendations',
            __( 'Enable Recommendations', 'upsellsmart-product-recommendations' ),
            array( $this, 'enable_recommendations_callback' ),
            'upspr_settings',
            'upspr_general_settings'
        );
    }

    /**
     * General settings section callback
     */
    public function general_settings_callback() {
        echo '<p>' . __( 'Configure general settings for UpSellSmart recommendations.', 'upsellsmart-product-recommendations' ) . '</p>';
    }

    /**
     * Enable recommendations field callback
     */
    public function enable_recommendations_callback() {
        $options = get_option( 'upspr_settings', array() );
        $enabled = isset( $options['enable_recommendations'] ) ? $options['enable_recommendations'] : true;

        echo '<input type="checkbox" name="upspr_settings[enable_recommendations]" value="1" ' . checked( 1, $enabled, false ) . ' />';
        echo '<label for="upspr_settings[enable_recommendations]">' . __( 'Enable product recommendations', 'upsellsmart-product-recommendations' ) . '</label>';
    }

    /**
     * Get setting value
     */
    public function get_setting( $key, $default = null ) {
        $options = get_option( 'upspr_settings', array() );
        return isset( $options[ $key ] ) ? $options[ $key ] : $default;
    }
}