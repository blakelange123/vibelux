'use client';

import { AdvancedDesignerProfessional } from '@/components/designer/AdvancedDesignerProfessional';

export default function AdvancedDesignerPage() {
  return (
    <div className="min-h-screen bg-gray-900 dark:bg-gray-900">
      {/* Global styles to make UI more readable */}
      <style jsx global>{`
        /* Force dark background */
        html, body {
          background-color: #111827 !important;
          color: #f3f4f6 !important;
        }
        
        /* Increase base font sizes for better readability */
        #designer-app .text-xs { font-size: 1rem !important; }
        #designer-app .text-sm { font-size: 1.125rem !important; }
        #designer-app .text-base { font-size: 1.25rem !important; }
        #designer-app .text-lg { font-size: 1.75rem !important; }
        #designer-app .text-xl { font-size: 2rem !important; }
        #designer-app .text-2xl { font-size: 2.25rem !important; }
        
        /* Make all buttons larger and easier to click - HIGHEST PRIORITY */
        #designer-app button,
        #designer-app button[class*="bg-"],
        #designer-app .bg-white button,
        #designer-app button.bg-white {
          min-height: 48px !important;
          min-width: 48px !important;
          padding: 0.75rem !important;
          background-color: #374151 !important;
          background: #374151 !important;
          color: #f3f4f6 !important;
          border: 1px solid #4b5563 !important;
        }
        
        /* Fix white background buttons specifically */
        #designer-app button[style*="background"],
        #designer-app button.bg-white,
        #designer-app .bg-white button {
          background-color: #374151 !important;
          color: #f3f4f6 !important;
          border: 1px solid #4b5563 !important;
        }
        
        /* Hover states for buttons */
        #designer-app button:hover {
          background-color: #4b5563 !important;
          color: #ffffff !important;
        }
        
        /* Selected/active button states */
        #designer-app button.active,
        #designer-app button[aria-selected="true"] {
          background-color: #3b82f6 !important;
          color: #ffffff !important;
          border-color: #2563eb !important;
        }
        
        /* Make icons larger */
        #designer-app svg {
          width: 24px !important;
          height: 24px !important;
          min-width: 24px;
          min-height: 24px;
        }
        
        /* Tool palette specific adjustments */
        #designer-app .tool-palette svg {
          width: 28px !important;
          height: 28px !important;
        }
        
        /* Larger input fields */
        #designer-app input, 
        #designer-app select, 
        #designer-app textarea {
          font-size: 1rem !important;
          padding: 0.5rem !important;
          min-height: 40px;
        }
        
        /* Ensure panels have readable text */
        #designer-app .panel-content {
          font-size: 1rem !important;
        }
        
        /* Fix AI Assistant positioning */
        .ai-assistant-button {
          position: fixed !important;
          bottom: 24px !important;
          right: 24px !important;
          z-index: 9999 !important;
        }
        
        .ai-assistant-container {
          position: fixed !important;
          bottom: 20px !important;
          right: 20px !important;
          z-index: 9998 !important;
          max-width: 400px !important;
          max-height: 600px !important;
        }
        
        /* Make AI Assistant text larger */
        .ai-assistant-container * {
          font-size: 1.125rem !important;
        }
        
        .ai-assistant-container h3 {
          font-size: 1.25rem !important;
        }
        
        .ai-assistant-container button {
          font-size: 1rem !important;
        }
        
        /* Ensure AI button doesn't inherit designer-app button styles */
        .ai-assistant-button {
          min-height: auto !important;
          min-width: auto !important;
          padding: 1rem !important;
        }
        
        /* Force dark theme for all text elements */
        #designer-app * {
          color: inherit !important;
        }
        
        /* Fix any white text on white background issues */
        #designer-app .text-white {
          color: #f3f4f6 !important;
        }
        
        /* Ensure button text is always visible */
        #designer-app button * {
          color: inherit !important;
        }
        
        /* Fix specific button text issues */
        #designer-app button span,
        #designer-app button div {
          color: #f3f4f6 !important;
        }
        
        /* Tool palette and sidebar specific fixes */
        #designer-app .sidebar button,
        #designer-app .tool-palette button {
          background-color: #1f2937 !important;
          color: #f3f4f6 !important;
          border: 1px solid #374151 !important;
        }
        
        #designer-app .sidebar button:hover,
        #designer-app .tool-palette button:hover {
          background-color: #374151 !important;
        }
        
        /* Nuclear option - override ALL styling conflicts */
        * {
          --tw-bg-opacity: 1 !important;
        }
        
        /* Target specific problem elements */
        [style*="background-color: white"],
        [style*="background: white"],
        [style*="background-color: #fff"],
        [style*="background: #fff"],
        [style*="background-color: rgb(255, 255, 255)"],
        [style*="background: rgb(255, 255, 255)"] {
          background-color: #374151 !important;
          background: #374151 !important;
          color: #f3f4f6 !important;
        }
        
        /* Fix any remaining white backgrounds */
        .bg-white,
        [class*="bg-white"] {
          background-color: #374151 !important;
          color: #f3f4f6 !important;
        }
      `}</style>
      
      <div id="designer-app" style={{
        backgroundColor: '#111827',
        color: '#f3f4f6',
        minHeight: '100vh'
      }}>
        <style>{`
          /* Immediate CSS injection for button fixes */
          #designer-app * {
            background-color: inherit;
            color: inherit;
          }
          
          #designer-app button {
            background-color: #374151 !important;
            color: #f3f4f6 !important;
            border: 1px solid #4b5563 !important;
          }
          
          .bg-white {
            background-color: #374151 !important;
            color: #f3f4f6 !important;
          }
        `}</style>
        <AdvancedDesignerProfessional />
      </div>
    </div>
  );
}