<?php
/**
 * Visibility Checker Helper - Check if campaign should be visible based on visibility rules
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class UPSPR_Visibility_Checker {

    /**
     * Check if campaign should be visible based on all visibility rules
     *
     * @param array $visibility_config Visibility configuration
     * @param int $user_id User ID (optional, defaults to current user)
     * @return bool Whether campaign should be visible
     */
    public static function upspr_should_display_campaign( $visibility_config, $user_id = null ) {
        if ( empty( $visibility_config ) ) {
            return true; // No restrictions, show campaign
        }

        // Check date range
        if ( ! self::upspr_check_date_range( $visibility_config ) ) {
            return false;
        }

        // Check days of week
        if ( ! self::upspr_check_days_of_week( $visibility_config ) ) {
            return false;
        }

        // Check time range
        if ( ! self::upspr_check_time_range( $visibility_config ) ) {
            echo '<pre>'; print_r('upspr_check_time_range'); echo '</pre>';
            return false;
        }

        // Check user login status
        if ( ! self::upspr_check_user_login_status( $visibility_config, $user_id ) ) {
            echo '<pre>'; print_r('upspr_check_user_login_status'); echo '</pre>';
            return false;
        }

        // Check user roles
        if ( ! self::upspr_check_user_roles( $visibility_config, $user_id ) ) {
            echo '<pre>'; print_r('upspr_check_user_roles'); echo '</pre>';
            return false;
        }

        // Check minimum orders
        if ( ! self::upspr_check_minimum_orders( $visibility_config, $user_id ) ) {
            echo '<pre>'; print_r('upspr_check_minimum_orders'); echo '</pre>';
            return false;
        }

        // Check minimum spent
        if ( ! self::upspr_check_minimum_spent( $visibility_config, $user_id ) ) {
            echo '<pre>'; print_r('upspr_check_minimum_spent'); echo '</pre>';
            return false;
        }

        // Check device type
        if ( ! self::upspr_check_device_type( $visibility_config ) ) {
            echo '<pre>'; print_r('upspr_check_device_type'); echo '</pre>';
            return false;
        }

        // Check cart value range
        if ( ! self::upspr_check_cart_value_range( $visibility_config ) ) {
            echo '<pre>'; print_r('upspr_check_cart_value_range'); echo '</pre>';
            return false;
        }

        // Check cart items count
        if ( ! self::upspr_check_cart_items_count( $visibility_config ) ) {
            echo '<pre>'; print_r('upspr_check_cart_items_count'); echo '</pre>';
            return false;
        }

        // Check required products in cart
        if ( ! self::upspr_check_required_products_in_cart( $visibility_config ) ) {
            echo '<pre>'; print_r('upspr_check_required_products_in_cart'); echo '</pre>';
            return false;
        }

        // Check required categories in cart
        if ( ! self::upspr_check_required_categories_in_cart( $visibility_config ) ) {
            echo '<pre>'; print_r('upspr_check_required_categories_in_cart'); echo '</pre>';
            return false;
        }

        return true; // All checks passed
    }

    /**
     * Check date range visibility
     *
     * @param array $visibility_config Visibility configuration
     * @return bool Whether campaign should be visible
     */
    private static function upspr_check_date_range( $visibility_config ) {
        $start_date = isset( $visibility_config['startDate'] ) ? $visibility_config['startDate'] : '';
        $end_date = isset( $visibility_config['endDate'] ) ? $visibility_config['endDate'] : '';

        if ( empty( $start_date ) && empty( $end_date ) ) {
            return true; // No date restrictions
        }

        $current_date = current_time( 'Y-m-d' );

        if ( ! empty( $start_date ) && $current_date < $start_date ) {
            return false; // Campaign hasn't started yet
        }

        if ( ! empty( $end_date ) && $current_date > $end_date ) {
            return false; // Campaign has ended
        }

        return true;
    }

    /**
     * Check days of week visibility
     *
     * @param array $visibility_config Visibility configuration
     * @return bool Whether campaign should be visible
     */
    private static function upspr_check_days_of_week( $visibility_config ) {
        if ( ! isset( $visibility_config['daysOfWeek'] ) || empty( $visibility_config['daysOfWeek'] ) ) {
            return true; // No day restrictions
        }

        $days_of_week = $visibility_config['daysOfWeek'];
        $current_day = strtolower( current_time( 'l' ) ); // Get current day name

        return isset( $days_of_week[ $current_day ] ) && $days_of_week[ $current_day ];
    }

    /**
     * Check time range visibility
     *
     * @param array $visibility_config Visibility configuration
     * @return bool Whether campaign should be visible
     */
    private static function upspr_check_time_range( $visibility_config ) {
        if ( ! isset( $visibility_config['timeRange'] ) || empty( $visibility_config['timeRange'] ) ) {
            return true; // No time restrictions
        }

        $time_range = $visibility_config['timeRange'];
        $start_time = isset( $time_range['start'] ) ? $time_range['start'] : ''; //05:00 PM
        $end_time = isset( $time_range['end'] ) ? $time_range['end'] : ''; //11:59 PM

        if ( empty( $start_time ) || empty( $end_time ) ) {
            return true; // Invalid time range, allow display
        }

        $current_time = current_time( 'H:i' ); //13:11 PM
        // Convert times to 24-hour format for comparison
        $current_24h = date( 'H:i', strtotime( $current_time ) );//19:28
        $start_24h = date( 'H:i', strtotime( $start_time ) );//17:00
        $end_24h = date( 'H:i', strtotime( $end_time ) );//23:59

        // Handle overnight time ranges (e.g., 11:00 PM to 6:00 AM)
        if ( $start_24h > $end_24h ) {
            return $current_24h >= $start_24h || $current_24h <= $end_24h;
        } else {
            return $current_24h >= $start_24h && $current_24h <= $end_24h;
        }
    }

    /**
     * Check user login status visibility
     *
     * @param array $visibility_config Visibility configuration
     * @param int $user_id User ID
     * @return bool Whether campaign should be visible
     */
    private static function upspr_check_user_login_status( $visibility_config, $user_id = null ) {
        $login_status = isset( $visibility_config['userLoginStatus'] ) ? $visibility_config['userLoginStatus'] : 'any';

        if ( $login_status === 'any' ) {
            return true; // No login restrictions
        }

        $is_logged_in = is_user_logged_in();

        switch ( $login_status ) {
            case 'logged-in':
                return $is_logged_in;
            case 'logged-out':
                return ! $is_logged_in;
            default:
                return true;
        }
    }

    /**
     * Check user roles visibility
     *
     * @param array $visibility_config Visibility configuration
     * @param int $user_id User ID
     * @return bool Whether campaign should be visible
     */
    private static function upspr_check_user_roles( $visibility_config, $user_id = null ) {
        $required_roles = isset( $visibility_config['userRoles'] ) ? $visibility_config['userRoles'] : '';
        if ( empty( $required_roles ) || $required_roles === 'all-roles' ) {
            return true; // No role restrictions
        }

        if ( ! is_user_logged_in() ) {
            return $required_roles === 'guest'; // Only show to guests if specifically configured
        }

        $user = $user_id ? get_user_by( 'id', $user_id ) : wp_get_current_user();
        
        if ( ! $user ) {
            return false;
        }

        // Handle multiple roles (comma-separated)
        $allowed_roles = array_map( 'trim', explode( ',', $required_roles ) );
        
        foreach ( $allowed_roles as $role ) {
            if ( in_array( $role, $user->roles ) ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check minimum orders visibility
     *
     * @param array $visibility_config Visibility configuration
     * @param int $user_id User ID
     * @return bool Whether campaign should be visible
     */
    private static function upspr_check_minimum_orders( $visibility_config, $user_id = null ) {
        $minimum_orders = isset( $visibility_config['minimumOrders'] ) ? intval( $visibility_config['minimumOrders'] ) : 0;

        if ( $minimum_orders <= 0 ) {
            return true; // No minimum order requirement
        }

        if ( ! is_user_logged_in() ) {
            return false; // Can't check orders for non-logged-in users
        }

        $user_id = $user_id ?: get_current_user_id();
        $order_count = wc_get_customer_order_count( $user_id );

        return $order_count >= $minimum_orders;
    }

    /**
     * Check minimum spent visibility
     *
     * @param array $visibility_config Visibility configuration
     * @param int $user_id User ID
     * @return bool Whether campaign should be visible
     */
    private static function upspr_check_minimum_spent( $visibility_config, $user_id = null ) {
        $minimum_spent = isset( $visibility_config['minimumSpent'] ) ? floatval( $visibility_config['minimumSpent'] ) : 0;

        if ( $minimum_spent <= 0 ) {
            return true; // No minimum spent requirement
        }

        if ( ! is_user_logged_in() ) {
            return false; // Can't check spending for non-logged-in users
        }

        $user_id = $user_id ?: get_current_user_id();
        $total_spent = wc_get_customer_total_spent( $user_id );

        return $total_spent >= $minimum_spent;
    }

    /**
     * Check device type visibility
     *
     * @param array $visibility_config Visibility configuration
     * @return bool Whether campaign should be visible
     */
    private static function upspr_check_device_type( $visibility_config ) {
        if ( ! isset( $visibility_config['deviceType'] ) || empty( $visibility_config['deviceType'] ) ) {
            return true; // No device restrictions
        }

        $allowed_devices = $visibility_config['deviceType'];
        $current_device = self::upspr_detect_device_type();

        return isset( $allowed_devices[ $current_device ] ) && $allowed_devices[ $current_device ];
    }

    /**
     * Check cart value range visibility
     *
     * @param array $visibility_config Visibility configuration
     * @return bool Whether campaign should be visible
     */
    private static function upspr_check_cart_value_range( $visibility_config ) {
        if ( ! isset( $visibility_config['cartValueRange'] ) || empty( $visibility_config['cartValueRange'] ) ) {
            return true; // No cart value restrictions
        }

        $cart_value_range = $visibility_config['cartValueRange'];
        $min_value = isset( $cart_value_range['min'] ) ? floatval( $cart_value_range['min'] ) : 0;
        $max_value = isset( $cart_value_range['max'] ) ? floatval( $cart_value_range['max'] ) : 0;

        if ( $min_value <= 0 && $max_value <= 0 ) {
            return true; // No valid range specified
        }

        if ( ! WC()->cart ) {
            return false; // No cart available
        }

        $cart_total = WC()->cart->get_subtotal();

        if ( $min_value > 0 && $cart_total < $min_value ) {
            return false;
        }

        if ( $max_value > 0 && $cart_total > $max_value ) {
            return false;
        }

        return true;
    }

    /**
     * Check cart items count visibility
     *
     * @param array $visibility_config Visibility configuration
     * @return bool Whether campaign should be visible
     */
    private static function upspr_check_cart_items_count( $visibility_config ) {
        if ( ! isset( $visibility_config['cartItemsCount'] ) || empty( $visibility_config['cartItemsCount'] ) ) {
            return true; // No cart items count restrictions
        }

        $cart_items_range = $visibility_config['cartItemsCount'];
        $min_items = isset( $cart_items_range['min'] ) ? intval( $cart_items_range['min'] ) : 0;
        $max_items = isset( $cart_items_range['max'] ) ? intval( $cart_items_range['max'] ) : 0;

        if ( $min_items <= 0 && $max_items <= 0 ) {
            return true; // No valid range specified
        }

        if ( ! WC()->cart ) {
            return false; // No cart available
        }

        $cart_item_count = WC()->cart->get_cart_contents_count();

        if ( $min_items > 0 && $cart_item_count < $min_items ) {
            return false;
        }

        if ( $max_items > 0 && $cart_item_count > $max_items ) {
            return false;
        }

        return true;
    }

    /**
     * Check required products in cart visibility
     *
     * @param array $visibility_config Visibility configuration
     * @return bool Whether campaign should be visible
     */
    private static function upspr_check_required_products_in_cart( $visibility_config ) {
        if ( ! isset( $visibility_config['requiredProductsInCart'] ) || empty( $visibility_config['requiredProductsInCart'] ) ) {
            return true; // No required products
        }

        $required_products = $visibility_config['requiredProductsInCart'];

        if ( ! WC()->cart ) {
            return false; // No cart available
        }

        $cart_product_ids = array();
        foreach ( WC()->cart->get_cart() as $cart_item ) {
            $cart_product_ids[] = $cart_item['product_id'];
        }

        // Check if any of the required products are in cart
        foreach ( $required_products as $required_product_id ) {
            if ( in_array( intval( $required_product_id ), $cart_product_ids ) ) {
                return true; // At least one required product found
            }
        }

        return false; // None of the required products found
    }

    /**
     * Check required categories in cart visibility
     *
     * @param array $visibility_config Visibility configuration
     * @return bool Whether campaign should be visible
     */
    private static function upspr_check_required_categories_in_cart( $visibility_config ) {
        if ( ! isset( $visibility_config['requiredCategoriesInCart'] ) || empty( $visibility_config['requiredCategoriesInCart'] ) ) {
            return true; // No required categories
        }

        $required_categories = $visibility_config['requiredCategoriesInCart'];

        if ( ! WC()->cart ) {
            return false; // No cart available
        }

        $cart_category_ids = array();
        foreach ( WC()->cart->get_cart() as $cart_item ) {
            $product_categories = wp_get_post_terms( $cart_item['product_id'], 'product_cat', array( 'fields' => 'ids' ) );
            if ( ! is_wp_error( $product_categories ) ) {
                $cart_category_ids = array_merge( $cart_category_ids, $product_categories );
            }
        }

        $cart_category_ids = array_unique( $cart_category_ids );

        // Check if any of the required categories are in cart
        foreach ( $required_categories as $required_category_id ) {
            if ( in_array( intval( $required_category_id ), $cart_category_ids ) ) {
                return true; // At least one required category found
            }
        }

        return false; // None of the required categories found
    }

    /**
     * Detect device type
     *
     * @return string Device type (desktop, mobile, tablet)
     */
    private static function upspr_detect_device_type() {
        if ( ! isset( $_SERVER['HTTP_USER_AGENT'] ) ) {
            return 'desktop';
        }

        $user_agent = $_SERVER['HTTP_USER_AGENT'];

        // Check for mobile devices
        if ( preg_match( '/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i', $user_agent ) ) {
            // Check for tablets
            if ( preg_match( '/iPad|Android(?!.*Mobile)|Tablet/i', $user_agent ) ) {
                return 'tablet';
            }
            return 'mobile';
        }

        return 'desktop';
    }

    /**
     * Get visibility status summary
     *
     * @param array $visibility_config Visibility configuration
     * @param int $user_id User ID
     * @return array Visibility status for each rule
     */
    public static function upspr_get_visibility_status( $visibility_config, $user_id = null ) {
        return array(
            'date_range' => self::upspr_check_date_range( $visibility_config ),
            'days_of_week' => self::upspr_check_days_of_week( $visibility_config ),
            'time_range' => self::upspr_check_time_range( $visibility_config ),
            'user_login_status' => self::upspr_check_user_login_status( $visibility_config, $user_id ),
            'user_roles' => self::upspr_check_user_roles( $visibility_config, $user_id ),
            'minimum_orders' => self::upspr_check_minimum_orders( $visibility_config, $user_id ),
            'minimum_spent' => self::upspr_check_minimum_spent( $visibility_config, $user_id ),
            'device_type' => self::upspr_check_device_type( $visibility_config ),
            'cart_value_range' => self::upspr_check_cart_value_range( $visibility_config ),
            'cart_items_count' => self::upspr_check_cart_items_count( $visibility_config ),
            'required_products_in_cart' => self::upspr_check_required_products_in_cart( $visibility_config ),
            'required_categories_in_cart' => self::upspr_check_required_categories_in_cart( $visibility_config ),
        );
    }
}
