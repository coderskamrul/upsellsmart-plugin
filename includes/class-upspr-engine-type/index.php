<?php
/**
 * Campaign Engine Types Index
 * 
 * This file loads all campaign engine type classes and provides
 * easy access to the campaign factory.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Load the location display system first
require_once __DIR__ . '/class-upspr-location-display.php';

// Load the campaign factory
require_once __DIR__ . '/class-upspr-campaign-factory.php';

// Load helper classes first
require_once __DIR__ . '/Helper/class-upspr-performance-tracker.php';

// Load all campaign type classes
require_once __DIR__ . '/class-upspr-cross-sell.php';
require_once __DIR__ . '/class-upspr-upsell.php';
require_once __DIR__ . '/class-upspr-related-products.php';
require_once __DIR__ . '/class-upspr-frequently-bought-together.php';
require_once __DIR__ . '/class-upspr-personalized-recommendations.php';
require_once __DIR__ . '/class-upspr-trending-products.php';
require_once __DIR__ . '/class-upspr-recently-viewed.php';

// Load integration classes
require_once __DIR__ . '/class-upspr-cross-sell-integration.php';

/**
 * Helper function to get campaign factory instance
 *
 * @return UPSPR_Campaign_Factory
 */
function upspr_get_campaign_factory() {
    return new UPSPR_Campaign_Factory();
}

/**
 * Helper function to display campaign at specific location
 *
 * @param array $campaign_data Campaign data with basic_info containing displayLocation and hookLocation
 * @param array $recommendations Array of formatted product recommendations
 * @param string $campaign_type Campaign type (cross-sell, upsell, etc.)
 * @return bool True if displayed successfully, false otherwise
 */
function upspr_display_campaign_at_location( $campaign_data, $recommendations, $campaign_type = '' ) {
    return UPSPR_Location_Display::display_campaign( $campaign_data, $recommendations, $campaign_type );
}

/**
 * Helper function to get available hooks for a display location
 *
 * @param string $display_location Display location (home-page, product-page, etc.)
 * @return array Available hooks for the location
 */
function upspr_get_location_hooks( $display_location ) {
    return UPSPR_Location_Display::get_hooks_for_location( $display_location );
}

/**
 * Helper function to get default hook for a display location
 *
 * @param string $display_location Display location
 * @return string Default hook location
 */
function upspr_get_default_hook( $display_location ) {
    return UPSPR_Location_Display::get_default_hook( $display_location );
}

/**
 * Helper function to validate campaign data for location display
 *
 * @param array $campaign_data Campaign data
 * @return bool True if valid, false otherwise
 */
function upspr_validate_campaign_location( $campaign_data ) {
    return UPSPR_Location_Display::validate_campaign_data( $campaign_data );
}

/**
 * Helper function to create a campaign instance
 * 
 * @param array $campaign_data Campaign data
 * @return object|false Campaign instance or false on failure
 */
function upspr_create_campaign( $campaign_data ) {
    return UPSPR_Campaign_Factory::create_campaign( $campaign_data );
}

/**
 * Helper function to render campaigns
 * 
 * @param array $campaigns Array of campaign data
 * @return string HTML output
 */
function upspr_render_campaigns( $campaigns ) {
    return UPSPR_Campaign_Factory::render_campaigns( $campaigns );
}

/**
 * Helper function to get available campaign types
 * 
 * @return array Available campaign types
 */
function upspr_get_campaign_types() {
    return UPSPR_Campaign_Factory::get_available_types();
}

/**
 * Helper function to get campaign type labels
 * 
 * @return array Campaign type labels
 */
function upspr_get_campaign_type_labels() {
    return UPSPR_Campaign_Factory::get_type_labels();
}

/**
 * Helper function to get campaign type descriptions
 * 
 * @return array Campaign type descriptions
 */
function upspr_get_campaign_type_descriptions() {
    return UPSPR_Campaign_Factory::get_type_descriptions();
}
