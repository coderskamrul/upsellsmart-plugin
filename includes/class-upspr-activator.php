<?php
/**
 * Plugin Activator
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class UPSPR_Activator {

    /**
     * Activate plugin
     */
    public static function upspr_activate() {
        // Create database tables
        if ( ! class_exists( 'UPSPR_Database' ) ) {
            require_once UPSPR_PLUGIN_PATH . 'includes/class-upspr-database.php';
        }
        UPSPR_Database::get_instance();

        // Set default options
        self::upspr_set_default_options();

        // Flush rewrite rules
        flush_rewrite_rules();
    }

    /**
     * Set default options
     */
    private static function upspr_set_default_options() {
        $default_options = array(
            'upspr_version' => UPSPR_VERSION,
            'upspr_db_version' => '1.0.0',
            'upspr_settings' => array(
                'enable_recommendations' => true,
                'default_products_count' => 4,
                'cache_duration' => 3600
            )
        );

        foreach ( $default_options as $option_name => $option_value ) {
            if ( ! get_option( $option_name ) ) {
                add_option( $option_name, $option_value );
            }
        }
    }
}