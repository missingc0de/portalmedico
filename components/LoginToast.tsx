import React, { useEffect, useState, useRef } from 'react';

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
        width: 18,
        height: 18,
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
        width: 30,
        height: 16,
        borderRadius: '15px 15px 0 0',
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
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    // Short delay then slide in
    const t1 = setTimeout(() => setPhase('visible'), 50);
    // Start leaving after 4 seconds
    const t2 = setTimeout(() => setPhase('leaving'), 4000);
    // Unmount after 4.5 seconds
    const t3 = setTimeout(() => {
      if (onCloseRef.current) {
        onCloseRef.current();
      }
    }, 4500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const isVisible = phase === 'visible';

  return (
    <div
      style={{
        pointerEvents: 'all',
        transform: isVisible ? 'translateX(0) scale(1)' : 'translateX(110%) scale(0.95)',
        opacity: isVisible ? 1 : 0,
        transition: 'transform 0.38s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease',
      }}
      onClick={() => setPhase('leaving')}
    >
      {/*
       * Main standalone balloon card:
       *   Rounded corners on ALL 4 sides (separated, not flush to edge)
       *   Soft blue-white gradient & thin blue border
       */}
      <div
        style={{
          width: 320,
          minHeight: 64,
          background: 'linear-gradient(180deg, #f4f8fe 0%, #e1eefc 100%)',
          border: '1.5px solid #a0c0e4',
          borderRadius: '14px',
          boxShadow: '0 4px 16px rgba(15, 45, 95, 0.14)',
          display: 'flex',
          alignItems: 'center',
          padding: '10px 14px',
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
            height: 12,
            background: 'rgba(255, 255, 255, 0.45)',
            borderRadius: '14px 14px 0 0',
            pointerEvents: 'none',
          }}
        />

        {/* Avatar — double-border square box */}
        <div
          style={{
            width: 46,
            height: 46,
            flexShrink: 0,
            background: '#f8fafc',
            border: '1.5px solid #b2cce7',
            borderRadius: 6,
            padding: 3,
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              border: '1px solid #d0e1f2',
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
            fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
            color: '#0f3b8c',
            lineHeight: 1.35,
            minWidth: 0,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 800, whiteSpace: 'normal', wordBreak: 'break-word' }}>
            <span style={{ fontWeight: 900 }}>{userName.toUpperCase()}</span>
            <span style={{ fontWeight: 700 }}> acaba de</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 900 }}>
            iniciar sesión.
          </div>
        </div>
      </div>
    </div>
  );
};
