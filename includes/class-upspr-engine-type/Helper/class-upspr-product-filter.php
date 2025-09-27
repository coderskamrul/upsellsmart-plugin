<?php
/**
 * Product Filter Helper - Reusable filtering functions for product recommendations
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class UPSPR_Product_Filter {

    /**
     * Filter products by categories
     *
     * @param array $product_ids Array of product IDs to filter
     * @param array $category_ids Array of category IDs to include
     * @param bool $include Whether to include (true) or exclude (false) these categories
     * @return array Filtered product IDs
     */
    public static function filter_by_categories( $product_ids, $category_ids, $include = true ) {
        if ( empty( $product_ids ) || empty( $category_ids ) ) {
            return $product_ids;
        }
        $filtered_ids = array();

        foreach ( $product_ids as $product_id ) {
            $product_categories = wp_get_post_terms( $product_id, 'product_cat', array( 'fields' => 'ids' ) );
            
            if ( is_wp_error( $product_categories ) ) {
                continue;
            }
            $has_category = ! empty( array_intersect( $product_categories, $category_ids ) );

            if ( ( $include && $has_category ) || ( ! $include && ! $has_category ) ) {
                $filtered_ids[] = $product_id;
            }
        }
        return $filtered_ids;
    }

    /**
     * Filter products by tags
     *
     * @param array $product_ids Array of product IDs to filter
     * @param array $tag_ids Array of tag IDs to include
     * @param bool $include Whether to include (true) or exclude (false) these tags
     * @return array Filtered product IDs
     */
    public static function filter_by_tags( $product_ids, $tag_ids, $include = true ) {
        if ( empty( $product_ids ) || empty( $tag_ids ) ) {
            return $product_ids;
        }

        $filtered_ids = array();

        foreach ( $product_ids as $product_id ) {
            $product_tags = wp_get_post_terms( $product_id, 'product_tag', array( 'fields' => 'ids' ) );
            
            if ( is_wp_error( $product_tags ) ) {
                continue;
            }

            $has_tag = ! empty( array_intersect( $product_tags, $tag_ids ) );

            if ( ( $include && $has_tag ) || ( ! $include && ! $has_tag ) ) {
                $filtered_ids[] = $product_id;
            }
        }

        return $filtered_ids;
    }

    /**
     * Filter products by brands (using product attributes or custom taxonomy)
     *
     * @param array $product_ids Array of product IDs to filter
     * @param array $brand_ids Array of brand IDs to include
     * @param bool $include Whether to include (true) or exclude (false) these brands
     * @return array Filtered product IDs
     */
    public static function filter_by_brands( $product_ids, $brand_ids, $include = true ) {
        if ( empty( $product_ids ) || empty( $brand_ids ) ) {
            return $product_ids;
        }

        $filtered_ids = array();

        foreach ( $product_ids as $product_id ) {
            $product_brands = array();
            
            // Check for brand taxonomy (common approach)
            if ( taxonomy_exists( 'product_brand' ) ) {
                $brands = wp_get_post_terms( $product_id, 'product_brand', array( 'fields' => 'ids' ) );
                if ( ! is_wp_error( $brands ) ) {
                    $product_brands = array_merge( $product_brands, $brands );
                }
            }

            // Check for brand attribute (pa_brand)
            $brand_attribute = get_post_meta( $product_id, '_product_attributes', true );
            if ( is_array( $brand_attribute ) && isset( $brand_attribute['pa_brand'] ) ) {
                $brand_terms = wp_get_post_terms( $product_id, 'pa_brand', array( 'fields' => 'ids' ) );
                if ( ! is_wp_error( $brand_terms ) ) {
                    $product_brands = array_merge( $product_brands, $brand_terms );
                }
            }

            $has_brand = ! empty( array_intersect( $product_brands, $brand_ids ) );

            if ( ( $include && $has_brand ) || ( ! $include && ! $has_brand ) ) {
                $filtered_ids[] = $product_id;
            }
        }

        return $filtered_ids;
    }

    /**
     * Filter products by attributes
     *
     * @param array $product_ids Array of product IDs to filter
     * @param array $attribute_ids Array of attribute term IDs to include
     * @param bool $include Whether to include (true) or exclude (false) these attributes
     * @return array Filtered product IDs
     */
    public static function filter_by_attributes( $product_ids, $attribute_ids, $include = true ) {
        if ( empty( $product_ids ) || empty( $attribute_ids ) ) {
            return $product_ids;
        }

        $filtered_ids = array();

        foreach ( $product_ids as $product_id ) {
            $product_attributes = array();
            
            // Get all product attribute taxonomies
            $attributes = wc_get_attribute_taxonomies();
            
            foreach ( $attributes as $attribute ) {
                $taxonomy = 'pa_' . $attribute->attribute_name;
                $terms = wp_get_post_terms( $product_id, $taxonomy, array( 'fields' => 'ids' ) );
                
                if ( ! is_wp_error( $terms ) ) {
                    $product_attributes = array_merge( $product_attributes, $terms );
                }
            }

            $has_attribute = ! empty( array_intersect( $product_attributes, $attribute_ids ) );

            if ( ( $include && $has_attribute ) || ( ! $include && ! $has_attribute ) ) {
                $filtered_ids[] = $product_id;
            }
        }

        return $filtered_ids;
    }

    /**
     * Filter products by price range
     *
     * @param array $product_ids Array of product IDs to filter
     * @param float $min_price Minimum price
     * @param float $max_price Maximum price
     * @return array Filtered product IDs
     */
    public static function filter_by_price_range( $product_ids, $min_price = null, $max_price = null ) {
        if ( empty( $product_ids ) || ( is_null( $min_price ) && is_null( $max_price ) ) ) {
            return $product_ids;
        }

        $filtered_ids = array();

        foreach ( $product_ids as $product_id ) {
            $product = wc_get_product( $product_id );
            
            if ( ! $product ) {
                continue;
            }

            $price = (float) $product->get_price();
            
            $passes_min = is_null( $min_price ) || $price >= $min_price;
            $passes_max = is_null( $max_price ) || $price <= $max_price;

            if ( $passes_min || $passes_max ) {
                $filtered_ids[] = $product_id;
            }
        }

        return $filtered_ids;
    }

    /**
     * Filter products by stock status
     *
     * @param array $product_ids Array of product IDs to filter
     * @param string $stock_status Stock status ('in-stock', 'out-of-stock', 'on-backorder')
     * @return array Filtered product IDs
     */
    public static function filter_by_stock_status( $product_ids, $stock_status ) {
        if ( empty( $product_ids ) || empty( $stock_status ) || $stock_status === 'any' ) {
            return $product_ids;
        }

        $filtered_ids = array();

        foreach ( $product_ids as $product_id ) {
            $product = wc_get_product( $product_id );
            
            if ( ! $product ) {
                continue;
            }

            $product_stock_status = $product->get_stock_status();

            // Map our filter values to WooCommerce stock status values
            $status_map = array(
                'in-stock' => 'instock',
                'out-of-stock' => 'outofstock',
                'on-backorder' => 'onbackorder'
            );

            $target_status = isset( $status_map[ $stock_status ] ) ? $status_map[ $stock_status ] : $stock_status;

            if ( $product_stock_status === $target_status ) {
                $filtered_ids[] = $product_id;
            }
        }

        return $filtered_ids;
    }

    /**
     * Filter products by product type
     *
     * @param array $product_ids Array of product IDs to filter
     * @param string $product_type Product type ('simple', 'variable', 'grouped', 'external', 'any')
     * @return array Filtered product IDs
     */
    public static function filter_by_product_type( $product_ids, $product_type ) {
        if ( empty( $product_ids ) || empty( $product_type ) || $product_type === 'any' ) {
            return $product_ids;
        }

        $filtered_ids = array();

        foreach ( $product_ids as $product_id ) {
            $product = wc_get_product( $product_id );
            
            if ( ! $product ) {
                continue;
            }

            if ( $product->get_type() === $product_type ) {
                $filtered_ids[] = $product_id;
            }
        }

        return $filtered_ids;
    }

    /**
     * Exclude specific products
     *
     * @param array $product_ids Array of product IDs to filter
     * @param array $exclude_ids Array of product IDs to exclude
     * @return array Filtered product IDs
     */
    public static function exclude_products( $product_ids, $exclude_ids ) {
        if ( empty( $product_ids ) || empty( $exclude_ids ) ) {
            return $product_ids;
        }

        return array_diff( $product_ids, $exclude_ids );
    }

    /**
     * Exclude sale products
     *
     * @param array $product_ids Array of product IDs to filter
     * @param bool $exclude_sale Whether to exclude sale products
     * @return array Filtered product IDs
     */
    public static function exclude_sale_products( $product_ids, $exclude_sale ) {
        if ( empty( $product_ids ) || ! $exclude_sale ) {
            return $product_ids;
        }

        $filtered_ids = array();

        foreach ( $product_ids as $product_id ) {
            $product = wc_get_product( $product_id );
            
            if ( ! $product ) {
                continue;
            }

            if ( ! $product->is_on_sale() ) {
                $filtered_ids[] = $product_id;
            }
        }

        return $filtered_ids;
    }

    /**
     * Exclude featured products
     *
     * @param array $product_ids Array of product IDs to filter
     * @param bool $exclude_featured Whether to exclude featured products
     * @return array Filtered product IDs
     */
    public static function exclude_featured_products( $product_ids, $exclude_featured ) {
        if ( empty( $product_ids ) || ! $exclude_featured ) {
            return $product_ids;
        }

        $featured_ids = wc_get_featured_product_ids();
        return array_diff( $product_ids, $featured_ids );
    }
}
