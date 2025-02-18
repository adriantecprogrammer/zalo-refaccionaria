<template>
  <div class="relative inline-block text-left">
    <div>
      <button @click="toggleDropdown" class="inline-flex justify-center items-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
        <AdjustmentsIcon />
        Filtros
      </button>
    </div>

    <div v-if="isOpen" class="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
      <div class="py-1">
        <label class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          <input type="radio" v-model="selectedFilter" value="recent" @change="handleFilterChange('recent')" class="mr-2 leading-tight">
          <span>Fecha: Más reciente</span>
        </label>
        <label class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          <input type="radio" v-model="selectedFilter" value="oldest" @change="handleFilterChange('oldest')" class="mr-2 leading-tight">
          <span>Fecha: Más vieja</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AdjustmentsIcon from "./icons/AdjustmentsIcon.vue";

const emits = defineEmits(['filter-change']);

const isOpen = ref<boolean>(false);
const selectedFilter = ref<string | null>(null);

const toggleDropdown = (): void => {
  isOpen.value = !isOpen.value;
};

const handleFilterChange = (filter: 'recent' | 'oldest'): void => {
  emits('filter-change', { filter, value: true });
};
</script>
