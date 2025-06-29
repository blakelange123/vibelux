# ShakaPT Comprehensive Lifestyle and Wellness Questionnaire Analysis

## Form Overview
- **Form Name**: Comprehensive Lifestyle and Wellness Questionnaire
- **Form Key**: `comprehensivelifestyleandwellnessquestionnaire2`
- **Form ID**: 10
- **Created**: June 17, 2023
- **Status**: Published
- **Total Fields**: 127 fields
- **Required Fields**: 5 fields
- **Optional Fields**: 122 fields

## User Assessment Flow Structure

### 1. Food Preferences Assessment (Fields 1-76)
This is the largest section with **76 fields** using Likert scales to assess food preferences across two main categories:

#### Protein Preferences (Likert Group 467 - 32 items)
**Scale Options**: Strongly Dislike | Dislike | Neutral | Like | Strongly Like | N/A

Foods assessed:
- **Meats**: Chicken, Turkey, Beef, Pork, Lamb, Venison, Duck, Rabbit, Bison
- **Seafood**: Salmon, Tuna, Cod, Shrimp, Crab, Lobster, Mussels, Clams, Oysters, Scallops
- **Plant Proteins**: Tofu, Tempeh, Seitan, Lentils, Chickpeas, Black Beans, Quinoa, Hemp Seeds, Chia Seeds, Spirulina, Nutritional Yeast, Protein Powder, Eggs

#### Vegetable Preferences (Likert Group 468 - 37 items)
**Scale Options**: Strongly Dislike | Dislike | Neutral | Like | Strongly Like | N/A

Vegetables assessed:
- **Leafy Greens**: Arugula, Spinach, Kale, Swiss Chard, Collard Greens, Romaine Lettuce, Cabbage
- **Cruciferous**: Broccoli, Brussels Sprouts, Cauliflower, Bok Choy
- **Root Vegetables**: Beets, Carrots, Sweet Potatoes, Turnips, Parsnips, Radishes
- **Other Vegetables**: Artichoke, Asparagus, Bell Peppers, Zucchini, Eggplant, Tomatoes, Cucumber, Onions, Garlic, Mushrooms, Avocado, Celery, Green Beans, Peas, Corn, Okra, Fennel, Leeks, Artichoke Hearts

#### Overall Preference Summary Fields
- **Field 99**: "How do you feel about the following proteins?" (likert)
- **Field 100**: "How do you feel about the following vegetables?" (likert)

### 2. Personal Information (Fields 3, 8, 13, 18, 20, 101-103)
**Required fields marked with ✅**

- ✅ **First Name** (Field 3, text) - `tbyhr`
- ✅ **Last Name** (Field 8, text) - `r5pgl`
- ✅ **Email Address** (Field 13, email) - `w9kqcb`
- ✅ **Phone Number** (Field 18, phone) - `y6xm7k`
  - Description: "Fitness via Text. We'll send workout reminders and guidance to your phone. Easy opt-out anytime."
- ✅ **Address** (Field 20, address) - `4n6n2b`
- **Gender** (Field 101, select) - `yp6gm`
  - Options: Male | Female | Other | Prefer not to say
- **Date of Birth** (Field 102, date) - `5w78dn`

### 3. Health Assessment (Fields 104-115)

#### Medical History & Current Health
- **Diagnosed Health Conditions** (Field 104, checkbox) - `n4y9z`
  - 19 options including: Diabetes, High Blood Pressure, Heart Disease, Arthritis, Asthma, Depression, Anxiety, etc.
- **Current Medications** (Field 105, text) - `qzh7p`
- **Medical History** (Field 106, select) - `w5j4r`
  - 23 options including various diseases and conditions
- **Current Pain Locations** (Field 107, text) - `p8m3x`

#### Pregnancy Status (Field 108)
- **Are you currently pregnant?** (radio) - `4jq8n`
  - Options: Yes | No
  - **Conditional Logic**: Hides field 386 if "Male" is selected for gender

#### Exercise Preferences & History
- **Exercise Openness** (Field 109, radio) - `8f2kx`
  - "Are you open to trying new or challenging exercises, or do you prefer sticking to familiar routines?"
  - Options: I'm open to trying new and challenging exercises | I prefer sticking to familiar routines
- **Exercise History** (Field 110, select) - `m7n3q`
  - "How many years have you been consistently incorporating exercise into your daily routine?"
  - Options: Less than 1 year | 1-2 years | 3-5 years | 6-10 years | More than 10 years
