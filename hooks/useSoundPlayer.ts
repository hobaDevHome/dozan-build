import { useState, useRef, useCallback, useEffect } from "react";
import { Audio } from "expo-av";
import { useSettings } from "@/context/SettingsContext";

// تعريف نوع الدالة التي ستُمرر لتحديد مسار الصوت
type SoundModuleResolver = (soundName: string) => any;

export const useSoundPlayer = (soundModuleResolver: SoundModuleResolver) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const timersRef = useRef<number[]>([]);

  // دالة لإضافة المؤقتات إلى القائمة للتنظيف لاحقاً
  const addTimer = useCallback((timer: number) => {
    timersRef.current.push(timer);
  }, []);

  // دالة تشغيل سلسلة من الأصوات (للـ Intervals)
  const playSoundSequence = useCallback(
    async (notes: string[]) => {
      setIsPlaying(true);
      for (const note of notes) {
        if (soundRef.current) {
          await soundRef.current.unloadAsync().catch(() => {});
        }
        try {
          const soundModule = soundModuleResolver(note);
          if (!soundModule) continue;

          const { sound: soundObject } = await Audio.Sound.createAsync(
            soundModule
          );
          soundRef.current = soundObject;
          await soundObject.playAsync();

          await new Promise<void>((resolve) => {
            const timer = setTimeout(() => {
              soundObject.unloadAsync().catch(() => {});
              resolve();
            }, 500); // مدة النوتة
            addTimer(timer);
          });
        } catch (error) {
          console.error("Error playing sound sequence:", error);
        }
      }
      setIsPlaying(false);
    },
    [soundModuleResolver, addTimer]
  );

  // دالة تشغيل صوت واحد (للمقامات)
  const playSingleSound = useCallback(
    async (soundName: string | null) => {
      if (!soundName) return;

      setIsPlaying(true);
      if (soundRef.current) {
        await soundRef.current.unloadAsync().catch(() => {});
      }

      try {
        const soundModule = soundModuleResolver(soundName);
        if (!soundModule) {
          setIsPlaying(false);
          return;
        }

        const { sound: soundObject } = await Audio.Sound.createAsync(
          soundModule
        );
        soundRef.current = soundObject;

        soundObject.setOnPlaybackStatusUpdate((status: any) => {
          if (status.isLoaded && status.didJustFinish) {
            soundObject.unloadAsync().catch(() => {});
            if (soundRef.current === soundObject) {
              soundRef.current = null;
            }
            setIsPlaying(false);
          }
        });

        await soundObject.playAsync();
      } catch (error) {
        console.error("Error playing single sound:", error);
        setIsPlaying(false);
      }
    },
    [soundModuleResolver]
  );

  // useEffect للتنظيف عند إغلاق المكون الذي يستخدم الـ Hook
  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync().catch(() => {});
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  return {
    isPlaying,
    playSoundSequence,
    playSingleSound,
    addTimer, // سنحتاجه للمؤقتات الخاصة بمنطق اللعبة
    soundRef, // لتنظيف الموارد عند الخروج من الشاشة
    timersRef, // نفس السبب
  };
};
