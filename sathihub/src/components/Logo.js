import React from 'react';

const Logo = ({ size = 'md', showText = true, onClick }) => {
  const sizes = {
    sm: { height: 32, textSize: 'text-base' },
    md: { height: 42, textSize: 'text-xl' },
    lg: { height: 56, textSize: 'text-2xl' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div
      className={`flex items-center gap-2 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {/* SVG Logo — tree with people, orange-blue gradient matching the uploaded logo */}
      <svg
        height={s.height}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="orangeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e84d1c" />
            <stop offset="100%" stopColor="#f5a623" />
          </linearGradient>
          <linearGradient id="blueGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1a3a5c" />
            <stop offset="100%" stopColor="#2e7bbf" />
          </linearGradient>
        </defs>

        {/* Outer circle border */}
        <circle cx="50" cy="50" r="47" fill="white" stroke="#1a3a5c" strokeWidth="2.5" />
        <circle cx="50" cy="50" r="43" fill="white" stroke="#e84d1c" strokeWidth="1.2" />

        {/* Tree trunk */}
        <path d="M47 75 Q48 60 50 50 Q52 60 53 75 Z" fill="#1a3a5c" />
        {/* Roots */}
        <path d="M47 75 Q42 78 38 80" stroke="#1a3a5c" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M53 75 Q58 78 62 80" stroke="#1a3a5c" strokeWidth="2" fill="none" strokeLinecap="round"/>

        {/* LEFT branch — orange side */}
        <path d="M50 50 Q38 42 28 35" stroke="url(#orangeGrad)" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M50 55 Q35 50 24 48" stroke="url(#orangeGrad)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M50 45 Q40 32 36 22" stroke="url(#orangeGrad)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>

        {/* RIGHT branch — blue side */}
        <path d="M50 50 Q62 42 72 35" stroke="url(#blueGrad)" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M50 55 Q65 50 76 48" stroke="url(#blueGrad)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M50 45 Q60 32 64 22" stroke="url(#blueGrad)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>

        {/* CENTER top branch */}
        <path d="M50 50 Q50 35 50 22" stroke="url(#orangeGrad)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>

        {/* Orange LEAVES (left side) */}
        <ellipse cx="27" cy="33" rx="5" ry="7" fill="url(#orangeGrad)" transform="rotate(-30 27 33)" />
        <ellipse cx="22" cy="46" rx="4" ry="6" fill="url(#orangeGrad)" transform="rotate(-10 22 46)" />
        <ellipse cx="35" cy="21" rx="4" ry="6" fill="url(#orangeGrad)" transform="rotate(-50 35 21)" />
        <ellipse cx="44" cy="16" rx="4" ry="5.5" fill="#f5a623" transform="rotate(-20 44 16)" />
        <ellipse cx="32" cy="38" rx="3.5" ry="5" fill="#e84d1c" transform="rotate(-40 32 38)" />

        {/* Blue LEAVES (right side) */}
        <ellipse cx="73" cy="33" rx="5" ry="7" fill="url(#blueGrad)" transform="rotate(30 73 33)" />
        <ellipse cx="78" cy="46" rx="4" ry="6" fill="url(#blueGrad)" transform="rotate(10 78 46)" />
        <ellipse cx="65" cy="21" rx="4" ry="6" fill="url(#blueGrad)" transform="rotate(50 65 21)" />
        <ellipse cx="56" cy="16" rx="4" ry="5.5" fill="#2e7bbf" transform="rotate(20 56 16)" />
        <ellipse cx="68" cy="38" rx="3.5" ry="5" fill="#1a3a5c" transform="rotate(40 68 38)" />

        {/* Center top leaf */}
        <ellipse cx="50" cy="15" rx="4" ry="6" fill="url(#blueGrad)" />

        {/* People on branches — orange side (small circles = heads) */}
        <circle cx="27" cy="30" r="2.5" fill="#e84d1c" />
        <circle cx="22" cy="43" r="2" fill="#f5a623" />
        <circle cx="35" cy="18" r="2" fill="#e84d1c" />

        {/* People on branches — blue side */}
        <circle cx="73" cy="30" r="2.5" fill="#2e7bbf" />
        <circle cx="78" cy="43" r="2" fill="#1a3a5c" />
        <circle cx="65" cy="18" r="2" fill="#2e7bbf" />
      </svg>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-bold ${s.textSize} tracking-tight`}>
            <span style={{ color: '#1a3a5c' }}>Sathi</span>
            <span style={{ color: '#e84d1c' }}>Hub</span>
            <span style={{ color: '#2e7bbf', fontSize: '0.6em' }}>.in</span>
          </span>
          {size !== 'sm' && (
            <span className="text-[9px] text-gray-400 font-normal tracking-wide mt-0.5">
              Your Community Partner
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
