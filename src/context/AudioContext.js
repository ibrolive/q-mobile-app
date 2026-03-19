import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { Audio } from 'expo-av';

const AudioContext = createContext(null);

export const AudioProvider = ({ children }) => {
  const soundRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAyahId, setCurrentAyahId] = useState(null);
  const [currentSurahId, setCurrentSurahId] = useState(null);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isLoopAyah, setIsLoopAyah] = useState(false);
  const [isLoopSurah, setIsLoopSurah] = useState(false);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);

  // Refs to always have latest values inside callbacks without stale closures
  const isLoopAyahRef = useRef(isLoopAyah);
  const isLoopSurahRef = useRef(isLoopSurah);
  const queueRef = useRef(queue);
  const queueIndexRef = useRef(queueIndex);
  const currentSurahIdRef = useRef(currentSurahId);
  const playbackSpeedRef = useRef(playbackSpeed);

  useEffect(() => { isLoopAyahRef.current = isLoopAyah; }, [isLoopAyah]);
  useEffect(() => { isLoopSurahRef.current = isLoopSurah; }, [isLoopSurah]);
  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { queueIndexRef.current = queueIndex; }, [queueIndex]);
  useEffect(() => { currentSurahIdRef.current = currentSurahId; }, [currentSurahId]);
  useEffect(() => { playbackSpeedRef.current = playbackSpeed; }, [playbackSpeed]);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    return () => {
      stopAndUnload();
    };
  }, []);

  const stopAndUnload = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (e) { /* ignore */ }
      soundRef.current = null;
    }
    setIsPlaying(false);
    setPosition(0);
    setDuration(0);
  };

  // Forward-declared ref so onPlaybackStatusUpdate can call loadAndPlayInternal
  const loadAndPlayRef = useRef(null);

  const onPlaybackStatusUpdate = useCallback((status) => {
    if (!status.isLoaded) return;
    setPosition(status.positionMillis || 0);
    setDuration(status.durationMillis || 0);
    setIsPlaying(status.isPlaying);

    if (status.didJustFinish) {
      if (isLoopAyahRef.current) {
        soundRef.current?.replayAsync();
      } else {
        // Play next ayah
        const q = queueRef.current;
        const idx = queueIndexRef.current;
        const nextIdx = idx + 1;

        if (nextIdx >= q.length) {
          if (isLoopSurahRef.current && q.length > 0) {
            loadAndPlayRef.current?.(q[0], currentSurahIdRef.current, q, 0);
          } else {
            setIsPlaying(false);
          }
        } else {
          loadAndPlayRef.current?.(q[nextIdx], currentSurahIdRef.current, q, nextIdx);
        }
      }
    }
  }, []); // stable - uses refs internally

  const loadAndPlay = useCallback(async (ayah, surahId, ayahQueue = [], startIndex = 0) => {
    if (!ayah?.audioUri) return;

    setIsLoading(true);
    await stopAndUnload();

    setCurrentAyahId(ayah.id);
    setCurrentSurahId(surahId);
    currentSurahIdRef.current = surahId;
    setQueue(ayahQueue);
    queueRef.current = ayahQueue;
    setQueueIndex(startIndex);
    queueIndexRef.current = startIndex;

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: ayah.audioUri },
        {
          shouldPlay: true,
          rate: playbackSpeedRef.current,
          pitchCorrectionQuality: Audio.PitchCorrectionQuality.High,
        },
        onPlaybackStatusUpdate
      );
      soundRef.current = sound;
      setIsPlaying(true);
    } catch (error) {
      console.error('Audio load error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onPlaybackStatusUpdate]);

  // Keep the ref up to date
  loadAndPlayRef.current = loadAndPlay;

  const togglePlayPause = useCallback(async () => {
    if (!soundRef.current) return;
    const status = await soundRef.current.getStatusAsync();
    if (status.isLoaded) {
      if (status.isPlaying) {
        await soundRef.current.pauseAsync();
      } else {
        await soundRef.current.playAsync();
      }
    }
  }, []);

  const stop = useCallback(async () => {
    await stopAndUnload();
    setCurrentAyahId(null);
    setCurrentSurahId(null);
  }, []);

  const handleNext = useCallback(async () => {
    const q = queueRef.current;
    const idx = queueIndexRef.current;
    if (q.length === 0) return;
    const nextIdx = idx + 1;
    if (nextIdx >= q.length) {
      if (isLoopSurahRef.current) {
        await loadAndPlay(q[0], currentSurahIdRef.current, q, 0);
      } else {
        await stop();
      }
      return;
    }
    await loadAndPlay(q[nextIdx], currentSurahIdRef.current, q, nextIdx);
  }, [loadAndPlay, stop]);

  const handlePrev = useCallback(async () => {
    const q = queueRef.current;
    const idx = queueIndexRef.current;
    if (q.length === 0 || idx <= 0) return;
    await loadAndPlay(q[idx - 1], currentSurahIdRef.current, q, idx - 1);
  }, [loadAndPlay]);

  const seek = useCallback(async (millis) => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(millis);
    }
  }, []);

  const changeSpeed = useCallback(async (speed) => {
    setPlaybackSpeed(speed);
    playbackSpeedRef.current = speed;
    if (soundRef.current) {
      try {
        await soundRef.current.setRateAsync(speed, true);
      } catch (e) { /* ignore if not loaded */ }
    }
  }, []);

  const toggleLoopAyah = useCallback(() => {
    setIsLoopAyah((v) => {
      isLoopAyahRef.current = !v;
      return !v;
    });
    setIsLoopSurah(false);
    isLoopSurahRef.current = false;
  }, []);

  const toggleLoopSurah = useCallback(() => {
    setIsLoopSurah((v) => {
      isLoopSurahRef.current = !v;
      return !v;
    });
    setIsLoopAyah(false);
    isLoopAyahRef.current = false;
  }, []);

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        isLoading,
        currentAyahId,
        currentSurahId,
        duration,
        position,
        playbackSpeed,
        isLoopAyah,
        isLoopSurah,
        queue,
        queueIndex,
        loadAndPlay,
        togglePlayPause,
        stop,
        handleNext,
        handlePrev,
        seek,
        changeSpeed,
        toggleLoopAyah,
        toggleLoopSurah,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error('useAudio must be used inside AudioProvider');
  return ctx;
};
