<?php
/**
 * Plugin Name: UpSellSmart – Product Recommendations
 * Description: Local, data-driven UpSellSmart – Product Recommendations with multiple engines and comprehensive admin controls.
 * Version: 1.0.0
 * Author: hmdkamrul
 * Author URI: https://profiles.wordpress.org/hasandev/
 * Text Domain: upsellsmart-product-recommendations
 * Domain Path: /languages
 * Requires at least: 5.0
 * Tested up to: 6.4
 * WC requires at least: 5.0
 * WC tested up to: 8.0
 * License: GPLv3
 * License URI: http://www.gnu.org/licenses/gpl-3.0.html
 *
 * @package UpSellSmart – Product Recommendations
 */

// Prevent direct access
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Define plugin constants
define( 'UPSPR_VERSION', '1.0.0' );
define( 'UPSPR_PLUGIN_FILE', __FILE__ );
define( 'UPSPR_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );
define( 'UPSPR_PLUGIN_PATH', plugin_dir_path( __FILE__ ) );
define( 'UPSPR_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

/**
 * Main plugin class
 */
class UPSPR_Product_Recommendations {

    /**
     * Plugin instance
     */
    private static $instance = null;

    /**
     * Get plugin instance
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
        $this->upspr_init_hooks();
        $this->upspr_load_dependencies();
    }

    /**
     * Initialize hooks
     */
    private function upspr_init_hooks() {
        register_activation_hook( UPSPR_PLUGIN_FILE, array( $this, 'upspr_activate' ) );
        register_deactivation_hook( UPSPR_PLUGIN_FILE, array( $this, 'upspr_deactivate' ) );
        add_action( 'plugins_loaded', array( $this, 'upspr_init' ) );
        add_action( 'init', array( $this, 'upspr_load_textdomain' ) );
        add_action( 'before_woocommerce_init', array( $this, 'upspr_declare_compatibility_features' ) );
    }

    /**
     * Load plugin dependencies
     */
    private function upspr_load_dependencies() {
        require_once UPSPR_PLUGIN_PATH . 'includes/class-upspr-activator.php';
        require_once UPSPR_PLUGIN_PATH . 'includes/class-upspr-deactivator.php';
        require_once UPSPR_PLUGIN_PATH . 'includes/class-upspr-database.php';
        require_once UPSPR_PLUGIN_PATH . 'includes/class-upspr-migration.php';
        require_once UPSPR_PLUGIN_PATH . 'includes/class-upspr-admin.php';
        require_once UPSPR_PLUGIN_PATH . 'includes/class-upspr-rest-api.php';
        require_once UPSPR_PLUGIN_PATH . 'includes/class-upspr-recommendations.php';
        require_once UPSPR_PLUGIN_PATH . 'includes/class-upspr-frontend.php';
        require_once UPSPR_PLUGIN_PATH . 'includes/class-upspr-settings.php';

        // Load campaign engine types and location display system
        require_once UPSPR_PLUGIN_PATH . 'includes/class-upspr-engine-type/index.php';
    }

    /**
	 * Declare compatibility features
	 * This method is used to declare compatibility with WooCommerce features.
	 * It checks if the FeaturesUtil class exists and declares the features.
	 */
	public function upspr_declare_compatibility_features() {
		if ( class_exists( \Automattic\WooCommerce\Utilities\FeaturesUtil::class ) ) {
			\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', __FILE__, true );
			\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'cart_checkout_blocks', __FILE__, true );
		}
	}

    /**
     * Initialize plugin
     */
    public function upspr_init() {
        // Check if WooCommerce is active
        if ( ! class_exists( 'WooCommerce' ) ) {
            add_action( 'admin_notices', array( $this, 'upspr_woocommerce_missing_notice' ) );
            return;
        }

        // Initialize classes
        try {
            UPSPR_Database::upspr_get_instance();
            UPSPR_Migration::upspr_run_migrations(); // Run database migrations
            UPSPR_Admin::upspr_get_instance();
            UPSPR_REST_API::upspr_get_instance();
            UPSPR_Recommendations::upspr_get_instance();
            UPSPR_Frontend::upspr_get_instance();
            UPSPR_Settings::upspr_get_instance();

            // Initialize cross-sell integration for conversion tracking
            if ( class_exists( 'UPSPR_Cross_Sell_Integration' ) ) {
                UPSPR_Cross_Sell_Integration::upspr_init();
            }
        } catch ( Exception $e ) {
            error_log( 'UpSellSmart Plugin Error: ' . $e->getMessage() );
        }
    }

    /**
     * Plugin activation
     */
    public function upspr_activate() {
        UPSPR_Activator::upspr_activate();
    }

    /**
     * Plugin deactivation
     */
    public function upspr_deactivate() {
        UPSPR_Deactivator::upspr_deactivate();
    }

    /**
     * Load text domain
     */
    public function upspr_load_textdomain() {
        load_plugin_textdomain( 'upsellsmart-product-recommendations', false, dirname( UPSPR_PLUGIN_BASENAME ) . '/languages' );
    }

    /**
     * WooCommerce missing notice
     */
    public function upspr_woocommerce_missing_notice() {
        echo '<div class="notice notice-error"><p>';
        echo esc_html__( 'UpSellSmart Product Recommendations requires WooCommerce to be installed and active.', 'upsellsmart-product-recommendations' );
        echo '</p></div>';
    }
}

// Initialize plugin
UPSPR_Product_Recommendations::get_instance();
