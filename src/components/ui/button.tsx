import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 btn-animate relative overflow-hidden",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow hover:bg-primary-hover hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0",
        secondary: "gradient-secondary text-secondary-foreground shadow hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0",
        accent: "gradient-accent text-accent-foreground shadow hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0", 
        outline: "border border-input bg-background/80 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground hover:border-accent/50",
        ghost: "hover:bg-accent/10 hover:text-accent-foreground transition-colors duration-200",
        link: "text-primary underline-offset-4 hover:underline p-0 h-auto font-normal",
        destructive: "bg-destructive text-destructive-foreground shadow hover:bg-destructive-hover hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0",
        success: "bg-success text-success-foreground shadow hover:bg-success-hover hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0",
      },
      size: {
        sm: "h-8 rounded-md px-3 text-xs",
        md: "h-10 px-4 py-2",
        lg: "h-12 rounded-xl px-8 text-base font-semibold",
        icon: "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
