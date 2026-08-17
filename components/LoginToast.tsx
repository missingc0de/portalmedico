import React, { useEffect, useState } from 'react';

/** Green MSN silhouette — matches reference photo */
const MsnGreenAvatar = () => (
  <div
    style={{
      width: '100%',
      height: '100%',
      background: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingBottom: 4,
      overflow: 'hidden',
    }}
  >
    {/* Head */}
    <div
      style={{
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: 'linear-gradient(to bottom, #5de89e, #26c26a)',
        marginBottom: 3,
        flexShrink: 0,
        boxShadow: 'inset 0 -2px 3px rgba(0,0,0,0.12)',
      }}
    />
    {/* Body */}
    <div
      style={{
        width: 34,
        height: 18,
        borderRadius: '17px 17px 0 0',
        background: 'linear-gradient(to bottom, #5de89e, #26c26a)',
        flexShrink: 0,
        boxShadow: 'inset 0 -2px 3px rgba(0,0,0,0.12)',
      }}
    />
  </div>
);

interface LoginToastProps {
  userName: string;
  avatarUrl?: string;
  onClose: () => void;
}

export const LoginToast: React.FC<LoginToastProps> = ({ userName, avatarUrl, onClose }) => {
  const [phase, setPhase] = useState<'entering' | 'visible' | 'leaving'>('entering');

  useEffect(() => {
    // Short delay then slide in
    const t1 = setTimeout(() => setPhase('visible'), 80);
    // Start leaving
    const t2 = setTimeout(() => setPhase('leaving'), 5600);
    // Unmount
    const t3 = setTimeout(() => onClose(), 6200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onClose]);

  const isVisible = phase === 'visible';

  return (
    // Portal-level wrapper: right-side bottom, ABOVE the chat bar (which is 48px = h-12 + 8px gap)
    <div
      style={{
        position: 'fixed',
        // 48px chat bar + 12px gap = 60px from bottom
        bottom: 64,
        right: 0,
        zIndex: 99999,
        pointerEvents: 'all',
        // Slide from right edge in
        transform: isVisible
          ? 'translateX(0) scale(1)'
          : 'translateX(110%) scale(1)',
        opacity: isVisible ? 1 : 0,
        transition: 'transform 0.42s cubic-bezier(0.22,1,0.36,1), opacity 0.35s ease',
      }}
      onClick={() => setPhase('leaving')}
    >
      {/*
       * Main balloon — replicates WinXP Live Messenger style:
       *   gradient: light steel-blue top → slightly deeper bottom
       *   border: soft blue-gray 1.5px
       *   very rounded left corners, flat right (flush to screen edge)
       */}
      <div
        style={{
          width: 330,
          minHeight: 68,
          background: 'linear-gradient(180deg, #dce9f6 0%, #c8d9ee 50%, #bdd0e9 100%)',
          border: '1.5px solid #8baac6',
          borderRight: 'none',
          borderRadius: '20px 0 0 20px',
          boxShadow: '-3px 4px 20px rgba(30,60,120,0.22)',
          display: 'flex',
          alignItems: 'center',
          padding: '10px 16px 10px 12px',
          gap: 12,
          cursor: 'pointer',
          userSelect: 'none',
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        {/* Top glass sheen */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 14,
            background: 'rgba(255,255,255,0.40)',
            borderRadius: '20px 0 0 0',
            pointerEvents: 'none',
          }}
        />

        {/* Avatar — double-border WinXP style */}
        <div
          style={{
            width: 50,
            height: 50,
            flexShrink: 0,
            background: 'linear-gradient(180deg, #f6faff 0%, #e8f2fb 100%)',
            border: '1.5px solid #9ab5d0',
            borderRadius: 7,
            padding: 3,
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              border: '1px solid #c0d4e8',
              borderRadius: 4,
              background: 'white',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box',
            }}
          >
            {avatarUrl
              ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <MsnGreenAvatar />
            }
          </div>
        </div>

        {/* Text */}
        <div
          style={{
            flex: 1,
            fontFamily: 'Tahoma, "Segoe UI", Arial, sans-serif',
            color: '#183776',
            lineHeight: 1.4,
            minWidth: 0,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 800, whiteSpace: 'normal', wordBreak: 'break-word' }}>
            {userName}
            <span style={{ fontWeight: 700 }}> acaba de</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>
            iniciar sesión.
          </div>
        </div>
      </div>
    </div>
  );
};
