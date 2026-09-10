import re
import sys

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
    content = content.replace('color="#3B82F6"', 'color="var(--purple-600)"')

    # CSS Block replacements
    css_replacements = {
        '#131B2A': '#FFFFFF',
        '#1E293B': 'var(--line)',
        '#94A3B8': 'var(--ink-500)',
        '#FFFFFF': 'var(--ink-900)',
        '#3B82F6': 'var(--purple-600)',
        '#F59E0B': 'var(--status-warning)',
        '#0B0F17': '#FFFFFF',
        '#10B981': 'var(--status-success)',
        'rgba(255, 255, 255, 0.02)': 'var(--purple-100)',
        'rgba(255, 255, 255, 0.04)': 'var(--line)',
        '#CBD5E1': 'var(--ink-700)',
        'rgba(16, 185, 129, 0.15)': 'rgba(16, 185, 129, 0.1)',
        'rgba(245, 158, 11, 0.15)': 'rgba(245, 158, 11, 0.1)',
        'rgba(59, 130, 246, 0.12)': 'rgba(91, 42, 134, 0.1)',
        'rgba(59, 130, 246, 0.25)': 'var(--purple-100)',
        '#60A5FA': 'var(--purple-600)',
        'rgba(239, 68, 68, 0.1)': 'rgba(239, 68, 68, 0.05)',
        'rgba(239, 68, 68, 0.2)': 'rgba(239, 68, 68, 0.15)',
        '#EF4444': 'var(--status-danger)'
    }
    
    # We only want to replace inside <style jsx>
    style_start = content.find('<style jsx>')
    style_end = content.find('</style>', style_start)
    
    if style_start != -1:
        style_block = content[style_start:style_end]
        for old, new in css_replacements.items():
            style_block = style_block.replace(old, new)
        
        # Enforce height 52px on tr and remove zebra
        style_block = style_block.replace(
            'padding: 16px 18px;',
            'padding: 0 16px; height: 52px;'
        )
        style_block = style_block.replace(
            'background: rgba(245, 158, 11, 0.03);',
            'background: #FFF9ED;' # subtle warning bg for light theme
        )
        
        content = content[:style_start] + style_block + content[style_end:]

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

process_file('src/app/dashboard/admin/users/page.js')
