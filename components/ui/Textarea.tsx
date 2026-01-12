import React from "react"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={`
          flex min-h-[80px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm 
          placeholder:text-slate-500 
          focus:outline-none focus:border-sky-500 focus:bg-slate-50
          disabled:cursor-not-allowed disabled:opacity-50
          transition-colors duration-200
          ${className || ""}
        `}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }