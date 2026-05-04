import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const buttonVariantStyles = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(230,57,70,0.3)] hover:shadow-[0_0_25px_rgba(230,57,70,0.5)]",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  outline: "border-2 border-border bg-transparent hover:border-primary hover:text-primary",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline",
}

const buttonSizeStyles = {
  default: "h-12 px-6 py-3",
  sm: "h-9 px-4 text-sm",
  lg: "h-14 px-8 text-lg font-bold",
  icon: "h-10 w-10",
}

export function buttonVariants(props?: { variant?: keyof typeof buttonVariantStyles; size?: keyof typeof buttonSizeStyles }) {
  return cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold uppercase tracking-wider transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
    buttonVariantStyles[props?.variant ?? "default"],
    buttonSizeStyles[props?.size ?? "default"]
  )
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
