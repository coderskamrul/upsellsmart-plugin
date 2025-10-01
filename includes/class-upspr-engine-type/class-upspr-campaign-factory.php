<?php
/**
 * Campaign Factory - Creates campaign type instances
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class UPSPR_Campaign_Factory {

    /**
     * Available campaign types
     */
    private static $campaign_types = array(
        'cross-sell' => 'UPSPR_Cross_Sell',
        'upsell' => 'UPSPR_Upsell',
        'related-products' => 'UPSPR_Related_Products',
        'frequently-bought-together' => 'UPSPR_Frequently_Bought_Together',
        'personalized-recommendations' => 'UPSPR_Personalized_Recommendations',
        'trending-products' => 'UPSPR_Trending_Products',
        'recently-viewed' => 'UPSPR_Recently_Viewed',
    );

    /**
     * Create campaign instance
     *
     * @param array $campaign_data Campaign data including type
     * @return object|false Campaign instance or false on failure
     */
    public static function upspr_create_campaign( $campaign_data ) {
        if ( empty( $campaign_data['type'] ) || $campaign_data['status'] !== 'active' ) {
            return false;
        }

        $campaign_type = $campaign_data['type'];

        if ( ! isset( self::$campaign_types[ $campaign_type ] ) ) {
            return false;
        }

        $class_name = self::$campaign_types[ $campaign_type ];

        // Load the class file if not already loaded
        self::upspr_load_campaign_class( $campaign_type );

        if ( ! class_exists( $class_name ) ) {
            return false;
        }

        return new $class_name( $campaign_data );
    }

    /**
     * Load campaign class file
     *
     * @param string $campaign_type Campaign type
     */
    private static function upspr_load_campaign_class( $campaign_type ) {

        $file_map = array(
            'cross-sell' => 'class-upspr-cross-sell.php',
            'upsell' => 'class-upspr-upsell.php',
            'related-products' => 'class-upspr-related-products.php',
            'frequently-bought-together' => 'class-upspr-frequently-bought-together.php',
            'personalized-recommendations' => 'class-upspr-personalized-recommendations.php',
            'trending-products' => 'class-upspr-trending-products.php',
            'recently-viewed' => 'class-upspr-recently-viewed.php',
        );

        if ( isset( $file_map[ $campaign_type ] ) ) {
            $file_path = plugin_dir_path( __FILE__ ) . $file_map[ $campaign_type ];

            if ( file_exists( $file_path ) ) {
                require_once $file_path;
            }
        }
    }

    /**
     * Get available campaign types
     *
     * @return array Available campaign types
     */
    public static function upspr_get_available_types() {
        return array_keys( self::$campaign_types );
    }

    /**
     * Get campaign type class name
     *
     * @param string $campaign_type Campaign type
     * @return string|false Class name or false if not found
     */
    public static function upspr_get_campaign_class( $campaign_type ) {
        return isset( self::$campaign_types[ $campaign_type ] ) ? self::$campaign_types[ $campaign_type ] : false;
    }

    /**
     * Check if campaign type is valid
     *
     * @param string $campaign_type Campaign type to check
     * @return bool True if valid, false otherwise
     */
    public static function upspr_is_valid_type( $campaign_type ) {
        return isset( self::$campaign_types[ $campaign_type ] );
    }

    /**
     * Get campaign type display names
     *
     * @return array Campaign type display names
     */
    public static function upspr_get_type_labels() {
        return array(
            'cross-sell' => __( 'Cross-sell', 'upsellsmart' ),
            'upsell' => __( 'Upsell', 'upsellsmart' ),
            'related-products' => __( 'Related Products', 'upsellsmart' ),
            'frequently-bought-together' => __( 'Frequently Bought Together', 'upsellsmart' ),
            'personalized-recommendations' => __( 'Personalized Recommendations', 'upsellsmart' ),
            'trending-products' => __( 'Trending Products', 'upsellsmart' ),
            'recently-viewed' => __( 'Recently Viewed', 'upsellsmart' ),
        );
    }

    /**
     * Get campaign type descriptions
     *
     * @return array Campaign type descriptions
     */
    public static function upspr_get_type_descriptions() {
        return array(
            'cross-sell' => __( 'Show complementary products that work well with the current product', 'upsellsmart' ),
            'upsell' => __( 'Suggest higher-value alternatives or premium versions of the current product', 'upsellsmart' ),
            'related-products' => __( 'Display products similar to the current product based on categories, tags, or attributes', 'upsellsmart' ),
            'frequently-bought-together' => __( 'Show products that are commonly purchased together with the current product', 'upsellsmart' ),
            'personalized-recommendations' => __( 'Display personalized product recommendations based on user behavior and preferences', 'upsellsmart' ),
            'trending-products' => __( 'Show currently popular or trending products', 'upsellsmart' ),
            'recently-viewed' => __( 'Display products that the user has recently viewed', 'upsellsmart' ),
        );
    }

    /**
     * Process multiple campaigns
     *
     * @param array $campaigns Array of campaign data
     * @return array Array of processed campaign results
     */
    public static function upspr_process_campaigns( $campaigns ) {
        $results = array();

        foreach ( $campaigns as $campaign ) {
            $campaign_instance = self::upspr_create_campaign( $campaign );

            if ( $campaign_instance ) {
                $processed_data = $campaign_instance->upspr_process();

                if ( $processed_data ) {
                    $results[] = array(
                        'campaign' => $campaign,
                        'recommendations' => $processed_data,
                        //'html' => $campaign_instance->upspr_render(),
                    );
                }
            }
        }

        return $results;
    }

    /**
     * Render multiple campaigns
     *
     * @param array $campaigns Array of campaign data
     * @return string Combined HTML output
     */
    public static function upspr_render_campaigns( $campaigns ) {
        $html_output = '';
        $processed_campaigns = self::upspr_process_campaigns( $campaigns );

        foreach ( $processed_campaigns as $campaign_result ) {
            $html_output .= $campaign_result['html'];
        }

        return $html_output;
    }

    /**
     * Get campaign statistics
     *
     * @param array $campaigns Array of campaign data
     * @return array Campaign statistics
     */
    public static function upspr_get_campaign_statistics( $campaigns ) {
        $stats = array(
            'total_campaigns' => count( $campaigns ),
            'by_type' => array(),
            'active_campaigns' => 0,
        );

        foreach ( $campaigns as $campaign ) {
            $type = $campaign['type'] ?? 'unknown';
            
            if ( ! isset( $stats['by_type'][ $type ] ) ) {
                $stats['by_type'][ $type ] = 0;
            }
            
            $stats['by_type'][ $type ]++;
            
            if ( isset( $campaign['status'] ) && $campaign['status'] === 'active' ) {
                $stats['active_campaigns']++;
            }
        }

        return $stats;
    }
}
