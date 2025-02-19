<script setup lang="ts">
import { computed } from "vue";
import { toCurrency } from "@/helpers";
import { useCartStore } from "@/stores/cart";
import type { Product } from "@/types";

interface Props {
  product: Product;
}

interface Emits {
  (e: "add-to-cart", product: Product): void;
}

/**
 * ------------------------------------------
 *	Utils
 * ------------------------------------------
 */
const $props = defineProps<Props>();
const $cartStore = useCartStore();
defineEmits<Emits>();

/**
 * ------------------------------------------
 *	Data
 * ------------------------------------------
 */
const stockFormatted = computed(() => {
  return (stock: number) => {
    if (stock === 0) return "Sin stock";
    if (stock === 1) return stock + " pza.";
    return stock + " pzas.";
  };
});

const productQuantityInCart = computed<number>(() => {
  const itemInCart = $cartStore.cart.find(
    (item) => item.barcode === $props.product.barcode,
  );
  return itemInCart ? itemInCart.quantity : 0;
});

const isAddToCartDisabled = computed(() => {
  return $props.product.stockQuantity <= 0;
});

/**
 * ------------------------------------------
 *	Image Handling
 * ------------------------------------------
 */
const imageSrc = computed(() => {
  const image = $props.product.image;
  if (!image) {
    // Imagen por defento
    return "https://static.vecteezy.com/system/resources/previews/004/639/366/non_2x/error-404-not-found-text-design-vector.jpg";
  }
  return `data:image/jpeg;base64,${image}`;
});
</script>

<template>
  <div
    class="grid grid-cols-4 md:grid-cols-8 gap-4 justify-items-start items-center border-b-2 p-2"
  >
    <figure class="col-span-2 md:col-span-1">
      <img class="w-20" :src="imageSrc" alt="Product Image" />
    </figure>
    <p class="col-span-2 md:col-span-3">{{ product.name }}</p>
    <p class="md:justify-self-end">{{ product.barcode }}</p>

    <p class="md:justify-self-end">
      {{ stockFormatted(product.stockQuantity) }}
    </p>
    <p class="md:justify-self-end">{{ toCurrency(product.salePrice) }}</p>
    <div
      v-if="!isAddToCartDisabled"
      class="md:justify-self-end flex items-center gap-2"
    >
      <p>{{ productQuantityInCart }}</p>
      <button
        @click="$emit('add-to-cart', product)"
        class="bg-primary-500 py-2 px-4 m-2 rounded-lg border-2 border-transparent hover:bg-primary-600 hover:border-primary-700 transition"
      >
        +
      </button>
    </div>
  </div>
</template>
