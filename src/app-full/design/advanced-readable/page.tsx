'use client';

import { SimpleDesigner } from '@/components/designer/SimpleDesigner';

export default function AdvancedReadablePage() {
  return (
    <div className="min-h-screen bg-gray-900 dark:bg-gray-900">
      {/* Add custom CSS to make everything larger */}
      <style jsx global>{`
        /* Increase all text sizes */
        .text-xs { font-size: 0.875rem !important; }
        .text-sm { font-size: 1rem !important; }
        .text-base { font-size: 1.125rem !important; }
        .text-lg { font-size: 1.5rem !important; }
        
        /* Make buttons larger */
        button {
          min-height: 44px;
        }
        
        /* Make icons larger */
        svg {
          width: 24px !important;
          height: 24px !important;
          min-width: 24px;
          min-height: 24px;
        }
        
        /* Larger input fields */
        input, select, textarea {
          font-size: 1rem !important;
          padding: 0.75rem !important;
        }
      `}</style>
      <SimpleDesigner />
    </div>
  );
}