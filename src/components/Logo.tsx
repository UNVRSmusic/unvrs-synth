interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export const Logo: React.FC<LogoProps> = ({
  className = "",
  width,
  height,
}) => {
  // Aspect ratio is 280:60 = 14:3
  const aspectRatio = 280 / 60;

  // Calculate dimensions maintaining aspect ratio
  let finalWidth: number;
  let finalHeight: number;

  if (width && !height) {
    finalWidth = width;
    finalHeight = width / aspectRatio;
  } else if (height && !width) {
    finalHeight = height;
    finalWidth = height * aspectRatio;
  } else if (width && height) {
    // Both specified - use as is
    finalWidth = width;
    finalHeight = height;
  } else {
    // Default size
    finalWidth = 280;
    finalHeight = 60;
  }

  return (
    <svg
      className={className}
      fill="none"
      height={finalHeight}
      viewBox="0 0 280 60"
      width={finalWidth}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Waveform background */}
      <path
        d="M0 30 Q10 20, 20 30 T40 30 Q50 40, 60 30 T80 30 Q90 20, 100 30 T120 30 Q130 40, 140 30 T160 30 Q170 20, 180 30 T200 30 Q210 40, 220 30 T240 30 Q250 20, 260 30 T280 30"
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
        x="30"
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
        x="140"
        y="38"
      >
        SYNTH
      </text>

      {/* Circuit-like decorations */}
      <circle cx="125" cy="30" r="2" fill="#667eea" opacity="0.6" />
      <circle cx="135" cy="30" r="2" fill="#764ba2" opacity="0.6" />
      <line
        opacity="0.4"
        stroke="#667eea"
        strokeWidth="1"
        x1="125"
        x2="135"
        y1="30"
        y2="30"
      />

      {/* Subtle dots */}
      <circle cx="28" cy="48" r="1.5" fill="#667eea" opacity="0.5" />
      <circle cx="252" cy="48" r="1.5" fill="#764ba2" opacity="0.5" />

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
