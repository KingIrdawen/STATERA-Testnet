'use client';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
}

export default function Section({ children, className = "", reducedHeight = false }: SectionProps & { reducedHeight?: boolean }) {
  const heightClass = reducedHeight ? "min-h-[60vh]" : "min-h-[100dvh]";
  return (
    <section className={`${heightClass} flex flex-col md:flex-row ${className}`}>
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
      <div className="px-8 sm:px-16 md:px-36 lg:px-48">
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
      <div className="px-8 sm:px-16 md:px-36 lg:px-48">
        <div className="max-w-lg">
          {children}
        </div>
      </div>
    </div>
  );
}
