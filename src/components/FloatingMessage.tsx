import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

interface FloatingMessageProps {
  message: string;
  onDismiss: () => void;
  position: { top: number };
}

export default function FloatingMessage({
  message,
  onDismiss,
  position,
}: FloatingMessageProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onDismiss();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed left-20 bg-background text-foreground border border-border rounded-md p-4 shadow-lg transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{ top: position.top, zIndex: 1000 }}
      onClick={() => {
        setIsVisible(false);
        onDismiss();
      }}
    >
      <div className="flex gap-x-4 items-center justify-center">
        <p>{message}</p>
        <X className="w-4 h-4 cursor-pointer" />
      </div>
    </div>
  );
}
