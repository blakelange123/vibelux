#!/usr/bin/env python3
"""
Analyze the ShakaPT Comprehensive Lifestyle and Wellness Questionnaire
Extract patterns, sections, and create a structured overview
"""

import json
import re
from collections import defaultdict, Counter

def analyze_questionnaire(json_file_path):
    """Analyze the questionnaire structure and patterns"""
    
    with open(json_file_path, 'r', encoding='utf-8') as f:
        form_data = json.load(f)
    
    fields = form_data['fields']
    
    analysis = {
        'form_metadata': {
            'name': form_data['name'],
            'form_key': form_data['form_key'],
            'total_fields': len(fields),
            'required_fields': sum(1 for f in fields if f['required']),
            'optional_fields': sum(1 for f in fields if not f['required'])
        },
        'field_types': {},
        'sections': [],
        'required_fields': [],
        'conditional_logic': [],
        'likert_scales': [],
        'food_preferences': [],
        'personal_info': [],
        'health_assessments': [],
        'lifestyle_questions': []
    }
    
    # Analyze field types
    field_type_counts = Counter(f['type'] for f in fields)
    analysis['field_types'] = dict(field_type_counts)
    
    # Categorize fields by patterns
    for field in fields:
        field_name = field['name'].lower() if field['name'] else ''
        field_type = field['type']
        
        # Required fields
        if field['required']:
            analysis['required_fields'].append({
                'name': field['name'],
                'type': field['type'],
                'field_key': field['field_key'],
                'order': field['field_order']
            })
        
        # Likert scale fields (based on options pattern)
        if field['options'] and len(field['options']) > 0:
            option_labels = [opt.get('label', '') for opt in field['options'] if isinstance(opt, dict)]
            if any('strongly' in label.lower() for label in option_labels):
                analysis['likert_scales'].append({
                    'name': field['name'],
                    'field_key': field['field_key'],
                    'options': field['options'],
                    'likert_id': field['field_config'].get('likert_id', None)
                })
        
        # Food preferences (many fields seem to be food items)
        food_keywords = ['chicken', 'turkey', 'beef', 'fish', 'vegetable', 'fruit', 'grain', 
                        'dairy', 'cheese', 'milk', 'bread', 'rice', 'pasta', 'bean', 'nut']
        if any(keyword in field_name for keyword in food_keywords) or \
           (field['options'] and any('like' in str(opt).lower() for opt in field['options'])):
            analysis['food_preferences'].append({
                'name': field['name'],
                'type': field['type'],
                'field_key': field['field_key'],
                'options': field['options']
            })
        
        # Personal information fields
        personal_keywords = ['name', 'email', 'phone', 'address', 'age', 'birth', 'gender']
        if any(keyword in field_name for keyword in personal_keywords) or field_type in ['email', 'phone', 'address']:
            analysis['personal_info'].append({
                'name': field['name'],
                'type': field['type'],
                'field_key': field['field_key'],
                'required': field['required']
            })
        
        # Health assessment fields
        health_keywords = ['health', 'medical', 'condition', 'symptom', 'pain', 'injury', 
                          'medication', 'allergy', 'exercise', 'activity', 'sleep', 'stress']
        if any(keyword in field_name for keyword in health_keywords):
            analysis['health_assessments'].append({
                'name': field['name'],
                'type': field['type'],
                'field_key': field['field_key'],
                'options': field['options'] if field['options'] else None
            })
        
        # Conditional logic detection
        field_config = field['field_config']
        if 'hide_field' in field_config or 'show_field' in field_config:
            analysis['conditional_logic'].append({
                'field_name': field['name'],
                'field_key': field['field_key'],
                'logic': {k: v for k, v in field_config.items() 
                         if 'hide' in k or 'show' in k or 'cond' in k}
            })
    
    return analysis

def generate_field_summary(json_file_path):
    """Generate a detailed field summary"""
    
    with open(json_file_path, 'r', encoding='utf-8') as f:
        form_data = json.load(f)
    
    fields = form_data['fields']
    
    summary = []
    
    for i, field in enumerate(fields, 1):
        field_summary = {
            'order': field['field_order'],
            'name': field['name'],
            'field_key': field['field_key'],
            'type': field['type'],
            'required': field['required'],
            'description': field['description'],
            'default_value': field['default_value'],
            'options_count': len(field['options']) if field['options'] else 0,
            'has_conditional_logic': bool(field['field_config'].get('hide_field') or 
                                        field['field_config'].get('show_field')),
            'special_config': {k: v for k, v in field['field_config'].items() 
                             if k in ['likert_id', 'custom_html', 'classes', 'in_section']}
        }
        
        # Add options if they exist and are manageable
        if field['options'] and len(field['options']) <= 20:
            field_summary['options'] = field['options']
        elif field['options'] and len(field['options']) > 20:
            field_summary['options_preview'] = field['options'][:5]
            field_summary['options_note'] = f"Showing 5 of {len(field['options'])} options"
        
        summary.append(field_summary)
    
    return summary

