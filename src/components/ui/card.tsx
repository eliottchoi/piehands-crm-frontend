import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const cardVariants = cva(
  "rounded-xl text-card-foreground transition-all duration-300 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default: [
          "glass-card hover-lift border border-card-border/50",
          "hover:border-card-border/70 hover:shadow-xl"
        ],
        elevated: [
          "bg-card shadow-lg border border-card-border/30",
          "hover:shadow-2xl hover:-translate-y-2"
        ],
        outline: [
          "border-2 border-border/60 bg-transparent",
          "hover:border-primary/50 hover:bg-card/20"
        ],
        gradient: [
          "bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-xl",
          "border border-card-border/30 shadow-xl",
          "hover:from-card/90 hover:to-card/70"
        ]
      },
      interactive: {
        true: "cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
        false: ""
      }
    },
    defaultVariants: {
      variant: "default",
      interactive: false
    },
  }
)

interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, interactive, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, interactive }), className)}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 p-6 pb-4", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-tight tracking-tight text-foreground group-hover:text-primary transition-colors duration-200",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground/80 leading-relaxed", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0 gap-2", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
