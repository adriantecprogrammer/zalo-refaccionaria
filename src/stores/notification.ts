import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

type NotificationType = 'success' | 'error' | 'warning';

interface Notification {
  message: string;
  type: NotificationType;
}

const STORE_NAME = 'notification';

export const useNotificationStore = defineStore(STORE_NAME, () => {
  const notification = ref<Notification | null>(null);
  const isVisible = ref<boolean>(false);
  let hideTimeoutId: ReturnType<typeof setTimeout> | null = null;
  let removeTimeoutId: ReturnType<typeof setTimeout> | null = null;

  const currentNotification = computed(() => notification.value);

  function clearTimeouts() {
    if (hideTimeoutId) {
      clearTimeout(hideTimeoutId);
      hideTimeoutId = null;
    }
    if (removeTimeoutId) {
      clearTimeout(removeTimeoutId);
      removeTimeoutId = null;
    }
  }

  function showNotification(message: string, type: NotificationType) {
    clearTimeouts();
    
    notification.value = { message, type };
    isVisible.value = true;

    hideTimeoutId = setTimeout(() => {
      hideNotification();
    }, 5000);
  }

  function hideNotification() {
    clearTimeouts();
    
    isVisible.value = false;
    removeTimeoutId = setTimeout(() => {
      notification.value = null;
    }, 300); // Ajusta este tiempo según la duración de tu animación de fade-out
  }

  return {
    // State
    notification,
    isVisible,

    // Getters
    currentNotification,

    // Actions
    showNotification,
    hideNotification,
  };
});