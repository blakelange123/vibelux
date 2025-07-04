'use client';

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "btn-purple-gradient text-white",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-white/10 glass-dark hover:bg-white/10 text-white",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-white/5 hover:text-white text-gray-400",
        link: "text-purple-400 underline-offset-4 hover:underline hover:text-purple-300",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface AnimatedButtonProps
  extends HTMLMotionProps<"button">,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  success?: boolean;
  ripple?: boolean;
}

const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, variant, size, loading, success, ripple = true, children, ...props }, ref) => {
    const [ripples, setRipples] = React.useState<Array<{ x: number; y: number; id: number }>>([]);
    
    const handleRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!ripple || loading) return;
      
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const id = Date.now();
      
      setRipples(prev => [...prev, { x, y, id }]);
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== id));
      }, 600);
    };
    
    return (
      <motion.button
        className={cn(buttonVariants({ variant, size, className }), "relative overflow-hidden")}
        ref={ref}
        whileHover={!loading ? { scale: 1.02 } : undefined}
        whileTap={!loading ? { scale: 0.98 } : undefined}
        onClick={(e) => {
          handleRipple(e);
          props.onClick?.(e);
        }}
        animate={{
          opacity: loading ? 0.7 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 17
        }}
        {...props}
      >
        {/* Ripple Effect */}
        {ripples.map(({ x, y, id }) => (
          <motion.span
            key={id}
            className="absolute bg-white/20 rounded-full pointer-events-none"
            style={{
              left: x,
              top: y,
              width: 1,
              height: 1,
              x: "-50%",
              y: "-50%"
            }}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 100, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}
        
        {/* Loading State */}
        {loading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        )}
        
        {/* Success State */}
        {success && !loading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-green-500"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <motion.svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </motion.svg>
          </motion.div>
        )}
        
        {/* Button Content */}
        <motion.span
          animate={{
            opacity: loading || success ? 0 : 1,
            y: loading || success ? 10 : 0,
          }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.span>
      </motion.button>
    )
  }
)

AnimatedButton.displayName = "AnimatedButton"

// Icon Button with rotation animation
export const AnimatedIconButton = React.forwardRef<
  HTMLButtonElement,
  AnimatedButtonProps & { rotation?: number }
>(({ children, rotation = 180, ...props }, ref) => {
  const [isRotated, setIsRotated] = React.useState(false);
  
  return (
    <AnimatedButton
      ref={ref}
      size="icon"
      onClick={(e) => {
        setIsRotated(!isRotated);
        props.onClick?.(e);
      }}
      {...props}
    >
      <motion.div
        animate={{ rotate: isRotated ? rotation : 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatedButton>
  );
});

AnimatedIconButton.displayName = "AnimatedIconButton";

// Floating Action Button
export const FloatingActionButton = React.forwardRef<
  HTMLButtonElement,
  AnimatedButtonProps & { position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' }
>(({ className, position = 'bottom-right', ...props }, ref) => {
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };
  
  return (
    <motion.div
      className={cn("fixed z-50", positionClasses[position])}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
    >
      <AnimatedButton
        ref={ref}
        size="icon"
        className={cn("shadow-lg w-14 h-14", className)}
        whileHover={{ scale: 1.1 }}
        {...props}
      />
    </motion.div>
  );
});

FloatingActionButton.displayName = "FloatingActionButton";

export { AnimatedButton, buttonVariants }