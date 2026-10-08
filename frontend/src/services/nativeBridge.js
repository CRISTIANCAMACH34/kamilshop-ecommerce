/**
 * Puente Nativo de Capacitor para Web, Android y iOS (Swift)
 */
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App } from '@capacitor/app';

export const isNativePlatform = () => {
  return Capacitor.isNativePlatform();
};

export const getPlatform = () => {
  return Capacitor.getPlatform(); // 'web', 'android', 'ios'
};

export const initNativeFeatures = async () => {
  if (isNativePlatform()) {
    try {
      // Configurar Barra de Estado Nativa en Android e iOS
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#0A0A0A' });
    } catch (e) {
      console.warn("StatusBar setup warning", e);
    }

    try {
      // Botón atrás en Android
      App.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) {
          App.exitApp();
        } else {
          window.history.back();
        }
      });
    } catch (e) {
      console.warn("App listener warning", e);
    }
  }
};

export const triggerHapticFeedback = async () => {
  if (isNativePlatform()) {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
      // Silencioso si falla
    }
  } else if ('vibrate' in navigator) {
    try {
      navigator.vibrate(10);
    } catch (e) {}
  }
};
