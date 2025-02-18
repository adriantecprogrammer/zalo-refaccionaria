<template>
  <div
    v-if="visible"
    id="confirm-logout-modal"
    tabindex="-1"
    aria-hidden="true"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-y-auto"
  >
    <div class="relative p-4 w-full max-w-md max-h-full">
      <div class="relative bg-white rounded-lg shadow">
        <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
          <h3 class="text-xl font-semibold text-gray-900">
            Confirmación de Cierre de Sesión
          </h3>
          <button
            type="button"
            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-red-600 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
            @click="cancel"
          >
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
            <span class="sr-only">Close modal</span>
          </button>
        </div>
        <div class="p-4 md:p-5 space-y-4">
          <p class="text-base leading-relaxed text-gray-500">
            ¿Estás seguro de que deseas cerrar sesión?
          </p>
        </div>
        <div class="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b">
          <button
            @click="confirm"
            type="button"
            class="text-white bg-primary-900 hover:bg-primary-1000 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          >
            Cerrar Sesión
          </button>
          <button
            @click="cancel"
            type="button"
            class="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-red-600 focus:z-10 focus:ring-4 focus:ring-gray-100"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  visible: Boolean,
});

const emit = defineEmits(['close', 'confirm']);

const cancel = () => emit('close');
const confirm = () => emit('confirm');
</script>
