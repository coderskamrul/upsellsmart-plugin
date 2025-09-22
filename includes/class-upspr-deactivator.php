<?php
/**
 * Plugin Deactivator
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class UPSPR_Deactivator {

    /**
     * Deactivate plugin
     */
    public static function upspr_deactivate() {
        // Clear any scheduled events
        wp_clear_scheduled_hook( 'upspr_cleanup_expired_campaigns' );

        // Flush rewrite rules
        flush_rewrite_rules();

        // Clear any cached data
        wp_cache_flush();
    }
}
