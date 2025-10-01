#!/usr/bin/env python3
"""
Complete script to add upspr_ prefix to all remaining function definitions and calls
"""

import re
import os
from pathlib import Path

def add_prefix_to_function_definitions(content):
    """Add upspr_ prefix to function definitions"""
    
    # Pattern to match function definitions
    pattern = r'(\s*)(public|private|protected)(\s+static)?\s+function\s+([a-z_][a-z0-9_]*)\s*\('
    
    def replace_func(match):
        indent = match.group(1)
        visibility = match.group(2)
        static = match.group(3) or ''
        func_name = match.group(4)
        
        # Skip magic methods
        if func_name.startswith('__'):
            return match.group(0)
        
        # Skip if already has prefix
        if func_name.startswith('upspr_'):
            return match.group(0)
        
        # Add prefix
        return f'{indent}{visibility}{static} function upspr_{func_name}('
    
    return re.sub(pattern, replace_func, content)

def update_function_calls(content):
    """Update function calls to use new prefixed names"""
    
    # Update $this->function_name( calls
    content = re.sub(
        r'(\$this->)([a-z_][a-z0-9_]*)\(',
        lambda m: f'{m.group(1)}upspr_{m.group(2)}(' if not m.group(2).startswith('upspr_') and not m.group(2).startswith('__') else m.group(0),
        content
    )
    
    # Update self::function_name( calls
    content = re.sub(
        r'(self::)([a-z_][a-z0-9_]*)\(',
        lambda m: f'{m.group(1)}upspr_{m.group(2)}(' if not m.group(2).startswith('upspr_') and not m.group(2).startswith('__') else m.group(0),
        content
    )
    
    # Update ClassName::function_name( calls for UPSPR classes
    content = re.sub(
        r'(UPSPR_[A-Za-z_]+::)([a-z_][a-z0-9_]*)\(',
        lambda m: f'{m.group(1)}upspr_{m.group(2)}(' if not m.group(2).startswith('upspr_') and not m.group(2).startswith('__') else m.group(0),
        content
    )
    
    # Update array callbacks: array( $this, 'function_name' )
    content = re.sub(
        r"(array\s*\(\s*\$this\s*,\s*')([a-z_][a-z0-9_]*)('\s*\))",
        lambda m: f"{m.group(1)}upspr_{m.group(2)}{m.group(3)}" if not m.group(2).startswith('upspr_') and not m.group(2).startswith('__') else m.group(0),
        content
    )
    
    # Update array callbacks: array( __CLASS__, 'function_name' )
    content = re.sub(
        r"(array\s*\(\s*__CLASS__\s*,\s*')([a-z_][a-z0-9_]*)('\s*\))",
        lambda m: f"{m.group(1)}upspr_{m.group(2)}{m.group(3)}" if not m.group(2).startswith('upspr_') and not m.group(2).startswith('__') else m.group(0),
        content
    )
    
    return content

def process_file(file_path):
    """Process a single PHP file"""
    print(f"Processing: {file_path.name}")
    
    try:
        # Read file
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Add prefixes to definitions
        content = add_prefix_to_function_definitions(content)
        
        # Update function calls
        content = update_function_calls(content)
        
        # Write back if changed
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"  ✅ Updated")
            return True
        else:
            print(f"  ⏭️  No changes needed")
            return False
            
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False

def main():
    # Base directory
    base_dir = Path("/Users/wpdev94/Local Sites/dev-me/app/public/wp-content/plugins/upsellsmart-plugin")
    
    # Files to process (remaining files)
    files = [
        # Performance Tracker (partially done, complete it)
        "includes/class-upspr-engine-type/Helper/class-upspr-performance-tracker.php",
        # Display System
        "includes/class-upspr-engine-type/class-upspr-location-display.php",
        # Campaign Types
        "includes/class-upspr-engine-type/class-upspr-cross-sell.php",
        "includes/class-upspr-engine-type/class-upspr-upsell.php",
        "includes/class-upspr-engine-type/class-upspr-related-products.php",
        "includes/class-upspr-engine-type/class-upspr-frequently-bought-together.php",
        "includes/class-upspr-engine-type/class-upspr-personalized-recommendations.php",
        "includes/class-upspr-engine-type/class-upspr-trending-products.php",
        "includes/class-upspr-engine-type/class-upspr-recently-viewed.php",
        # Helper Classes
        "includes/class-upspr-engine-type/Helper/class-upspr-amplifier.php",
        "includes/class-upspr-engine-type/Helper/class-upspr-personalization.php",
        "includes/class-upspr-engine-type/Helper/class-upspr-product-filter.php",
        "includes/class-upspr-engine-type/Helper/class-upspr-visibility-checker.php",
    ]
    
    print("=" * 70)
    print("COMPLETING FUNCTION PREFIX UPDATES")
    print("=" * 70)
    print()
    
    updated_count = 0
    for file_rel_path in files:
        file_path = base_dir / file_rel_path
        if file_path.exists():
            if process_file(file_path):
                updated_count += 1
        else:
            print(f"⚠️  File not found: {file_path}")
    
    print()
    print("=" * 70)
    print(f"✅ COMPLETE! Updated {updated_count}/{len(files)} files")
    print("=" * 70)
    print()
    print("Next steps:")
    print("1. Test plugin activation")
    print("2. Check for PHP errors in debug.log")
    print("3. Test creating/editing campaigns")
    print("4. Test frontend display")

if __name__ == "__main__":
    main()

