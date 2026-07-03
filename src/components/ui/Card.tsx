import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
}

const Card = ({ children }: CardProps) => {
  return (
    <div className="w-full max-w-md rounded-2xl bg-slate-800 p-8 shadow-xl">
      {children}
    </div>
  );
};

export default Card;