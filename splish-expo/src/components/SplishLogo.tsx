import React, { memo } from 'react';
import Svg, { Path } from 'react-native-svg';

interface SplishLogoProps {
  size?: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
}

export const SplishLogo = memo(function SplishLogo({
  size = 50,
  stroke = '#80DDD9',
  strokeWidth = 2,
  fill = 'none',
}: SplishLogoProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="10 26 180 148"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
    >
      {/* Splish water drop logo path */}
      <Path d="M100 30 C60 80, 30 120, 100 170 C170 120, 140 80, 100 30 Z" />
      <Path d="M80 100 Q100 80, 120 100" />
      <Path d="M70 120 Q100 100, 130 120" />
    </Svg>
  );
});
