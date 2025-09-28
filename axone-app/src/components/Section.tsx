'use client';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
}

export default function Section({ children, className = "" }: SectionProps) {
  return (
    <section className={`min-h-screen flex ${className}`}>
      {children}
    </section>
  );
}

interface TextZoneProps {
  children: React.ReactNode;
  className?: string;
}

export function TextZone({ children, className = "", bgColor = "bg-[#011f26]", alignRight = false }: TextZoneProps & { bgColor?: string; alignRight?: boolean }) {
  const justifyClass = alignRight ? "justify-end" : "justify-start";
  return (
    <div className={`flex-1 ${bgColor} flex items-center ${justifyClass} ${className}`}>
      <div className="px-36 md:px-48">
        <div className="max-w-2xl">
          {children}
        </div>
      </div>
    </div>
  );
}

interface AnimationZoneProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export function AnimationZone({ children, className = "", fullWidth = false, bgColor = "bg-gray-50" }: AnimationZoneProps & { bgColor?: string }) {
  if (fullWidth) {
    return (
      <div className={`flex-1 ${bgColor} flex items-center justify-center ${className}`}>
        <div className="w-full h-full">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 ${bgColor} flex items-center justify-end ${className}`}>
      <div className="px-36 md:px-48">
        <div className="max-w-lg">
          {children}
        </div>
      </div>
    </div>
  );
}