- **Current Exercise Types** (Field 111, checkbox) - `6k9r2`
  - 19 options including: Walking, Running, Swimming, Weightlifting, Yoga, Pilates, etc.
- **Specific Exercise Interests** (Field 112, text) - `t4h8m`
  - "Is there a specific type of exercise or workout that you are particularly interested in emphasizing in your routine?"

### 4. Program Interest & Payment (Fields 113-127)

#### Program Purchase Decision
- **Purchase Interest** (Field 113, radio) - `3x7n9`
  - "Based on the information you have received and your current needs and goals, would you be interested in purchasing our weekly program for $34.99 a month?"
  - Options: Yes, I'm interested in purchasing | No, I'm not interested at this time

#### Payment Processing Fields
- **User ID** (Field 114, user_id) - `bc79s`
- **Password** (Field 115, password) - `vhq4k`
- **Credit Card** (Field 116, credit_card) - `2m8j6`
  - **Conditional Logic**: Hides field 546 if "Credit Card" option is selected
- **Payment Gateway** (Field 117, gateway) - `f9p3x`

#### Additional Assessment Fields
- **Miscellaneous Options** (Fields 118-127, various types)
  - Multiple select, radio, and number fields for additional assessments
  - Includes fields for supplements, dietary restrictions, and lifestyle factors

## Field Type Distribution

| Field Type  | Count | Usage |
|-------------|-------|-------|
| Checkbox    | 75    | Primary assessment tool (Likert scales, multi-select options) |
| Select      | 16    | Single-choice dropdowns |
| Text        | 14    | Open-ended responses |
| Radio       | 9     | Binary or limited choice questions |
| Number      | 3     | Numeric inputs |
| Likert      | 2     | Overall preference summaries |
| Address     | 1     | Contact information |
| Credit Card | 1     | Payment processing |
| Date        | 1     | Birth date |
| Email       | 1     | Contact information |
| Gateway     | 1     | Payment processing |
| Password    | 1     | Account creation |
| Phone       | 1     | Contact information |
| User ID     | 1     | Account creation |

## Conditional Logic Rules

1. **Gender-based Pregnancy Question**
   - Field: "Are you currently pregnant?" (Field 108)
   - Logic: Hides field 386 if gender is "Male"

2. **Payment Method Logic**
   - Field: "Credit Card" (Field 116)
   - Logic: Hides field 546 if "Credit Card" option is selected

## Assessment Categories Summary

1. **Food Preferences** (76 fields, 60% of form)
   - Comprehensive protein and vegetable preference assessment
   - Uses standardized 6-point Likert scale
   - Divided into two logical groups (proteins vs vegetables)

2. **Personal Information** (8 fields, 6% of form)
   - Basic demographic and contact information
   - 5 required fields ensure data completeness

3. **Health Assessment** (12 fields, 9% of form)
   - Medical history, current conditions, pain assessment
   - Exercise history and preferences
   - Pregnancy status with conditional logic

4. **Program & Payment** (15 fields, 12% of form)
   - Purchase interest assessment
   - Account creation and payment processing
   - Additional lifestyle factors

5. **Miscellaneous** (16 fields, 13% of form)
   - Additional assessment fields
   - Supplementary data collection

## Technical Implementation Notes

- **Form Framework**: Formidable Forms for WordPress
- **Field Keys**: Each field has a unique alphanumeric key for database storage
- **Conditional Logic**: Minimal use (only 2 fields have conditional rules)
- **Required Validation**: Only 5 critical fields are required
- **Data Structure**: Hierarchical XML export with nested field configurations
- **Likert Grouping**: Foods grouped by likert_id (467 for proteins, 468 for vegetables)

## Recommendations for Rebuilding

1. **Modular Structure**: Organize into clear sections (Demographics, Food Preferences, Health, Program)
2. **Progressive Disclosure**: Consider breaking into multiple pages/steps
3. **Smart Defaults**: Use N/A options strategically for unknown preferences
4. **Validation**: Implement client-side validation for better UX
5. **Conditional Logic**: Expand conditional logic for more personalized experience
6. **Mobile Optimization**: Ensure Likert scales work well on mobile devices
7. **Progress Indicators**: Add progress bars for long assessment
8. **Save & Resume**: Allow users to save progress and return later