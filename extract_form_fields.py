#!/usr/bin/env python3
"""
Extract form fields from Formidable XML export for ShakaPT
Comprehensive Lifestyle and Wellness Questionnaire
"""

import xml.etree.ElementTree as ET
import json
import re

def parse_field_options(options_str):
    """Parse the options string to extract field options"""
    if not options_str:
        return []
    
    try:
        # Remove CDATA wrapper if present
        clean_str = options_str.replace('<![CDATA[', '').replace(']]>', '')
        if clean_str.strip() == '':
            return []
        
        # Try to parse as JSON
        options = json.loads(clean_str)
        return options
    except:
        return options_str

def parse_field_options_config(field_options_str):
    """Parse the field_options configuration"""
    if not field_options_str:
        return {}
    
    try:
        clean_str = field_options_str.replace('<![CDATA[', '').replace(']]>', '')
        if clean_str.strip() == '':
            return {}
        
        config = json.loads(clean_str)
        return config
    except:
        return {}

def extract_form_fields(xml_file_path):
    """Extract all fields from the comprehensive questionnaire form"""
    
    # Read the XML file in chunks to handle large file
    with open(xml_file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the specific form section
    form_start = content.find('<form_key><![CDATA[comprehensivelifestyleandwellnessquestionnaire2]]></form_key>')
    if form_start == -1:
        print("Form not found!")
        return None
    
    # Find the form opening tag before this
    form_opening = content.rfind('<form>', 0, form_start)
    
    # Find the corresponding closing tag
    form_level = 0
    pos = form_opening
    while pos < len(content):
        if content[pos:pos+6] == '<form>':
            form_level += 1
        elif content[pos:pos+7] == '</form>':
            form_level -= 1
            if form_level == 0:
                form_end = pos + 7
                break
        pos += 1
    
    # Extract the form XML
    form_xml = content[form_opening:form_end]
    
    # Parse with ElementTree
    try:
        root = ET.fromstring(form_xml)
    except ET.ParseError as e:
        print(f"XML Parse Error: {e}")
        return None
    
    # Extract form metadata
    form_info = {
        'form_id': root.find('id').text if root.find('id') is not None else '',
        'form_key': root.find('form_key').text if root.find('form_key') is not None else '',
        'name': root.find('name').text if root.find('name') is not None else '',
        'description': root.find('description').text if root.find('description') is not None else '',
        'created_at': root.find('created_at').text if root.find('created_at') is not None else '',
        'status': root.find('status').text if root.find('status') is not None else '',
        'fields': []
    }
    
    # Extract all fields
    fields = root.findall('field')
    print(f"Found {len(fields)} fields in the form")
    
    for field in fields:
        field_data = {}
        
        # Basic field info
        field_data['id'] = field.find('id').text if field.find('id') is not None else ''
        field_data['field_key'] = field.find('field_key').text if field.find('field_key') is not None else ''
        field_data['name'] = field.find('name').text if field.find('name') is not None else ''
        field_data['description'] = field.find('description').text if field.find('description') is not None else ''
        field_data['type'] = field.find('type').text if field.find('type') is not None else ''
        field_data['default_value'] = field.find('default_value').text if field.find('default_value') is not None else ''
        field_data['field_order'] = int(field.find('field_order').text) if field.find('field_order') is not None else 0
        field_data['required'] = field.find('required').text == '1' if field.find('required') is not None else False
        
        # Parse options (for select, radio, checkbox fields)
        options_elem = field.find('options')
        if options_elem is not None:
            field_data['options'] = parse_field_options(options_elem.text)
        else:
            field_data['options'] = []
        
        # Parse field configuration
        field_options_elem = field.find('field_options')
        if field_options_elem is not None:
            field_data['field_config'] = parse_field_options_config(field_options_elem.text)
        else:
            field_data['field_config'] = {}
        
        form_info['fields'].append(field_data)
    
    # Sort fields by field_order
    form_info['fields'].sort(key=lambda x: x['field_order'])
    
    return form_info

def main():
    xml_file = '/Users/blakelange/Downloads/shakapt.formidable.2023-09-10.xml'
    
    print("Extracting form fields from ShakaPT Comprehensive Lifestyle and Wellness Questionnaire...")
    
    form_data = extract_form_fields(xml_file)
    
    if form_data:
        # Save to JSON file
        output_file = '/Users/blakelange/vibelux-app/shakapt_questionnaire_fields.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(form_data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Extracted {len(form_data['fields'])} fields")
        print(f"📄 Data saved to: {output_file}")
        
        # Print summary
        print("\n📊 FORM SUMMARY:")
        print(f"Form Name: {form_data['name']}")
        print(f"Form Key: {form_data['form_key']}")
        print(f"Total Fields: {len(form_data['fields'])}")
        
        # Field type breakdown
        field_types = {}
        required_count = 0
        for field in form_data['fields']:
            field_type = field['type']
            field_types[field_type] = field_types.get(field_type, 0) + 1
            if field['required']:
                required_count += 1
        
        print(f"Required Fields: {required_count}")
        print(f"Optional Fields: {len(form_data['fields']) - required_count}")
        
        print("\n📋 FIELD TYPES:")
        for field_type, count in sorted(field_types.items()):
            print(f"  {field_type}: {count}")
            
        return form_data
    else:
        print("❌ Failed to extract form data")
        return None

if __name__ == "__main__":
    main()