import React from 'react';

export const MobileLogo: React.FC<{ className?: string }> = ({ className = "h-8" }) => {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <svg 
        viewBox="0 0 190 96" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        aria-label="Sumar Salud Mobile Logo"
      >
        <path d="M165.184 46.4608L143.3 46.4608V24.2796C143.3 10.87 132.43 0.000401207 119.021 0.000401207C105.611 0.000401207 94.7416 10.87 94.7416 24.2796L94.7416 95.1611L165.221 95.0556C178.627 95.0358 189.483 84.1629 189.483 70.7565C189.483 57.3403 178.604 46.4608 165.184 46.4608Z" fill="url(#paint0_linear_mobile)"/>
        <path d="M23.6693 0.276516C10.5964 0.276516 -9.70382e-05 10.8731 -9.70382e-05 23.9459C-9.70382e-05 37.0187 10.5964 47.6152 23.6693 47.6152H47.403L47.403 70.68C47.403 83.4248 57.1987 94.3912 69.9275 94.9926C83.5213 95.6325 94.7417 84.8012 94.7417 71.3489L94.7417 0.141442L23.6693 0.276516Z" fill="url(#paint1_linear_mobile)"/>
        <defs>
          <linearGradient id="paint0_linear_mobile" x1="148.979" y1="48.2265" x2="95.0447" y2="96.1677" gradientUnits="userSpaceOnUse">
            <stop stopColor="#51C6EC"/>
            <stop offset="1" stopColor="#08C2FF"/>
          </linearGradient>
          <linearGradient id="paint1_linear_mobile" x1="37.7613" y1="65.2778" x2="68.9036" y2="28.3534" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00BDFB"/>
            <stop offset="1" stopColor="#0053C5"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};