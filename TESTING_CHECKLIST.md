# Vibelux App Testing Checklist

## 🚀 Quick Start Test
```bash
npm run dev
```
Visit: http://localhost:3000

## 1. Core Functionality Tests

### Authentication
- [ ] Sign up with new account
- [ ] Sign in/out flow
- [ ] Protected routes redirect properly
- [ ] User dashboard loads

### Navigation
- [ ] Hamburger menu opens/closes
- [ ] All nav links work
- [ ] Calculator dropdown functions
- [ ] Mobile responsive menu

## 2. Calculator Tests

### Basic Calculators
- [ ] **PPFD Calculator** - Test with different fixture values
- [ ] **DLI Calculator** - Verify calculations match expected values
- [ ] **Coverage Area** - Check grid visualization
- [ ] **Wattage Calculator** - Test power calculations
- [ ] **Energy Cost** - Verify cost estimates

### New Calculators
- [ ] **CO₂ Enrichment**
  - Room volume calculations
  - Cost analysis accuracy
  - Photosynthesis boost values
- [ ] **Coverage Area Optimizer**
  - Visual grid updates
  - Spacing recommendations
- [ ] **ROI Calculator**
  - Payback period calculations
  - NPV calculations
  - Chart rendering

### PPFD Heat Map (Priority)
- [ ] DLC fixture search works
- [ ] Can select Signify fixtures
- [ ] Asymmetric beam angles display correctly (ellipses)
- [ ] Heat map renders properly
- [ ] Can add/remove/edit fixtures
- [ ] Uniformity calculations update
- [ ] Export functionality

## 3. AI Assistant Tests
- [ ] Chat button opens assistant
- [ ] Messages send and receive
- [ ] Streaming responses work
- [ ] Credit deduction (if implemented)
- [ ] Project context awareness

## 4. Design Studio
- [ ] Canvas loads properly
- [ ] Can add/move fixtures
- [ ] Grid snap works
- [ ] PAR map displays
- [ ] Save/export functions

## 5. Fixtures Page
- [ ] DLC fixtures load
- [ ] Search functionality
- [ ] Filters work (PPE, wattage, etc.)
- [ ] Compare feature
- [ ] Pagination
- [ ] Individual fixture details

## 6. UI/UX Tests
- [ ] Glassmorphic effects render
- [ ] Dark theme consistent
- [ ] Hover states work
- [ ] Loading states appear
- [ ] Error messages display
- [ ] Responsive on mobile/tablet

## 7. Performance Tests
- [ ] Page load times acceptable
- [ ] No console errors
- [ ] Heat map with many fixtures
- [ ] Search responsiveness
- [ ] Memory usage stable

## 8. Data Integrity
- [ ] Calculations accurate
- [ ] DLC data loads correctly
- [ ] Form validations work
- [ ] Edge cases handled (0 values, large numbers)

## 9. Browser Compatibility
- [ ] Chrome
- [ ] Safari
- [ ] Firefox
- [ ] Edge

## 10. Critical User Flows

### Flow 1: Design a Grow Room
1. [ ] Navigate to calculators
2. [ ] Use PPFD heat map
3. [ ] Add DLC fixtures
4. [ ] Adjust room dimensions
5. [ ] View uniformity metrics
6. [ ] Export results

### Flow 2: Calculate ROI
1. [ ] Open ROI calculator
2. [ ] Enter current system
3. [ ] Enter LED upgrade
4. [ ] Review analysis
5. [ ] Check all metrics display

### Flow 3: Get AI Recommendations
1. [ ] Open AI Assistant
2. [ ] Ask about lighting for specific crop
3. [ ] Receive relevant answer
4. [ ] Follow up questions work

## 🐛 Known Issues to Verify Fixed
- [ ] React hydration errors gone
- [ ] Buttons are clickable
- [ ] No middleware errors
- [ ] Predictions page styled correctly

## 📝 Testing Notes
Document any issues found:

### High Priority Issues:
1. 
2. 
3. 

### Medium Priority Issues:
1. 
2. 
3. 

### Low Priority/Enhancements:
1. 
2. 
3. 

## ✅ Sign-off
- [ ] All critical features working
- [ ] No breaking bugs found
- [ ] Performance acceptable
- [ ] Ready for production