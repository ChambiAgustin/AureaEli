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

  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExpanded(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

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
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      type="button"
      title={isPlaying ? 'Música Ritual 🎵' : 'Música Mute 🔇'}
      style={{
        position: 'absolute',
        left: '40px',
        width: isExpanded ? '150px' : '40px',
        height: '40px',
        borderRadius: isExpanded ? '20px' : '50%',
        padding: isExpanded ? '0 14px' : '0',
        border: '1px solid rgba(176, 142, 98, 0.15)',
        background: 'rgba(197, 168, 128, 0.05)',
        boxShadow: '0 4px 12px rgba(44, 36, 32, 0.03)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: isPlaying ? 'var(--color-dorado-mate, #c5a880)' : 'var(--color-text-dark, #2c2420)',
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        outline: 'none',
        overflow: 'hidden',
        zIndex: 10,
      }}
    >
      {isPlaying ? (
        <Volume2
          size={20}
          style={{
            color: '#c5a880',
            filter: 'drop-shadow(0 0 6px rgba(197, 168, 128, 0.8))',
            animation: 'pulseGlow 2s infinite ease-in-out',
            flexShrink: 0,
          }}
        />
      ) : (
        <VolumeX size={20} style={{ color: '#8a7d6b', flexShrink: 0 }} />
      )}

      <span
        style={{
          whiteSpace: 'nowrap',
          opacity: isExpanded ? 1 : 0,
          maxWidth: isExpanded ? '100px' : '0px',
          overflow: 'hidden',
          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          marginLeft: isExpanded ? '8px' : '0px',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: isPlaying ? 'var(--color-dorado-mate, #c5a880)' : '#8a7d6b',
        }}
      >
        {isPlaying ? 'Música Ritual 🎵' : 'Música Mute 🔇'}
      </span>

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

