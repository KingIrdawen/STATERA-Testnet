import React from 'react';

interface AxoneLayersIconProps {
  size?: number | string;
  strokeWidth?: number;
  color?: string;
  className?: string;
  title?: string;
}

export default function AxoneLayersIcon({
  size = 24,
  strokeWidth = 1.5,
  color = 'currentColor',
  className = '',
  title,
}: AxoneLayersIconProps) {
  // mêmes formes que dans ton code d'origine
  const pathTop    = 'M 12 12 L 21 7 L 12 2 L 3 7 Z';
  const pathMiddle = 'M 12 16 L 21 11 L 12 6 L 3 11 Z';
  const pathBottom = 'M 12 20 L 21 15 L 12 10 L 3 15 Z';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      role="img"
      focusable="false"
      aria-hidden={title ? undefined : true}
      shapeRendering="geometricPrecision"
    >
      {title ? <title>{title}</title> : null}

      <defs>
        {/* Le bas est visible partout SAUF sous le milieu et le haut */}
        <mask id="mask-bottom" maskUnits="userSpaceOnUse">
          <rect x="0" y="0" width="24" height="24" fill="white" />
          <path d={pathMiddle} fill="black" />
          <path d={pathTop} fill="black" />
        </mask>

        {/* Le milieu est visible partout SAUF sous le haut */}
        <mask id="mask-middle" maskUnits="userSpaceOnUse">
          <rect x="0" y="0" width="24" height="24" fill="white" />
          <path d={pathTop} fill="black" />
        </mask>
      </defs>

      {/* On dessine les trois couches, avec masques pour “couper” ce qui est recouvert */}
      <g stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke">
        {/* Bas (masqué par milieu + haut) */}
        <g mask="url(#mask-bottom)">
          <path d={pathBottom} />
        </g>

        {/* Milieu (masqué par haut) */}
        <g mask="url(#mask-middle)">
          <path d={pathMiddle} />
        </g>

        {/* Haut (entier) */}
        <path d={pathTop} />
      </g>
    </svg>
  );
}
