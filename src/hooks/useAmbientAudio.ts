import { useState, useEffect, useRef, useCallback } from "react";
import { FIN_AUDIO_TRACKS, AudioTrack } from "@/lib/audioTracks";

const VOLUME_STORAGE_KEY = "finpulse_bgm_volume_v1";

export function useAmbientAudio() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack>(FIN_AUDIO_TRACKS[0]);
  const [volume, setVolumeState] = useState<number>(0.35);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackRef = useRef<AudioTrack>(currentTrack);
  const isShuffleRef = useRef<boolean>(isShuffle);
  const autoAdvanceRef = useRef<boolean>(autoAdvance);

  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  useEffect(() => {
    isShuffleRef.current = isShuffle;
  }, [isShuffle]);

  useEffect(() => {
    autoAdvanceRef.current = autoAdvance;
  }, [autoAdvance]);

  const playTrack = useCallback((track: AudioTrack) => {
    if (!audioRef.current) return;
    setCurrentTrack(track);
    currentTrackRef.current = track;
    setIsLoading(true);

    if (audioRef.current.src !== track.src) {
      audioRef.current.src = track.src;
    }

    audioRef.current
      .play()
      .then(() => {
        setIsPlaying(true);
        setIsLoading(false);
      })
      .catch((err) => {
        console.warn("Audio playback issue:", err);
        setIsLoading(false);
        setIsPlaying(false);
      });
  }, []);

  const selectNextTrack = useCallback(() => {
    if (isShuffleRef.current) {
      const randomIndex = Math.floor(Math.random() * FIN_AUDIO_TRACKS.length);
      playTrack(FIN_AUDIO_TRACKS[randomIndex]);
    } else {
      const currentIndex = FIN_AUDIO_TRACKS.findIndex((t) => t.id === currentTrackRef.current.id);
      const nextIndex = (currentIndex + 1) % FIN_AUDIO_TRACKS.length;
      playTrack(FIN_AUDIO_TRACKS[nextIndex]);
    }
  }, [playTrack]);

  const selectPrevTrack = useCallback(() => {
    const currentIndex = FIN_AUDIO_TRACKS.findIndex((t) => t.id === currentTrackRef.current.id);
    const prevIndex = (currentIndex - 1 + FIN_AUDIO_TRACKS.length) % FIN_AUDIO_TRACKS.length;
    playTrack(FIN_AUDIO_TRACKS[prevIndex]);
  }, [playTrack]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      let savedVol = 0.35;
      try {
        const raw = localStorage.getItem(VOLUME_STORAGE_KEY);
        if (raw) savedVol = parseFloat(raw);
      } catch {}
      setVolumeState(savedVol);

      const audio = new Audio();
      audio.loop = false;
      audio.volume = savedVol;
      audioRef.current = audio;

      audio.onwaiting = () => setIsLoading(true);
      audio.onplaying = () => {
        setIsLoading(false);
        setIsPlaying(true);
      };
      audio.onpause = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsLoading(false);
        if (autoAdvanceRef.current) {
          setTimeout(() => {
            selectNextTrack();
          }, 1500);
        }
      };

      audio.onended = () => {
        if (autoAdvanceRef.current) {
          selectNextTrack();
        }
      };

      return () => {
        audio.pause();
        audio.src = "";
      };
    }
  }, [selectNextTrack]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current.src || audioRef.current.src === "") {
        audioRef.current.src = currentTrack.src;
      }
      setIsLoading(true);
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch((err) => {
          console.warn("Play error:", err);
          setIsLoading(false);
          setIsPlaying(false);
        });
    }
  }, [isPlaying, currentTrack]);

  const setVolume = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    try {
      localStorage.setItem(VOLUME_STORAGE_KEY, clamped.toString());
    } catch {}
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : clamped;
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    if (isMuted) {
      setIsMuted(false);
      audioRef.current.volume = volume;
    } else {
      setIsMuted(true);
      audioRef.current.volume = 0;
    }
  }, [isMuted, volume]);

  const toggleShuffle = useCallback(() => {
    setIsShuffle((prev) => !prev);
  }, []);

  const toggleAutoAdvance = useCallback(() => {
    setAutoAdvance((prev) => !prev);
  }, []);

  return {
    isPlaying,
    isLoading,
    currentTrack,
    tracks: FIN_AUDIO_TRACKS,
    volume,
    isMuted,
    isShuffle,
    autoAdvance,
    playTrack,
    togglePlay,
    setVolume,
    toggleMute,
    selectNextTrack,
    selectPrevTrack,
    toggleShuffle,
    toggleAutoAdvance,
  };
}
