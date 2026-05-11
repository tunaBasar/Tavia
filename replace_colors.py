import os

replacements = {
    '#0F0F1A': '#1C2520',
    '#6C63FF': '#6B9E78',
    'rgba(108,99,255,': 'rgba(107,158,120,'
}

def process_directory(directory):
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r') as f:
                    content = f.read()
                
                new_content = content
                for old, new in replacements.items():
                    new_content = new_content.replace(old, new)
                
                if new_content != content:
                    with open(filepath, 'w') as f:
                        f.write(new_content)
                    print(f"Updated {filepath}")

process_directory('tavia-customer-ui/app')
process_directory('tavia-customer-ui/components')
