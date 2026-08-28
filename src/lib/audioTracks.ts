export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  category: "jazz" | "classical" | "meditation" | "nature";
  categoryLabel: string;
  src: string;
  duration?: string;
  icon?: string;
}

export const FIN_AUDIO_TRACKS: AudioTrack[] = [
  {
    id: "fin-luxury-piano",
    title: "Chopin - Nocturne in E-flat major, Op. 9 No. 2",
    artist: "Wall Street Luxury Piano",
    category: "classical",
    categoryLabel: "럭셔리 클래식 🎹",
    src: "https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3?filename=chopin-nocturne-op-9-no-2-110829.mp3",
    duration: "4:32",
  },
  {
    id: "fin-chanson-cafe",
    title: "Breeze of Paris (Acoustic Chanson)",
    artist: "Paris Cafe Financial Lounge",
    category: "jazz",
    categoryLabel: "파리지앵 샹송 ☕",
    src: "https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3?filename=french-accordion-chanson-122941.mp3",
    duration: "3:10",
  },
  {
    id: "fin-bach-air",
    title: "Bach - Air on the G String",
    artist: "Chamber Strings",
    category: "classical",
    categoryLabel: "클래식 현악 🎻",
    src: "https://cdn.pixabay.com/download/audio/2022/03/24/audio_341bbec7bb.mp3?filename=bach-air-on-the-g-string-orchestral-suite-no-3-in-d-major-bwv-1068-105151.mp3",
    duration: "4:15",
  },
  {
    id: "fin-528hz-focus",
    title: "528Hz Deep Focus & Trading Calm",
    artist: "Solfeggio Frequency Project",
    category: "meditation",
    categoryLabel: "528Hz 집중 명상 🧘",
    src: "https://cdn.pixabay.com/download/audio/2022/11/06/audio_c97693998b.mp3?filename=528hz-healing-meditation-125867.mp3",
    duration: "5:00",
  },
  {
    id: "fin-ocean-tide",
    title: "Peaceful Pacific Ocean Waves",
    artist: "Calm Waves Bio-Acoustics",
    category: "nature",
    categoryLabel: "온화한 파도소리 🌊",
    src: "https://cdn.pixabay.com/download/audio/2021/09/06/audio_82315b9468.mp3?filename=ocean-waves-ambient-8247.mp3",
    duration: "5:30",
  },
  {
    id: "fin-soft-rain",
    title: "Healing Forest Rain & Gentle Stream",
    artist: "Nature Rain Sanctuary",
    category: "nature",
    categoryLabel: "치유의 빗소리 🌧️",
    src: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=soft-rain-ambient-111154.mp3",
    duration: "6:10",
  }
];
