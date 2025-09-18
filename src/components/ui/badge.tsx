import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: [
          "bg-primary/90 text-primary-foreground shadow-sm",
          "hover:bg-primary hover:shadow-md hover:scale-105",
          "ring-1 ring-primary/20"
        ],
        secondary: [
          "gradient-secondary text-secondary-foreground shadow-sm",
          "hover:shadow-md hover:scale-105",
          "ring-1 ring-secondary/20"
        ],
        accent: [
          "gradient-accent text-accent-foreground shadow-sm", 
          "hover:shadow-md hover:scale-105",
          "ring-1 ring-accent/20"
        ],
        success: [
          "bg-success/90 text-success-foreground shadow-sm",
          "hover:bg-success hover:shadow-md hover:scale-105",
          "ring-1 ring-success/20"
        ],
        warning: [
          "bg-warning/90 text-warning-foreground shadow-sm",
          "hover:bg-warning hover:shadow-md hover:scale-105", 
          "ring-1 ring-warning/20"
        ],
        destructive: [
          "bg-destructive/90 text-destructive-foreground shadow-sm",
          "hover:bg-destructive hover:shadow-md hover:scale-105",
          "ring-1 ring-destructive/20"
        ],
        outline: [
          "border border-border/60 bg-background/80 backdrop-blur-sm text-foreground",
          "hover:bg-muted/50 hover:border-border",
        ],
        ghost: [
          "bg-muted/40 text-muted-foreground",
          "hover:bg-muted/60 hover:text-foreground"
        ],
        // Status-specific variants
        active: [
          "bg-success/10 text-success border border-success/20",
          "hover:bg-success/20"
        ],
        inactive: [
          "bg-muted/60 text-muted-foreground border border-border/40",
          "hover:bg-muted/80"
        ],
        pending: [
          "bg-warning/10 text-warning border border-warning/20",
          "hover:bg-warning/20"
        ],
        error: [
          "bg-destructive/10 text-destructive border border-destructive/20",
          "hover:bg-destructive/20"
        ]
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-3 py-1 text-xs",
        lg: "px-4 py-1.5 text-sm"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

function Badge({ className, variant, size, dot = false, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <div className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
      )}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
