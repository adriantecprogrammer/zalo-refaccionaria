<script setup lang="ts">
import { computed, ref, onMounted, watch } from "vue";
import { useProductStore } from "@/stores/product";
import { useCartStore } from "@/stores";
import type { Product } from "@/types";

interface Emits {
  (e: "close"): void;
}

/**
 * ------------------------------------------
 *  Components
 * ------------------------------------------
 */
import CartIcon from "./icons/CartIcon.vue";
import ProductItem from "./ProductItem.vue";
import SearchIcon from "./icons/SearchIcon.vue";
import FilterDropdown from "./FilterDropdown.vue";
import Spinner from "@/components/SpinnerComponent.vue";

/**
 * ------------------------------------------
 *  Utils
 * ------------------------------------------
 */
const $cartStore = useCartStore();
const $productStore = useProductStore();
const emit = defineEmits<Emits>();

/**
 * ------------------------------------------
 *  Data
 * ------------------------------------------
 */
const search = ref<string>("");
const sortFilters = ref<{ stock: boolean; az: boolean }>({ stock: false, az: false });

watch(search, (newSearch) => {
  $productStore.searchQuery = newSearch;
});

onMounted(() => {
  $productStore.getAllProducts();
});

const filterProducts = computed(() => {
  let products: Product[] = [...$productStore.filterProducts];

  if (sortFilters.value.stock) {
    products.sort((a, b) => b.stockQuantity - a.stockQuantity);
  }

  if (sortFilters.value.az) {
    products.sort((a, b) => a.name.localeCompare(b.name));
  }

  return products;
});

const handleKeyDown = async (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    const found = await $productStore.searchProductByBarcode(search.value);
    search.value = '';
    if (found) {
      emit('close');
    }
  } else if (event.key === 'Tab') {
    event.preventDefault();
    await $productStore.searchProductsByName(search.value);
    search.value = '';
  }
};

const handleFilterChange = ({ filter, value }: { filter: 'stock' | 'az'; value: boolean }) => {
  sortFilters.value[filter] = value;
};
</script>

<template>
  <div class="min-h-screen bg-secondary-200 z-10 p-10 space-y-4">    
    <section class="flex items-center justify-between gap-2">
      <h2 class="text-3xl font-black text-black">Productos</h2>

      <button
        class="bg-primary-900 py-2 px-4 rounded-md text-white flex justify-center items-center gap-2 md:min-w-52 hover:bg-primary-1000"
        @click="$emit('close')"
      >
        Ver carrito
        <span class="flex items-center gap-0.5">
          <CartIcon class="size-5 text-white" />
          {{ $cartStore.totalQuantity }}
        </span>
      </button>
    </section>

    <section class="space-y-2">
      <div class="flex items-center gap-2">
        <div class="relative flex-1">
          <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <SearchIcon class="size-5" />
          </div>
          <input
            class="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 focus:border-transparent"
            id="search"
            placeholder="Buscar producto"
            type="search"
            v-model="search"
            @keydown="handleKeyDown"
          />
        </div>
        <FilterDropdown @filter-change="handleFilterChange" />
      </div>
      
      <div v-if="!$productStore.isLoading">
        <ProductItem
          v-for="(product, index) in filterProducts"
          :key="`id-${product.barcode}-index-${index}`"
          :product="product"
          @add-to-cart="$cartStore.addToCart"
        />
      </div>
      <Spinner :show="$productStore.isLoading" />
    </section>
  </div>
</template>