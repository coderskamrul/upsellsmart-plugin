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

// Load the campaign factory first
require_once __DIR__ . '/class-upspr-campaign-factory.php';

// Load all campaign type classes
require_once __DIR__ . '/class-upspr-cross-sell.php';
require_once __DIR__ . '/class-upspr-upsell.php';
require_once __DIR__ . '/class-upspr-related-products.php';
require_once __DIR__ . '/class-upspr-frequently-bought-together.php';
require_once __DIR__ . '/class-upspr-personalized-recommendations.php';
require_once __DIR__ . '/class-upspr-trending-products.php';
require_once __DIR__ . '/class-upspr-recently-viewed.php';

/**
 * Helper function to get campaign factory instance
 * 
 * @return UPSPR_Campaign_Factory
 */
function upspr_get_campaign_factory() {
    return new UPSPR_Campaign_Factory();
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
