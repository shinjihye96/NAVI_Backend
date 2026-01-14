export const EMOTION_DATA = {
  sun: {
    label: '화창해요',
    image: '/assets/emotions/sun.png',
  },
  sun_cloud: {
    label: '조금 맑아요',
    image: '/assets/emotions/sun_cloud.png',
  },
  cloud: {
    label: '흐려요',
    image: '/assets/emotions/cloud.png',
  },
  rain: {
    label: '비 내려요',
    image: '/assets/emotions/rain.png',
  },
  lightning: {
    label: '번개쳐요',
    image: '/assets/emotions/lightning.png',
  },
} as const;

export type EmotionKey = keyof typeof EMOTION_DATA;
