import os
import re

def aggressive_replace(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Old content vs new
    # Remove gradients and old blues/slates
    replacements = {
        'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(30, 41, 59, 0.5) 100%)': '#FFFFFF',
        '#2563EB': 'var(--purple-600)',
        'rgba(59, 130, 246, 0.12)': 'var(--purple-100)',
        'rgba(30, 41, 59, 0.5)': 'var(--canvas)',
        'rgba(255, 255, 255, 0.08)': '#FFFFFF',
        'rgba(255, 255, 255, 0.15)': 'var(--purple-100)',
        'rgba(255, 255, 255, 0.25)': 'var(--purple-100)',
        'rgba(255, 255, 255, 0.06)': 'var(--line)',
        'rgba(16, 185, 129, 0.15)': 'rgba(16, 185, 129, 0.1)',
        'color: var(--ink-900)': 'color: var(--ink-900)',
        'color: "#F8FAFC"': 'color: "var(--ink-900)"',
        'color: "#94A3B8"': 'color: "var(--ink-500)"',
        'color: "#3B82F6"': 'color: "var(--purple-600)"',
        'color="#3B82F6"': 'color="var(--purple-600)"',
        'color="#F8FAFC"': 'color="var(--ink-900)"',
        'color="#94A3B8"': 'color="var(--ink-500)"',
        'border: 1px solid rgba(255, 255, 255, 0.15)': 'border: 1px solid var(--line)',
        'border-color: rgba(255, 255, 255, 0.25)': 'border-color: var(--purple-600)',
        'background: var(--ink-900)': 'background: #FFFFFF', # Cards should be white!
    }
    
    for old, new in replacements.items():
        content = content.replace(old, new)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.js') or file.endswith('.jsx'):
            aggressive_replace(os.path.join(root, file))
