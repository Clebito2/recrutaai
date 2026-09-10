import os
import glob

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Inline styles replacements
    content = content.replace('color="#3B82F6"', 'color="var(--purple-600)"')
    content = content.replace('color: "#F8FAFC"', 'color: "var(--ink-900)"')
    content = content.replace('color: "#94A3B8"', 'color: "var(--ink-500)"')
    content = content.replace('color: "#F59E0B"', 'color: "var(--status-warning)"')
    content = content.replace('color: "#10B981"', 'color: "var(--status-success)"')
    content = content.replace('color="#94A3B8"', 'color="var(--ink-500)"')
    
    # CSS Block replacements
    css_replacements = {
        '#131B2A': '#FFFFFF', # Cards background
        '#0F172A': 'var(--canvas)', # Main background
        '#1E293B': 'var(--line)', # Borders
        '#94A3B8': 'var(--ink-500)', # Muted text
        '#F8FAFC': 'var(--ink-900)', # Headers (usually)
        '#FFFFFF': 'var(--ink-900)', # White text -> dark text (since bg is now white)
        '#3B82F6': 'var(--purple-600)', # Primary
        '#F59E0B': 'var(--status-warning)',
        '#0B0F17': '#FFFFFF',
        '#10B981': 'var(--status-success)',
        'rgba(255, 255, 255, 0.02)': 'var(--purple-100)',
        'rgba(255, 255, 255, 0.04)': 'var(--line)',
        'rgba(255, 255, 255, 0.05)': 'var(--purple-100)',
        'rgba(255, 255, 255, 0.1)': 'var(--line)',
        'rgba(255, 255, 255, 0.3)': 'var(--ink-500)',
        'rgba(255, 255, 255, 0.4)': 'var(--ink-500)',
        'rgba(255, 255, 255, 0.5)': 'var(--ink-500)',
        'rgba(255, 255, 255, 0.7)': 'var(--ink-700)',
        '#CBD5E1': 'var(--ink-700)',
        '#60A5FA': 'var(--purple-600)',
    }
    
    # We only want to replace inside <style jsx>
    style_start = 0
    while True:
        style_start = content.find('<style jsx>', style_start)
        if style_start == -1:
            break
        style_end = content.find('</style>', style_start)
        if style_end == -1:
            break
            
        style_block = content[style_start:style_end]
        for old, new in css_replacements.items():
            style_block = style_block.replace(old, new)
        
        content = content[:style_start] + style_block + content[style_end:]
        style_start = style_end

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

# Process all JS files in dashboard
for root, dirs, files in os.walk('src/app/dashboard'):
    for file in files:
        if file.endswith('.js'):
            process_file(os.path.join(root, file))

# Also process components
for root, dirs, files in os.walk('src/components'):
    for file in files:
        if file.endswith('.js'):
            process_file(os.path.join(root, file))
