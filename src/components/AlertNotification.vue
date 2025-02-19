<script setup lang="ts">
import { useNotificationStore } from "@/stores/notification";
import { computed } from "vue";
import type { Component } from "vue";

type NotificationType = "success" | "error" | "warning";

interface NotificationConfig {
  icon: Component;
  iconClass: string;
}

/**
 * ------------------------------------------
 *	Components
 * ------------------------------------------
 */
import CheckFilledIcon from "./icons/CheckFilledIcon.vue";
import CloseFilledIcon from "./icons/CloseFilledIcon.vue";

/**
 * ------------------------------------------
 *	Utils
 * ------------------------------------------
 */
const $notificationStore = useNotificationStore();

/**
 * ------------------------------------------
 *	Data
 * ------------------------------------------
 */

const currentNotificationType = computed<NotificationType | null>(
  () => $notificationStore.currentNotification?.type || null,
);

const currentNotificationConfig = computed(() =>
  currentNotificationType.value
    ? notificationConfigs[currentNotificationType.value]
    : null,
);

const notificationConfigs: Record<NotificationType, NotificationConfig> = {
  success: {
    icon: CheckFilledIcon,
    iconClass: "text-green-500 bg-green-100",
  },
  error: {
    icon: CloseFilledIcon,
    iconClass: "text-red-500 bg-red-100",
  },
  warning: {
    icon: CloseFilledIcon,
    iconClass: "text-yellow-500 bg-yellow-100",
  },
};
</script>

<template>
  <Transition name="fade">
    <div
      v-if="$notificationStore.isVisible"
      id="toast-top-right"
      class="fixed flex justify-between items-center w-full z-[999] max-w-xs p-4 space-x-4 text-gray-500 bg-white border border-secondary-200 rtl:divide-x-reverse divide-gray-200 rounded-lg shadow-sm top-5 right-5"
      role="alert"
    >
      <component
        :is="currentNotificationConfig?.icon"
        v-if="currentNotificationConfig"
        :class="['rounded-lg', currentNotificationConfig.iconClass]"
      />

      <div class="ms-3 flex-grow text-sm font-normal">
        {{ $notificationStore.currentNotification?.message }}
      </div>

      <button
        @click="$notificationStore.hideNotification()"
        type="button"
        class="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8"
        data-dismiss-target="#toast-success"
        aria-label="Close"
      >
        <span class="sr-only">Close</span>
        <svg
          class="w-3 h-3"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 14 14"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
          />
        </svg>
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
