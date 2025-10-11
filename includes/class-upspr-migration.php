<?php
/**
 * Database migration utility
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class UPSPR_Migration {

    /**
     * Run database migrations
     */
    public static function upspr_run_migrations() {
        $current_version = get_option( 'upspr_db_version', '1.0.0' );
        $target_version = '2.2.0'; // Incremented to force migration for analytics table

        if ( version_compare( $current_version, $target_version, '<' ) ) {
            self::upspr_migrate_to_v2();
            self::upspr_migrate_to_v2_2(); // Add analytics table
            update_option( 'upspr_db_version', $target_version );
        }
    }

    /**
     * Migrate to version 2.0 - Add organized data columns
     */
    private static function upspr_migrate_to_v2() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'upspr_recommendation_campaigns';
        
        // Check if new columns exist
        $columns = $wpdb->get_results( "DESCRIBE {$table_name}" );
        $column_names = array_column( $columns, 'Field' );
        
        $new_columns = array( 'basic_info', 'filters', 'amplifiers', 'personalization', 'visibility' );
        
        foreach ( $new_columns as $column ) {
            if ( ! in_array( $column, $column_names ) ) {
                $wpdb->query( "ALTER TABLE {$table_name} ADD COLUMN {$column} longtext AFTER status" );
            }
        }
        
        // Remove old/duplicate columns that shouldn't exist
        $old_columns_to_remove = array(
            'display_location', 'max_products', 'widget_settings', 
            'include_filters', 'exclude_filters', 'amplifier_settings',
            'personalization_settings', 'visibility_settings',
            'views', 'clicks', 'conversions', 'revenue'
        );
        
        foreach ( $old_columns_to_remove as $column ) {
            if ( in_array( $column, $column_names ) ) {
                $wpdb->query( "ALTER TABLE {$table_name} DROP COLUMN {$column}" );
            }
        }
        
        // Migrate existing form_data to new organized structure
        $campaigns = $wpdb->get_results( "SELECT id, form_data FROM {$table_name} WHERE form_data IS NOT NULL AND form_data != ''" );
        
        foreach ( $campaigns as $campaign ) {
            $form_data = json_decode( $campaign->form_data, true );
            
            if ( ! empty( $form_data ) && is_array( $form_data ) ) {
                // Organize data into 5 tabs
                $basic_info = array(
                    'ruleName' => isset( $form_data['ruleName'] ) ? $form_data['ruleName'] : '',
                    'description' => isset( $form_data['description'] ) ? $form_data['description'] : '',
                    'recommendationType' => isset( $form_data['recommendationType'] ) ? $form_data['recommendationType'] : '',
                    'displayLocation' => isset( $form_data['displayLocation'] ) ? $form_data['displayLocation'] : '',
                    'hookLocation' => isset( $form_data['hookLocation'] ) ? $form_data['hookLocation'] : '',
                    'numberOfProducts' => isset( $form_data['numberOfProducts'] ) ? $form_data['numberOfProducts'] : '',
                    'priority' => isset( $form_data['priority'] ) ? $form_data['priority'] : '',
                    'showProductPrices' => isset( $form_data['showProductPrices'] ) ? $form_data['showProductPrices'] : true,
                    'showProductRatings' => isset( $form_data['showProductRatings'] ) ? $form_data['showProductRatings'] : true,
                    'showAddToCartButton' => isset( $form_data['showAddToCartButton'] ) ? $form_data['showAddToCartButton'] : true,
                    'showProductCategory' => isset( $form_data['showProductCategory'] ) ? $form_data['showProductCategory'] : true,
                );

                $filters = array(
                    'includeCategories' => isset( $form_data['includeCategories'] ) ? $form_data['includeCategories'] : array(),
                    'includeTags' => isset( $form_data['includeTags'] ) ? $form_data['includeTags'] : array(),
                    'priceRange' => isset( $form_data['priceRange'] ) ? $form_data['priceRange'] : array( 'min' => '', 'max' => '' ),
                    'stockStatus' => isset( $form_data['stockStatus'] ) ? $form_data['stockStatus'] : 'any',
                    'productType' => isset( $form_data['productType'] ) ? $form_data['productType'] : 'any',
                    'brands' => isset( $form_data['brands'] ) ? $form_data['brands'] : array(),
                    'attributes' => isset( $form_data['attributes'] ) ? $form_data['attributes'] : array(),
                    'excludeProducts' => isset( $form_data['excludeProducts'] ) ? $form_data['excludeProducts'] : array(),
                    'excludeCategories' => isset( $form_data['excludeCategories'] ) ? $form_data['excludeCategories'] : array(),
                    'excludeSaleProducts' => isset( $form_data['excludeSaleProducts'] ) ? $form_data['excludeSaleProducts'] : false,
                    'excludeFeaturedProducts' => isset( $form_data['excludeFeaturedProducts'] ) ? $form_data['excludeFeaturedProducts'] : false,
                );

                $amplifiers = array(
                    'salesPerformanceBoost' => isset( $form_data['salesPerformanceBoost'] ) ? $form_data['salesPerformanceBoost'] : false,
                    'salesBoostFactor' => isset( $form_data['salesBoostFactor'] ) ? $form_data['salesBoostFactor'] : 'medium',
                    'salesTimePeriod' => isset( $form_data['salesTimePeriod'] ) ? $form_data['salesTimePeriod'] : 'last-30-days',
                    'inventoryLevelBoost' => isset( $form_data['inventoryLevelBoost'] ) ? $form_data['inventoryLevelBoost'] : false,
                    'inventoryBoostType' => isset( $form_data['inventoryBoostType'] ) ? $form_data['inventoryBoostType'] : '',
                    'inventoryThreshold' => isset( $form_data['inventoryThreshold'] ) ? $form_data['inventoryThreshold'] : '',
                    'seasonalTrendingBoost' => isset( $form_data['seasonalTrendingBoost'] ) ? $form_data['seasonalTrendingBoost'] : false,
                    'trendingKeywords' => isset( $form_data['trendingKeywords'] ) ? $form_data['trendingKeywords'] : array(),
                    'trendingDuration' => isset( $form_data['trendingDuration'] ) ? $form_data['trendingDuration'] : '',
                );

                $personalization = array(
                    'purchaseHistoryBased' => isset( $form_data['purchaseHistoryBased'] ) ? $form_data['purchaseHistoryBased'] : false,
                    'purchaseHistoryPeriod' => isset( $form_data['purchaseHistoryPeriod'] ) ? $form_data['purchaseHistoryPeriod'] : 'last-90-days',
                    'purchaseHistoryWeight' => isset( $form_data['purchaseHistoryWeight'] ) ? $form_data['purchaseHistoryWeight'] : 'high',
                    'browsingBehavior' => isset( $form_data['browsingBehavior'] ) ? $form_data['browsingBehavior'] : false,
                    'recentlyViewedWeight' => isset( $form_data['recentlyViewedWeight'] ) ? $form_data['recentlyViewedWeight'] : 'medium',
                    'timeOnPageWeight' => isset( $form_data['timeOnPageWeight'] ) ? $form_data['timeOnPageWeight'] : 'medium',
                    'searchHistoryWeight' => isset( $form_data['searchHistoryWeight'] ) ? $form_data['searchHistoryWeight'] : 'high',
                    'customerSegmentation' => isset( $form_data['customerSegmentation'] ) ? $form_data['customerSegmentation'] : false,
                    'customerType' => isset( $form_data['customerType'] ) ? $form_data['customerType'] : 'all-customers',
                    'spendingTier' => isset( $form_data['spendingTier'] ) ? $form_data['spendingTier'] : 'any-tier',
                    'collaborativeFiltering' => isset( $form_data['collaborativeFiltering'] ) ? $form_data['collaborativeFiltering'] : false,
                    'similarUsersCount' => isset( $form_data['similarUsersCount'] ) ? $form_data['similarUsersCount'] : '',
                    'similarityThreshold' => isset( $form_data['similarityThreshold'] ) ? $form_data['similarityThreshold'] : 'medium',
                );

                $visibility = array(
                    'startDate' => isset( $form_data['startDate'] ) ? $form_data['startDate'] : '',
                    'endDate' => isset( $form_data['endDate'] ) ? $form_data['endDate'] : '',
                    'daysOfWeek' => isset( $form_data['daysOfWeek'] ) ? $form_data['daysOfWeek'] : array(
                        'monday' => true,
                        'tuesday' => true,
                        'wednesday' => true,
                        'thursday' => true,
                        'friday' => true,
                        'saturday' => true,
                        'sunday' => true,
                    ),
                    'timeRange' => isset( $form_data['timeRange'] ) ? $form_data['timeRange'] : array( 'start' => '12:00 AM', 'end' => '11:59 PM' ),
                    'userLoginStatus' => isset( $form_data['userLoginStatus'] ) ? $form_data['userLoginStatus'] : 'any-user',
                    'userRoles' => isset( $form_data['userRoles'] ) ? $form_data['userRoles'] : 'all-roles',
                    'minimumOrders' => isset( $form_data['minimumOrders'] ) ? $form_data['minimumOrders'] : '',
                    'minimumSpent' => isset( $form_data['minimumSpent'] ) ? $form_data['minimumSpent'] : '',
                    'deviceType' => isset( $form_data['deviceType'] ) ? $form_data['deviceType'] : array(
                        'desktop' => true,
                        'tablet' => true,
                        'mobile' => true,
                    ),
                    'cartValueRange' => isset( $form_data['cartValueRange'] ) ? $form_data['cartValueRange'] : array( 'min' => '', 'max' => '' ),
                    'cartItemsCount' => isset( $form_data['cartItemsCount'] ) ? $form_data['cartItemsCount'] : array( 'min' => '', 'max' => '' ),
                    'requiredProductsInCart' => isset( $form_data['requiredProductsInCart'] ) ? $form_data['requiredProductsInCart'] : array(),
                    'requiredCategoriesInCart' => isset( $form_data['requiredCategoriesInCart'] ) ? $form_data['requiredCategoriesInCart'] : array(),
                );

                // Update campaign with organized data
                $wpdb->update(
                    $table_name,
                    array(
                        'basic_info' => wp_json_encode( $basic_info ),
                        'filters' => wp_json_encode( $filters ),
                        'amplifiers' => wp_json_encode( $amplifiers ),
                        'personalization' => wp_json_encode( $personalization ),
                        'visibility' => wp_json_encode( $visibility ),
                    ),
                    array( 'id' => $campaign->id ),
                    array( '%s', '%s', '%s', '%s', '%s' ),
                    array( '%d' )
                );
            }
        }
    }

    /**
     * Migrate to version 2.2 - Add analytics table for date-based tracking
     */
    private static function upspr_migrate_to_v2_2() {
        global $wpdb;

        $analytics_table = $wpdb->prefix . 'upspr_analytics';
        $charset_collate = $wpdb->get_charset_collate();

        // Create analytics table
        $sql = "CREATE TABLE IF NOT EXISTS {$analytics_table} (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            campaign_id bigint(20) NOT NULL,
            event_type varchar(20) NOT NULL,
            product_id bigint(20) DEFAULT NULL,
            revenue decimal(10,2) DEFAULT 0,
            event_date date NOT NULL,
            event_datetime datetime NOT NULL,
            PRIMARY KEY (id),
            KEY campaign_id (campaign_id),
            KEY event_type (event_type),
            KEY event_date (event_date),
            KEY campaign_date (campaign_id, event_date),
            KEY campaign_type_date (campaign_id, event_type, event_date)
        ) $charset_collate;";

        require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
        dbDelta( $sql );

        // Clean up old performance data - remove unnecessary fields
        $campaigns_table = $wpdb->prefix . 'upspr_recommendation_campaigns';
        $campaigns = $wpdb->get_results( "SELECT id, performance_data FROM {$campaigns_table} WHERE performance_data IS NOT NULL AND performance_data != ''" );

        foreach ( $campaigns as $campaign ) {
            $performance = json_decode( $campaign->performance_data, true );

            if ( ! empty( $performance ) && is_array( $performance ) ) {
                // Keep only essential summary fields
                $cleaned_performance = array(
                    'impressions' => isset( $performance['impressions'] ) ? $performance['impressions'] : 0,
                    'clicks' => isset( $performance['clicks'] ) ? $performance['clicks'] : 0,
                    'conversions' => isset( $performance['conversions'] ) ? $performance['conversions'] : 0,
                    'revenue' => isset( $performance['revenue'] ) ? $performance['revenue'] : 0,
                    'product_clicks' => isset( $performance['product_clicks'] ) ? $performance['product_clicks'] : array(),
                    'product_conversions' => isset( $performance['product_conversions'] ) ? $performance['product_conversions'] : array()
                );

                // Update with cleaned data
                $wpdb->update(
                    $campaigns_table,
                    array( 'performance_data' => wp_json_encode( $cleaned_performance ) ),
                    array( 'id' => $campaign->id ),
                    array( '%s' ),
                    array( '%d' )
                );
            }
        }
    }
}
