import type { ButtonHTMLAttributes, ReactNode } from "react";

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function ActionButton({ children, className = "", ...props }: ActionButtonProps) {
  return (
    <button className={`action-button ${className}`} {...props}>
      {children}
    </button>
  );
}