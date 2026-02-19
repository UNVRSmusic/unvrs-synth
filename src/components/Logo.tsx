import React from "react";

interface LogoProps {
  className?: string;
  height?: number;
  width?: number;
}

export const Logo: React.FC<LogoProps> = ({
  className = "",
  height = 60,
  width = 200,
}) => {
  return (
    <svg
      className={className}
      fill="none"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Waveform background */}
      <path
        d="M0 30 Q10 20, 20 30 T40 30 Q50 40, 60 30 T80 30 Q90 20, 100 30 T120 30 Q130 40, 140 30 T160 30 Q170 20, 180 30 T200 30"
        fill="none"
        opacity="0.3"
        stroke="url(#waveGradient)"
        strokeWidth="1.5"
      />

      {/* Main text */}
      <text
        fill="url(#textGradient)"
        fontFamily="'Courier New', monospace"
        fontSize="28"
        fontWeight="900"
        letterSpacing="2"
        x="10"
        y="38"
      >
        UNVRS
      </text>

      {/* Synth text */}
      <text
        fill="#667eea"
        fontFamily="'Courier New', monospace"
        fontSize="28"
        fontWeight="300"
        letterSpacing="1"
        x="120"
        y="38"
      >
        SYNTH
      </text>

      {/* Circuit-like decorations */}
      <circle cx="105" cy="30" r="2" fill="#667eea" opacity="0.6" />
      <circle cx="115" cy="30" r="2" fill="#764ba2" opacity="0.6" />
      <line
        opacity="0.4"
        stroke="#667eea"
        strokeWidth="1"
        x1="105"
        x2="115"
        y1="30"
        y2="30"
      />

      {/* Subtle dots */}
      <circle cx="8" cy="48" r="1.5" fill="#667eea" opacity="0.5" />
      <circle cx="192" cy="48" r="1.5" fill="#764ba2" opacity="0.5" />

      {/* Gradients */}
      <defs>
        <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="100%" stopColor="#764ba2" />
        </linearGradient>
        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#667eea" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#764ba2" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#667eea" stopOpacity="0.6" />
        </linearGradient>
      </defs>
    </svg>
  );
};
