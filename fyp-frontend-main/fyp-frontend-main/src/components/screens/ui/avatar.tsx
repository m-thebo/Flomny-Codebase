import type React from "react"
import { cn } from "@/lib/utils"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Avatar({ className, ...props }: AvatarProps) {
  return <div className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)} {...props} />
}

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string
}

export function AvatarImage({ className, alt, src, ...props }: AvatarImageProps) {
  // Don't render the image if src is empty or undefined
  if (!src) return null

  return (
    <img
      className={cn("aspect-square h-full w-full", className)}
      src={src || "/placeholder.svg"}
      alt={alt}
      {...props}
    />
  )
}

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AvatarFallback({ className, ...props }: AvatarFallbackProps) {
  return (
    <div
      className={cn("flex h-full w-full items-center justify-center rounded-full bg-gray-200 text-gray-700", className)}
      {...props}
    />
  )
}

