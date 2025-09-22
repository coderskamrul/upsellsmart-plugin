<?php
/**
 * Admin functionality
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class UPSPR_Admin {

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
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_scripts' ) );
        add_action( 'admin_menu', array( $this, 'add_admin_menu' ) );
        add_action( 'wp_ajax_upspr_get_categories', array( $this, 'ajax_get_categories' ) );
        add_action( 'wp_ajax_upspr_get_tags', array( $this, 'ajax_get_tags' ) );
        add_action( 'wp_ajax_upspr_get_brands', array( $this, 'ajax_get_brands' ) );
        add_action( 'wp_ajax_upspr_get_attributes', array( $this, 'ajax_get_attributes' ) );
        add_action( 'wp_ajax_upspr_get_products', array( $this, 'ajax_get_products' ) );
    }

    /**
     * Enqueue admin scripts
     */
    public function enqueue_admin_scripts( $hook ) {
        // Only load on our admin pages
        if ( strpos( $hook, 'upsellsmart' ) === false ) {
            return;
        }

        // Enqueue the built admin script
        wp_enqueue_script(
            'upspr-admin',
            UPSPR_PLUGIN_URL . 'assets/dist/js/admin.js',
            array( 'wp-api-fetch' ),
            UPSPR_VERSION,
            true
        );

        // Enqueue admin styles
        wp_enqueue_style(
            'upspr-admin',
            UPSPR_PLUGIN_URL . 'assets/dist/css/admin.css',
            array(),
            UPSPR_VERSION
        );

        // Determine current page
        $current_page = 'dashboard'; // default
        if ( isset( $_GET['page'] ) ) {
            switch ( $_GET['page'] ) {
                case 'upsellsmart-recommendations':
                    $current_page = 'recommendations';
                    break;
                case 'upsellsmart-settings':
                    $current_page = 'settings';
                    break;
                default:
                    $current_page = 'dashboard';
                    break;
            }
        }

        // Localize script with nonce and API settings
        wp_localize_script( 'upspr-admin', 'wpApiSettings', array(
            'root' => esc_url_raw( rest_url() ),
            'nonce' => wp_create_nonce( 'wp_rest' ),
            'currentUser' => get_current_user_id(),
            'currentPage' => $current_page,
        ) );

        // Add AJAX nonce for category fetching
        wp_localize_script( 'upspr-admin', 'upspr_ajax', array(
            'ajax_url' => admin_url( 'admin-ajax.php' ),
            'nonce' => wp_create_nonce( 'upspr_ajax_nonce' ),
        ) );

        // Add inline script to make nonce globally available
        wp_add_inline_script( 'upspr-admin', '
            window.wpApiSettings = window.wpApiSettings || {};
            window.wpApiSettings.nonce = "' . wp_create_nonce( 'wp_rest' ) . '";
            window.wpApiSettings.currentPage = "' . $current_page . '";
            window.upspr_ajax = window.upspr_ajax || {};
            window.upspr_ajax.nonce = "' . wp_create_nonce( 'upspr_ajax_nonce' ) . '";
        ', 'before' );
    }

    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        // Main menu page
        add_menu_page(
            __( 'UpSellSmart', 'upsellsmart-product-recommendations' ),
            __( 'UpSellSmart', 'upsellsmart-product-recommendations' ),
            'manage_woocommerce',
            'upsellsmart',
            array( $this, 'admin_page' ),
            'dashicons-chart-line',
            56
        );

        // Submenu pages
        add_submenu_page(
            'upsellsmart',
            __( 'Dashboard', 'upsellsmart-product-recommendations' ),
            __( 'Dashboard', 'upsellsmart-product-recommendations' ),
            'manage_woocommerce',
            'upsellsmart',
            array( $this, 'admin_page' )
        );

        add_submenu_page(
            'upsellsmart',
            __( 'Recommendations', 'upsellsmart-product-recommendations' ),
            __( 'Recommendations', 'upsellsmart-product-recommendations' ),
            'manage_woocommerce',
            'upsellsmart-recommendations',
            array( $this, 'admin_page' )
        );

        add_submenu_page(
            'upsellsmart',
            __( 'Settings', 'upsellsmart-product-recommendations' ),
            __( 'Settings', 'upsellsmart-product-recommendations' ),
            'manage_woocommerce',
            'upsellsmart-settings',
            array( $this, 'admin_page' )
        );
    }

    /**
     * Admin page callback
     */
    public function admin_page() {
        echo '<div id="upspr-admin-root"></div>';
    }

    /**
     * AJAX handler to get WooCommerce categories
     */
    public function ajax_get_categories() {
        // Check nonce for security
        if ( ! wp_verify_nonce( $_POST['nonce'], 'upspr_ajax_nonce' ) ) {
            wp_die( 'Security check failed' );
        }

        // Check user permissions
        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            wp_die( 'Insufficient permissions' );
        }

        $categories = get_terms( array(
            'taxonomy' => 'product_cat',
            'hide_empty' => false,
            'orderby' => 'name',
            'order' => 'ASC'
        ) );

        if ( is_wp_error( $categories ) ) {
            wp_send_json_error( 'Failed to fetch categories' );
        }

        $formatted_categories = array();
        foreach ( $categories as $category ) {
            $formatted_categories[] = array(
                'id' => $category->term_id,
                'name' => $category->name,
                'slug' => $category->slug,
                'count' => $category->count
            );
        }

        wp_send_json_success( $formatted_categories );
    }

    /**
     * AJAX handler to get WooCommerce tags
     */
    public function ajax_get_tags() {
        // Check nonce for security
        if ( ! wp_verify_nonce( $_POST['nonce'], 'upspr_ajax_nonce' ) ) {
            wp_die( 'Security check failed' );
        }

        // Check user permissions
        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            wp_die( 'Insufficient permissions' );
        }

        $tags = get_terms( array(
            'taxonomy' => 'product_tag',
            'hide_empty' => false,
            'orderby' => 'name',
            'order' => 'ASC'
        ) );

        if ( is_wp_error( $tags ) ) {
            wp_send_json_error( 'Failed to fetch tags' );
        }

        $formatted_tags = array();
        foreach ( $tags as $tag ) {
            $formatted_tags[] = array(
                'id' => $tag->term_id,
                'name' => $tag->name,
                'slug' => $tag->slug,
                'count' => $tag->count
            );
        }

        wp_send_json_success( $formatted_tags );
    }

    /**
     * AJAX handler to get WooCommerce brands
     */
    public function ajax_get_brands() {
        // Check nonce for security
        if ( ! wp_verify_nonce( $_POST['nonce'], 'upspr_ajax_nonce' ) ) {
            wp_die( 'Security check failed' );
        }

        // Check user permissions
        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            wp_die( 'Insufficient permissions' );
        }

        // Check if a brand taxonomy exists (common brand taxonomies)
        $brand_taxonomies = array( 'product_brand', 'pwb-brand', 'yith_product_brand', 'pa_brand' );
        $brand_taxonomy = '';
        
        foreach ( $brand_taxonomies as $taxonomy ) {
            if ( taxonomy_exists( $taxonomy ) ) {
                $brand_taxonomy = $taxonomy;
                break;
            }
        }

        if ( empty( $brand_taxonomy ) ) {
            // If no brand taxonomy found, return empty array
            wp_send_json_success( array() );
        }

        $brands = get_terms( array(
            'taxonomy' => $brand_taxonomy,
            'hide_empty' => false,
            'orderby' => 'name',
            'order' => 'ASC'
        ) );

        if ( is_wp_error( $brands ) ) {
            wp_send_json_error( 'Failed to fetch brands' );
        }

        $formatted_brands = array();
        foreach ( $brands as $brand ) {
            $formatted_brands[] = array(
                'id' => $brand->term_id,
                'name' => $brand->name,
                'slug' => $brand->slug,
                'count' => $brand->count
            );
        }

        wp_send_json_success( $formatted_brands );
    }

    /**
     * AJAX handler to get WooCommerce attributes
     */
    public function ajax_get_attributes() {
        // Check nonce for security
        if ( ! wp_verify_nonce( $_POST['nonce'], 'upspr_ajax_nonce' ) ) {
            wp_die( 'Security check failed' );
        }

        // Check user permissions
        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            wp_die( 'Insufficient permissions' );
        }

        // Get WooCommerce product attributes
        $attributes = wc_get_attribute_taxonomies();

        if ( empty( $attributes ) ) {
            wp_send_json_success( array() );
        }

        $formatted_attributes = array();
        foreach ( $attributes as $attribute ) {
            $taxonomy = wc_attribute_taxonomy_name( $attribute->attribute_name );
            
            // Get terms for this attribute
            $terms = get_terms( array(
                'taxonomy' => $taxonomy,
                'hide_empty' => false,
            ) );

            $attribute_terms = array();
            if ( ! is_wp_error( $terms ) ) {
                foreach ( $terms as $term ) {
                    $attribute_terms[] = array(
                        'id' => $term->term_id,
                        'name' => $term->name,
                        'slug' => $term->slug,
                        'count' => $term->count
                    );
                }
            }

            $formatted_attributes[] = array(
                'id' => $attribute->attribute_id,
                'name' => $attribute->attribute_label,
                'slug' => $attribute->attribute_name,
                'taxonomy' => $taxonomy,
                'terms' => $attribute_terms
            );
        }

        wp_send_json_success( $formatted_attributes );
    }

    /**
     * AJAX handler to get WooCommerce products
     */
    public function ajax_get_products() {
        // Check nonce for security
        if ( ! wp_verify_nonce( $_POST['nonce'], 'upspr_ajax_nonce' ) ) {
            wp_die( 'Security check failed' );
        }

        // Check user permissions
        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            wp_die( 'Insufficient permissions' );
        }

        $search_term = sanitize_text_field( $_POST['search'] ?? '' );
        
        if ( strlen( $search_term ) < 2 ) {
            wp_send_json_success( array() );
        }

        // Query products with simplified parameters
        $args = array(
            'post_type' => 'product',
            'post_status' => 'publish',
            'posts_per_page' => 20,
            's' => $search_term,
            'orderby' => 'title',
            'order' => 'ASC'
        );

        $products = get_posts( $args );

        $formatted_products = array();
        foreach ( $products as $product_post ) {
            $product = wc_get_product( $product_post->ID );
            
            if ( ! $product ) {
                continue;
            }

            // Get product price
            $price = '';
            if ( $product->get_price() ) {
                $price = wc_price( $product->get_price() );
            }

            $formatted_products[] = array(
                'id' => $product->get_id(),
                'name' => $product->get_name(),
                'sku' => $product->get_sku() ?: '',
                'price' => $price,
                'type' => $product->get_type(),
                'status' => $product->get_status()
            );
        }

        wp_send_json_success( $formatted_products );
    }
}