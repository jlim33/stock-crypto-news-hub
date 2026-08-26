import { useState, useEffect, useCallback } from "react";

export function useSpeech() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentText, setCurrentText] = useState<string>("");
  const [supported, setSupported] = useState<boolean>(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setSupported(true);

      const updateVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  const getBestVoice = useCallback((isEnglish: boolean): SpeechSynthesisVoice | null => {
    if (voices.length === 0) return null;

    if (isEnglish) {
      const preferredUSVoices = [
        "Microsoft Jenny Online (Natural) - English (United States)",
        "Microsoft Guy Online (Natural) - English (United States)",
        "Microsoft Aria Online (Natural) - English (United States)",
        "Google US English",
        "Samantha",
        "Alex",
        "Microsoft Zira - English (United States)",
        "Microsoft David - English (United States)"
      ];

      for (const name of preferredUSVoices) {
        const found = voices.find(v => v.name.toLowerCase().includes(name.toLowerCase()));
        if (found) return found;
      }

      const usVoice = voices.find(v => v.lang === "en-US" || v.lang === "en_US");
      if (usVoice) return usVoice;

      const enVoice = voices.find(v => v.lang.startsWith("en"));
      if (enVoice) return enVoice;
    } else {
      const preferredKRVoices = [
        "Google 한국어",
        "Google 한국의",
        "Microsoft Heami - Korean (Korean)",
        "Microsoft SunHi Online (Natural) - Korean (Korea)",
        "Yuna"
      ];

      for (const name of preferredKRVoices) {
        const found = voices.find(v => v.name.toLowerCase().includes(name.toLowerCase()));
        if (found) return found;
      }

      const krVoice = voices.find(v => v.lang === "ko-KR" || v.lang === "ko_KR" || v.lang.startsWith("ko"));
      if (krVoice) return krVoice;
    }

    return null;
  }, [voices]);

  const speak = useCallback((text: string, lang?: "en" | "ko") => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const cleanText = text.replace(/[*_#`$]/g, " ").replace(/\s+/g, " ").trim();
    if (!cleanText) return;

    const isEnglish = lang === "en" || (!lang && !/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(cleanText));

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = isEnglish ? "en-US" : "ko-KR";
    utterance.rate = isEnglish ? 0.98 : 1.05;
    utterance.pitch = 1.0;

    const selectedVoice = getBestVoice(isEnglish);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setCurrentText(cleanText);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentText("");
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentText("");
    };

    window.speechSynthesis.speak(utterance);
  }, [getBestVoice]);

  const pause = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, []);

  const resume = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentText("");
    }
  }, []);

  return {
    supported,
    isPlaying,
    isPaused,
    currentText,
    speak,
    pause,
    resume,
    stop,
  };
}
