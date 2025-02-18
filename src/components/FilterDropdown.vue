<template>
  <div class="relative inline-block text-left">
    <div>
      <button @click="toggleDropdown" class="inline-flex justify-center items-center w-full rounded-md border border-gray-300 shadow-sm p-3.5 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
        <AdjustmentsIcon />
        Filtros
      </button>
    </div>

    <div v-if="isOpen" class="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
      <div class="py-1">
        <label class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          <input type="checkbox" v-model="filters.stock" @change="handleCheckboxChange('stock', filters.stock)" class="mr-2 leading-tight">
          <span>Stock</span>
        </label>
        <label class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          <input type="checkbox" v-model="filters.az" @change="handleCheckboxChange('az', filters.az)" class="mr-2 leading-tight">
          <span>A...Z</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

/**
 * ------------------------------------------
 *	Components
 * ------------------------------------------
 */
import AdjustmentsIcon from "./icons/AdjustmentsIcon.vue";

const emits = defineEmits(['filter-change']);

const isOpen = ref<boolean>(false);
const filters = ref<{ stock: boolean, az: boolean }>({
  stock: false,
  az: false,
});

const toggleDropdown = (): void => {
  isOpen.value = !isOpen.value;
};

const handleCheckboxChange = (filter: 'stock' | 'az', value: boolean): void => {
  emits('filter-change', { filter, value });
};
</script>
