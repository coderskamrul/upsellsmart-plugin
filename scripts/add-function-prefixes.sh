#!/bin/bash

# Script to add UPSPR_ prefix to all function names in the plugin
# This script will update function definitions and their calls throughout the codebase

echo "========================================="
echo "Adding UPSPR_ Prefix to All Functions"
echo "========================================="
echo ""

# Define the plugin directory
PLUGIN_DIR="/Users/wpdev94/Local Sites/dev-me/app/public/wp-content/plugins/upsellsmart-plugin"

# Create backup
echo "Creating backup..."
BACKUP_DIR="${PLUGIN_DIR}_backup_$(date +%Y%m%d_%H%M%S)"
cp -r "$PLUGIN_DIR" "$BACKUP_DIR"
echo "Backup created at: $BACKUP_DIR"
echo ""

# List of files to update (relative to plugin directory)
FILES=(
    "includes/class-upspr-frontend.php"
    "includes/class-upspr-migration.php"
    "includes/class-upspr-recommendations.php"
    "includes/class-upspr-rest-api.php"
    "includes/class-upspr-settings.php"
    "includes/class-upspr-engine-type/class-upspr-campaign-factory.php"
    "includes/class-upspr-engine-type/class-upspr-location-display.php"
    "includes/class-upspr-engine-type/class-upspr-cross-sell.php"
    "includes/class-upspr-engine-type/class-upspr-cross-sell-integration.php"
    "includes/class-upspr-engine-type/class-upspr-upsell.php"
    "includes/class-upspr-engine-type/class-upspr-related-products.php"
    "includes/class-upspr-engine-type/class-upspr-frequently-bought-together.php"
    "includes/class-upspr-engine-type/class-upspr-personalized-recommendations.php"
    "includes/class-upspr-engine-type/class-upspr-trending-products.php"
    "includes/class-upspr-engine-type/class-upspr-recently-viewed.php"
    "includes/class-upspr-engine-type/Helper/class-upspr-amplifier.php"
    "includes/class-upspr-engine-type/Helper/class-upspr-performance-tracker.php"
    "includes/class-upspr-engine-type/Helper/class-upspr-personalization.php"
    "includes/class-upspr-engine-type/Helper/class-upspr-product-filter.php"
    "includes/class-upspr-engine-type/Helper/class-upspr-visibility-checker.php"
)

echo "Files to process: ${#FILES[@]}"
echo ""

# Function to add prefix to function definitions
add_prefix_to_definitions() {
    local file=$1
    echo "Processing: $file"
    
    # Skip if file doesn't exist
    if [ ! -f "$file" ]; then
        echo "  ⚠️  File not found: $file"
        return
    fi
    
    # Add prefix to public function definitions (excluding __construct and other magic methods)
    sed -i '' 's/public static function \([a-z_][a-z0-9_]*\)(/public static function upspr_\1(/g' "$file"
    sed -i '' 's/public function \([a-z_][a-z0-9_]*\)(/public function upspr_\1(/g' "$file"
    sed -i '' 's/private static function \([a-z_][a-z0-9_]*\)(/private static function upspr_\1(/g' "$file"
    sed -i '' 's/private function \([a-z_][a-z0-9_]*\)(/private function upspr_\1(/g' "$file"
    sed -i '' 's/protected static function \([a-z_][a-z0-9_]*\)(/protected static function upspr_\1(/g' "$file"
    sed -i '' 's/protected function \([a-z_][a-z0-9_]*\)(/protected function upspr_\1(/g' "$file"
    
    # Fix double prefixes (in case function already had prefix)
    sed -i '' 's/upspr_upspr_/upspr_/g' "$file"
    
    # Restore magic methods (they should not have prefix)
    sed -i '' 's/public function upspr___construct(/public function __construct(/g' "$file"
    sed -i '' 's/public function upspr___destruct(/public function __destruct(/g' "$file"
    sed -i '' 's/public function upspr___call(/public function __call(/g' "$file"
    sed -i '' 's/public function upspr___callStatic(/public function __callStatic(/g' "$file"
    sed -i '' 's/public function upspr___get(/public function __get(/g' "$file"
    sed -i '' 's/public function upspr___set(/public function __set(/g' "$file"
    sed -i '' 's/public function upspr___isset(/public function __isset(/g' "$file"
    sed -i '' 's/public function upspr___unset(/public function __unset(/g' "$file"
    sed -i '' 's/public function upspr___sleep(/public function __sleep(/g' "$file"
    sed -i '' 's/public function upspr___wakeup(/public function __wakeup(/g' "$file"
    sed -i '' 's/public function upspr___toString(/public function __toString(/g' "$file"
    sed -i '' 's/public function upspr___invoke(/public function __invoke(/g' "$file"
    sed -i '' 's/public function upspr___set_state(/public function __set_state(/g' "$file"
    sed -i '' 's/public function upspr___clone(/public function __clone(/g' "$file"
    sed -i '' 's/public function upspr___debugInfo(/public function __debugInfo(/g' "$file"
    
    echo "  ✅ Definitions updated"
}

# Process each file
for file in "${FILES[@]}"; do
    full_path="$PLUGIN_DIR/$file"
    add_prefix_to_definitions "$full_path"
done

echo ""
echo "========================================="
echo "Phase 1 Complete: Function Definitions Updated"
echo "========================================="
echo ""
echo "⚠️  IMPORTANT: Phase 2 Required"
echo ""
echo "You now need to update all function CALLS throughout the codebase."
echo "This includes:"
echo "  - \$this->function_name() → \$this->upspr_function_name()"
echo "  - self::function_name() → self::upspr_function_name()"
echo "  - ClassName::function_name() → ClassName::upspr_function_name()"
echo "  - array( \$this, 'function_name' ) → array( \$this, 'upspr_function_name' )"
echo ""
echo "Backup location: $BACKUP_DIR"
echo ""
echo "========================================="

