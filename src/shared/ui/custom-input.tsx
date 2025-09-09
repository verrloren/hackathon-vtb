import React from "react";
import { Input, cn } from "@/shared";
import { cva, type VariantProps } from "class-variance-authority";

const inputVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-300",
  {
    variants: {
      variant: {
        default:
          "w-full rounded-2xl font-poppins text-white font-normal text-lg placeholder:text-lg pl-4 py-6 border-none bg-black transition-colors duration-200 focus:outline-none placeholder:text-neutral-600 focus:bg-black focus:border-neutral-600",
        outline:
          "py-6 text-neutral-400 transition-colors bg-black rounded-2xl font-poppins font-light z-40 border border-neutral-800 hover:border-neutral-400 placeholder:text-neutral-400 focus:border-neutral-400",
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
    },
  }
);

export interface CustomInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {}

const CustomInput = React.forwardRef<HTMLInputElement, CustomInputProps>(
  (
    { className, disabled, placeholder, type, variant, size, ...props },
    ref
  ) => {
    return (
      <Input
        placeholder={placeholder}
        type={type}
        className={cn(inputVariants({ variant, size, className }))}
        disabled={disabled}
        ref={ref}
        {...props}
      />
    );
  }
);

CustomInput.displayName = "CustomInput";

export { CustomInput };
