import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { HapticsService } from '../../core/services/HapticsService';

export const AmbientAudioPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('aurea_ambient_music');
      return saved === 'true';
    } catch (e) {
      return false;
    }
  });

  const clearFadeInterval = () => {
    if (fadeIntervalRef.current !== null) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
  };

  const fadeIn = (audio: HTMLAudioElement) => {
    clearFadeInterval();
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.warn('Autoplay o reproducción de audio bloqueada:', error);
        setIsPlaying(false);
        try {
          localStorage.setItem('aurea_ambient_music', 'false');
        } catch (e) {}
      });
    }

    const targetVolume = 0.35;
    const step = 0.02;
    const intervalTime = 50;

    fadeIntervalRef.current = setInterval(() => {
      if (!audio) {
        clearFadeInterval();
        return;
      }
      if (audio.volume + step < targetVolume) {
        audio.volume += step;
      } else {
        audio.volume = targetVolume;
        clearFadeInterval();
      }
    }, intervalTime);
  };

  const fadeOut = (audio: HTMLAudioElement) => {
    clearFadeInterval();
    const step = 0.03;
    const intervalTime = 50;

    fadeIntervalRef.current = setInterval(() => {
      if (!audio) {
        clearFadeInterval();
        return;
      }
      if (audio.volume - step > 0) {
        audio.volume -= step;
      } else {
        audio.volume = 0;
        audio.pause();
        clearFadeInterval();
      }
    }, intervalTime);
  };

  useEffect(() => {
    const audio = new Audio('/audio/meditacion-armonica.mp3');
    audio.loop = true;
    audio.volume = 0;
    audioRef.current = audio;

    if (isPlaying) {
      fadeIn(audio);
    }

    return () => {
      clearFadeInterval();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const togglePlay = () => {
    HapticsService.light();
    const audio = audioRef.current;
    if (!audio) return;

    const nextState = !isPlaying;
    setIsPlaying(nextState);
    try {
      localStorage.setItem('aurea_ambient_music', String(nextState));
    } catch (e) {
      console.error('Error al guardar estado de música en localStorage:', e);
    }

    if (nextState) {
      fadeIn(audio);
    } else {
      fadeOut(audio);
    }
  };

  return (
    <button
      onClick={togglePlay}
      type="button"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        zIndex: 1050,
        background: 'rgba(245, 239, 228, 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1.5px solid rgba(197, 168, 128, 0.5)',
        borderRadius: '30px',
        padding: '10px 18px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        color: '#0f0c0b',
        fontFamily: 'var(--font-sans)',
        fontSize: '0.85rem',
        fontWeight: 600,
        transition: 'all 0.3s ease',
        outline: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.04)';
        e.currentTarget.style.borderColor = 'rgba(197, 168, 128, 0.9)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.borderColor = 'rgba(197, 168, 128, 0.5)';
      }}
    >
      {isPlaying ? (
        <>
          <Volume2
            size={18}
            style={{
              color: '#c5a880',
              filter: 'drop-shadow(0 0 6px rgba(197, 168, 128, 0.8))',
              animation: 'pulseGlow 2s infinite ease-in-out',
            }}
          />
          <span>Música Ritual 🎵</span>
        </>
      ) : (
        <>
          <VolumeX size={18} style={{ color: '#8a7d6b' }} />
          <span style={{ color: '#554d42' }}>Música Mute 🔇</span>
        </>
      )}
      <style>{`
        @keyframes pulseGlow {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(197, 168, 128, 0.6)); }
          50% { filter: drop-shadow(0 0 10px rgba(197, 168, 128, 1)); }
        }
      `}</style>
    </button>
  );
};

export default AmbientAudioPlayer;
