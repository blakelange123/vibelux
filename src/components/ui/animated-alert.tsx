'use client';

import * as React from "react"
import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from "lucide-react"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive bg-red-950/20",
        success:
          "border-green-500/50 text-green-500 dark:border-green-500 [&>svg]:text-green-500 bg-green-950/20",
        warning:
          "border-yellow-500/50 text-yellow-500 dark:border-yellow-500 [&>svg]:text-yellow-500 bg-yellow-950/20",
        info:
          "border-blue-500/50 text-blue-500 dark:border-blue-500 [&>svg]:text-blue-500 bg-blue-950/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const iconMap = {
  default: AlertCircle,
  destructive: AlertTriangle,
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info,
}

interface AnimatedAlertProps
  extends HTMLMotionProps<"div">,
    VariantProps<typeof alertVariants> {
  onClose?: () => void;
  autoClose?: number; // milliseconds
  showIcon?: boolean;
  position?: 'top' | 'bottom' | 'center';
}

const positionVariants = {
  top: {
    initial: { opacity: 0, y: -50, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -50, scale: 0.95 }
  },
  bottom: {
    initial: { opacity: 0, y: 50, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 50, scale: 0.95 }
  },
  center: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 }
  }
};

const AnimatedAlert = React.forwardRef<
  HTMLDivElement,
  AnimatedAlertProps
>(({ 
  className, 
  variant = "default", 
  children, 
  onClose, 
  autoClose, 
  showIcon = true,
  position = 'top',
  ...props 
}, ref) => {
  const Icon = iconMap[variant || 'default'];
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, autoClose);

      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={ref}
          role="alert"
          className={cn(alertVariants({ variant }), className)}
          variants={positionVariants[position]}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
          {...props}
        >
          <div className="flex items-start gap-3">
            {showIcon && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <Icon className="h-5 w-5" />
              </motion.div>
            )}
            <div className="flex-1">{children}</div>
            {onClose && (
              <motion.button
                onClick={handleClose}
                className="inline-flex items-center justify-center rounded-md p-1 hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </motion.button>
            )}
          </div>
          
          {/* Progress bar for auto-close */}
          {autoClose && (
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-current opacity-30"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: autoClose / 1000, ease: "linear" }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
});

AnimatedAlert.displayName = "AnimatedAlert"

const AnimatedAlertTitle = React.forwardRef<
  HTMLHeadingElement,
  HTMLMotionProps<"h5">
>(({ className, children, ...props }, ref) => (
  <motion.h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.1 }}
    {...props}
  >
    {children}
  </motion.h5>
))
AnimatedAlertTitle.displayName = "AnimatedAlertTitle"

const AnimatedAlertDescription = React.forwardRef<
  HTMLParagraphElement,
  HTMLMotionProps<"div">
>(({ className, children, ...props }, ref) => (
  <motion.div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.2 }}
    {...props}
  >
    {children}
  </motion.div>
))
AnimatedAlertDescription.displayName = "AnimatedAlertDescription"

// Toast-style alert container
const ToastContainer = ({ children, position = 'top-right' }: { 
  children: React.ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}) => {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  return (
    <div className={cn("fixed z-50 flex flex-col gap-2", positionClasses[position])}>
      {children}
    </div>
  );
};

export { 
  AnimatedAlert, 
  AnimatedAlertTitle, 
  AnimatedAlertDescription, 
  ToastContainer,
  alertVariants 
}