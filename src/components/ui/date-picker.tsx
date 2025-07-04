import * as React from "react"
import { cn } from "@/lib/utils"

export interface date-pickerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary'
}

const date-picker = React.forwardRef<HTMLDivElement, date-pickerProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border p-4",
          variant === 'default' && "bg-background",
          variant === 'secondary' && "bg-secondary",
          className
        )}
        {...props}
      />
    )
  }
)
date-picker.displayName = "date-picker"

export { date-picker }
