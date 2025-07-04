import * as React from "react"
import { cn } from "@/lib/utils"

export interface DatePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary'
}

const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
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
DatePicker.displayName = "DatePicker"

export { DatePicker }
