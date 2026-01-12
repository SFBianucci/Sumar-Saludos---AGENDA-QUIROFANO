import React from "react"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={`
          flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm 
          file:border-0 file:bg-transparent file:text-sm file:font-medium 
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
Input.displayName = "Input"

export { Input }