def main():
    json_file = '/Users/blakelange/vibelux-app/shakapt_questionnaire_fields.json'
    
    print("🔍 ANALYZING SHAKAPT COMPREHENSIVE LIFESTYLE AND WELLNESS QUESTIONNAIRE")
    print("=" * 80)
    
    # Run analysis
    analysis = analyze_questionnaire(json_file)
    
    # Print form metadata
    meta = analysis['form_metadata']
    print(f"\n📋 FORM OVERVIEW:")
    print(f"Name: {meta['name']}")
    print(f"Form Key: {meta['form_key']}")
    print(f"Total Fields: {meta['total_fields']}")
    print(f"Required Fields: {meta['required_fields']}")
    print(f"Optional Fields: {meta['optional_fields']}")
    
    # Print field types
    print(f"\n🏷️  FIELD TYPES BREAKDOWN:")
    for field_type, count in sorted(analysis['field_types'].items()):
        print(f"  {field_type:12}: {count:3} fields")
    
    # Print required fields
    print(f"\n✅ REQUIRED FIELDS ({len(analysis['required_fields'])}):")
    for field in analysis['required_fields']:
        print(f"  {field['order']:3}. {field['name']} ({field['type']})")
    
    # Print food preferences section
    print(f"\n🥗 FOOD PREFERENCES ({len(analysis['food_preferences'])}):")
    for i, field in enumerate(analysis['food_preferences'][:10], 1):
        options_text = f" - {len(field['options'])} options" if field['options'] else ""
        print(f"  {i:2}. {field['name']} ({field['type']}){options_text}")
    if len(analysis['food_preferences']) > 10:
        print(f"     ... and {len(analysis['food_preferences']) - 10} more food preference fields")
    
    # Print personal info fields
    print(f"\n👤 PERSONAL INFORMATION ({len(analysis['personal_info'])}):")
    for field in analysis['personal_info']:
        req_text = " (REQUIRED)" if field['required'] else ""
        print(f"  • {field['name']} ({field['type']}){req_text}")
    
    # Print health assessments
    print(f"\n🏥 HEALTH ASSESSMENTS ({len(analysis['health_assessments'])}):")
    for field in analysis['health_assessments'][:10]:
        options_text = f" - {len(field['options'])} options" if field['options'] else ""
        print(f"  • {field['name']} ({field['type']}){options_text}")
    
    # Print likert scales
    print(f"\n📊 LIKERT SCALE FIELDS ({len(analysis['likert_scales'])}):")
    likert_groups = defaultdict(list)
    for field in analysis['likert_scales']:
        likert_id = field.get('likert_id')
        likert_groups[likert_id].append(field['name'])
    
    for likert_id, field_names in likert_groups.items():
        print(f"  Likert Group {likert_id}: {len(field_names)} fields")
        for name in field_names[:5]:
            print(f"    • {name}")
        if len(field_names) > 5:
            print(f"    ... and {len(field_names) - 5} more")
    
    # Print conditional logic
    if analysis['conditional_logic']:
        print(f"\n🔄 CONDITIONAL LOGIC ({len(analysis['conditional_logic'])}):")
        for logic in analysis['conditional_logic']:
            print(f"  • {logic['field_name']}: {logic['logic']}")
    
    # Generate detailed field summary
    print(f"\n📝 GENERATING DETAILED FIELD SUMMARY...")
    field_summary = generate_field_summary(json_file)
    
    # Save detailed summary
    summary_file = '/Users/blakelange/vibelux-app/shakapt_questionnaire_summary.json'
    with open(summary_file, 'w', encoding='utf-8') as f:
        json.dump({
            'analysis': analysis,
            'detailed_fields': field_summary
        }, f, indent=2, ensure_ascii=False)
    
    print(f"💾 Detailed analysis saved to: {summary_file}")
    
    return analysis, field_summary

if __name__ == "__main__":
    main()