<?php
/**
 * Database operations
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class UPSPR_Database {

    /**
     * Instance
     */
    private static $instance = null;

    /**
     * Table name
     */
    private $table_name;

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
        global $wpdb;
        $this->table_name = $wpdb->prefix . 'upspr_recommendation_campaigns';
        $this->create_tables();
    }

    /**
     * Create database tables
     */
    public function create_tables() {
        global $wpdb;

        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE {$this->table_name} (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            name varchar(255) NOT NULL,
            description text,
            type varchar(50) NOT NULL DEFAULT 'cross-sell',
            location varchar(50) NOT NULL DEFAULT 'product-page',
            products_count int(11) NOT NULL DEFAULT 4,
            priority int(11) NOT NULL DEFAULT 1,
            status varchar(20) NOT NULL DEFAULT 'active',
            basic_info longtext,
            filters longtext,
            amplifiers longtext,
            personalization longtext,
            visibility longtext,
            performance_data longtext,
            form_data longtext,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY status (status),
            KEY type (type),
            KEY location (location)
        ) $charset_collate;";

        require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
        dbDelta( $sql );
    }

    /**
     * Get table name
     */
    public function get_table_name() {
        return $this->table_name;
    }

    /**
     * Create recommendation campaign
     */
    public function create_campaign( $data ) {
        global $wpdb;

        // Handle both old form_data format and new organized format
        $basic_info = '';
        $filters = '';
        $amplifiers = '';
        $personalization = '';
        $visibility = '';
        $form_data = '';

        if ( isset( $data['basic_info'] ) ) {
            $basic_info = wp_json_encode( $data['basic_info'] );
        }

        if ( isset( $data['filters'] ) ) {
            $filters = wp_json_encode( $data['filters'] );
        }

        if ( isset( $data['amplifiers'] ) ) {
            $amplifiers = wp_json_encode( $data['amplifiers'] );
        }

        if ( isset( $data['personalization'] ) ) {
            $personalization = wp_json_encode( $data['personalization'] );
        }

        if ( isset( $data['visibility'] ) ) {
            $visibility = wp_json_encode( $data['visibility'] );
        }

        // Keep form_data for backward compatibility
        if ( isset( $data['form_data'] ) ) {
            $form_data = wp_json_encode( $data['form_data'] );
        }

        $performance_data = isset( $data['performance'] ) ? wp_json_encode( $data['performance'] ) : wp_json_encode( array(
            'impressions' => 0,
            'clicks' => 0,
            'conversions' => 0,
            'revenue' => 0
        ) );

        $result = $wpdb->insert(
            $this->table_name,
            array(
                'name' => sanitize_text_field( $data['name'] ),
                'description' => sanitize_textarea_field( $data['description'] ),
                'type' => sanitize_text_field( $data['type'] ),
                'location' => sanitize_text_field( $data['location'] ),
                'products_count' => intval( $data['products_count'] ),
                'priority' => intval( $data['priority'] ),
                'status' => sanitize_text_field( $data['status'] ),
                'basic_info' => $basic_info,
                'filters' => $filters,
                'amplifiers' => $amplifiers,
                'personalization' => $personalization,
                'visibility' => $visibility,
                'form_data' => $form_data,
                'performance_data' => $performance_data,
                'created_at' => current_time( 'mysql' ),
                'updated_at' => current_time( 'mysql' )
            ),
            array(
                '%s', '%s', '%s', '%s', '%d', '%d', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s'
            )
        );

        if ( $result === false ) {
            return new WP_Error( 'db_error', 'Failed to create campaign', array( 'status' => 500 ) );
        }

        return $wpdb->insert_id;
    }

    /**
     * Get all campaigns
     */
    public function get_campaigns( $args = array() ) {
        global $wpdb;

        $defaults = array(
            'status' => '',
            'type' => '',
            'limit' => 50,
            'offset' => 0,
            'orderby' => 'created_at',
            'order' => 'DESC'
        );

        $args = wp_parse_args( $args, $defaults );

        $where_clauses = array();
        $where_values = array();

        if ( ! empty( $args['status'] ) ) {
            $where_clauses[] = 'status = %s';
            $where_values[] = $args['status'];
        }

        if ( ! empty( $args['type'] ) ) {
            $where_clauses[] = 'type = %s';
            $where_values[] = $args['type'];
        }

        $where_sql = '';
        if ( ! empty( $where_clauses ) ) {
            $where_sql = 'WHERE ' . implode( ' AND ', $where_clauses );
        }

        $orderby = sanitize_sql_orderby( $args['orderby'] . ' ' . $args['order'] );
        $limit = intval( $args['limit'] );
        $offset = intval( $args['offset'] );

        $sql = "SELECT * FROM {$this->table_name} {$where_sql} ORDER BY {$orderby} LIMIT {$limit} OFFSET {$offset}";

        if ( ! empty( $where_values ) ) {
            $sql = $wpdb->prepare( $sql, $where_values );
        }

        $results = $wpdb->get_results( $sql, ARRAY_A );

        // Parse JSON data
        foreach ( $results as &$result ) {
            // Parse the new organized format
            $result['basic_info'] = json_decode( $result['basic_info'], true );
            $result['filters'] = json_decode( $result['filters'], true );
            $result['amplifiers'] = json_decode( $result['amplifiers'], true );
            $result['personalization'] = json_decode( $result['personalization'], true );
            $result['visibility'] = json_decode( $result['visibility'], true );
            
            // Keep form_data for backward compatibility
            $result['form_data'] = json_decode( $result['form_data'], true );
            $result['performance'] = json_decode( $result['performance_data'], true );
            unset( $result['performance_data'] );
            unset( $result['form_data'] );
            unset( $result['hook_location'] );
            
            // Remove duplicated fields that are now in organized sections
            $fields_to_remove = array(
                'display_location', 'max_products', 'widget_settings', 
                'include_filters', 'exclude_filters', 'amplifier_settings',
                'personalization_settings', 'visibility_settings',
                'views', 'clicks', 'conversions', 'revenue'
            );
            foreach ( $fields_to_remove as $field ) {
                if ( isset( $result[ $field ] ) ) {
                    unset( $result[ $field ] );
                }
            }
        }

        return $results;
    }

    /**
     * Get single campaign
     */
    public function get_campaign( $id ) {
        global $wpdb;

        $sql = $wpdb->prepare( "SELECT * FROM {$this->table_name} WHERE id = %d", $id );
        $result = $wpdb->get_row( $sql, ARRAY_A );

        if ( ! $result ) {
            return false;
        }

        // Parse JSON data
        $result['basic_info'] = json_decode( $result['basic_info'], true );
        $result['filters'] = json_decode( $result['filters'], true );
        $result['amplifiers'] = json_decode( $result['amplifiers'], true );
        $result['personalization'] = json_decode( $result['personalization'], true );
        $result['visibility'] = json_decode( $result['visibility'], true );
        
        // Keep form_data for backward compatibility
        $result['form_data'] = json_decode( $result['form_data'], true );
        $result['performance'] = json_decode( $result['performance_data'], true );
        unset( $result['performance_data'] );
        
        // Remove duplicated fields that are now in organized sections
        $fields_to_remove = array(
            'display_location', 'max_products', 'widget_settings', 
            'include_filters', 'exclude_filters', 'amplifier_settings',
            'personalization_settings', 'visibility_settings',
            'views', 'clicks', 'conversions', 'revenue'
        );
        
        foreach ( $fields_to_remove as $field ) {
            if ( isset( $result[ $field ] ) ) {
                unset( $result[ $field ] );
            }
        }

        return $result;
    }

    /**
     * Update campaign
     */
    public function update_campaign( $id, $data ) {
        global $wpdb;

        // Handle new organized format
        $basic_info = isset( $data['basic_info'] ) ? wp_json_encode( $data['basic_info'] ) : '';
        $filters = isset( $data['filters'] ) ? wp_json_encode( $data['filters'] ) : '';
        $amplifiers = isset( $data['amplifiers'] ) ? wp_json_encode( $data['amplifiers'] ) : '';
        $personalization = isset( $data['personalization'] ) ? wp_json_encode( $data['personalization'] ) : '';
        $visibility = isset( $data['visibility'] ) ? wp_json_encode( $data['visibility'] ) : '';
        
        // Keep form_data for backward compatibility
        $form_data = isset( $data['form_data'] ) ? wp_json_encode( $data['form_data'] ) : '';
        $performance_data = isset( $data['performance'] ) ? wp_json_encode( $data['performance'] ) : '';

        $update_data = array(
            'updated_at' => current_time( 'mysql' )
        );
        $update_format = array( '%s' );

        // Add fields to update
        $fields = array( 'name', 'description', 'type', 'location', 'status' );
        foreach ( $fields as $field ) {
            if ( isset( $data[ $field ] ) ) {
                $update_data[ $field ] = sanitize_text_field( $data[ $field ] );
                $update_format[] = '%s';
            }
        }

        // Add numeric fields
        $numeric_fields = array( 'products_count', 'priority' );
        foreach ( $numeric_fields as $field ) {
            if ( isset( $data[ $field ] ) ) {
                $update_data[ $field ] = intval( $data[ $field ] );
                $update_format[] = '%d';
            }
        }

        // Add new organized JSON fields
        if ( ! empty( $basic_info ) ) {
            $update_data['basic_info'] = $basic_info;
            $update_format[] = '%s';
        }
        
        if ( ! empty( $filters ) ) {
            $update_data['filters'] = $filters;
            $update_format[] = '%s';
        }
        
        if ( ! empty( $amplifiers ) ) {
            $update_data['amplifiers'] = $amplifiers;
            $update_format[] = '%s';
        }
        
        if ( ! empty( $personalization ) ) {
            $update_data['personalization'] = $personalization;
            $update_format[] = '%s';
        }
        
        if ( ! empty( $visibility ) ) {
            $update_data['visibility'] = $visibility;
            $update_format[] = '%s';
        }

        // Add legacy JSON fields for backward compatibility
        if ( ! empty( $form_data ) ) {
            $update_data['form_data'] = $form_data;
            $update_format[] = '%s';
        }

        if ( ! empty( $performance_data ) ) {
            $update_data['performance_data'] = $performance_data;
            $update_format[] = '%s';
        }

        $result = $wpdb->update(
            $this->table_name,
            $update_data,
            array( 'id' => $id ),
            $update_format,
            array( '%d' )
        );

        return $result !== false;
    }

    /**
     * Delete campaign
     */
    public function delete_campaign( $id ) {
        global $wpdb;

        $result = $wpdb->delete(
            $this->table_name,
            array( 'id' => $id ),
            array( '%d' )
        );

        return $result !== false;
    }

    /**
     * Get campaigns count
     */
    public function get_campaigns_count( $args = array() ) {
        global $wpdb;

        $where_clauses = array();
        $where_values = array();

        if ( ! empty( $args['status'] ) ) {
            $where_clauses[] = 'status = %s';
            $where_values[] = $args['status'];
        }

        if ( ! empty( $args['type'] ) ) {
            $where_clauses[] = 'type = %s';
            $where_values[] = $args['type'];
        }

        $where_sql = '';
        if ( ! empty( $where_clauses ) ) {
            $where_sql = 'WHERE ' . implode( ' AND ', $where_clauses );
        }

        $sql = "SELECT COUNT(*) FROM {$this->table_name} {$where_sql}";

        if ( ! empty( $where_values ) ) {
            $sql = $wpdb->prepare( $sql, $where_values );
        }

        return intval( $wpdb->get_var( $sql ) );
    }
}
