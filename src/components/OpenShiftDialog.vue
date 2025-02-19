<script setup lang="ts">
import { ref } from "vue";
import { defineProps, defineEmits } from "vue";

defineProps({
  visible: Boolean,
});

const emit = defineEmits(["close", "confirm"]);

const cashAmount = ref<number | null>(null);

const closeModal = () => {
  emit("close");
};

const confirmCashAmount = () => {
  emit("confirm", cashAmount.value);
};
</script>

<template>
  <div
    v-if="visible"
    tabindex="-1"
    aria-hidden="true"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-y-auto"
  >
    <div class="relative p-4 w-full max-w-md max-h-full">
      <div class="relative bg-white rounded-lg shadow">
        <!-- Modal header -->
        <div class="flex items-center justify-between p-4 border-b rounded-t">
          <h3 class="text-lg font-semibold text-gray-900">
            Nuevo corte de caja
          </h3>
          <button
            type="button"
            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-red-600 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
            @click="closeModal"
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
        <!-- Modal body -->

        <div class="flex flex-row items-center p-4 space-x-4">
          <label
            for="cashAmount"
            class="text-nowrap block text-sm font-medium text-gray-700"
            >Efectivo: $</label
          >
          <input
            type="number"
            id="cashAmount"
            v-model="cashAmount"
            class="w-full border rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Efectivo en caja"
          />
        </div>
        <!-- Modal footer -->
        <div
          class="flex justify-center items-center p-4 border-t border-gray-200 rounded-b"
        >
          <button
            @click="confirmCashAmount"
            type="button"
            class="w-full text-white bg-primary-900 hover:bg-primary-3000 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          >
            Registrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
