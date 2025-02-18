<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { toCurrency } from "@/helpers";
import { useCartStore } from "@/stores/cart";
import type { CartItem } from "@/types";
import type { IPromoCodes } from "@/types";
import { usePromoCodesStore } from "@/stores/promoCodes";

interface Props {
  product: CartItem,
}

/**
 * ------------------------------------------
 *  Components
 * ------------------------------------------
 */
import CloseIcon from "@/components/icons/CloseIcon.vue";
import InfoIcon from "./icons/InfoIcon.vue";
import ErrorIcon from "./icons/ErrorIcon.vue";
import GreenCheckMark from "./icons/GreenCheckMark.vue";

/**
 * ------------------------------------------
 *  Utils
 * ------------------------------------------
 */
const $props = defineProps<Props>();
const $cartStore = useCartStore();
const $promoCodeStore = usePromoCodesStore()
const promoCode = ref();
const promoCodeDiscount = ref<number>(0);
const isValidPromoCode = ref<boolean>(true);
const applyPromoValidation = ref<boolean>(false);
const discountCodes = ref<IPromoCodes[] | null>([])
const disableButton = ref<boolean>(false)
const showCuppon = ref<boolean>(true)

/**
 * ------------------------------------------
 *  Data
 * ------------------------------------------
 */
const discount = ref<number>($props.product.discount || 0);

const price = computed(() => {
  const discountAmount = ($props.product.salePrice * discount.value) / 100;
  return ($props.product.salePrice - discountAmount) * productQuantityInCart.value;
});

const productQuantityInCart = computed<number>(() => {
  const itemInCart = $cartStore.cart.find(
    (item) => item.barcode === $props.product.barcode
  );
  return itemInCart ? itemInCart.quantity : 0;
});

const stockFormatted = computed<string>(() => {
  return $props.product.stockQuantity === 1
    ? "Solo 1 disponible"
    : `Solo ${$props.product.stockQuantity} disponibles`;
});

/*
*
*LIFECYCLE
*
 */

onMounted(() => {
  $promoCodeStore.getStorePromoCodes()
  discountCodes.value = $promoCodeStore.discountCodes
})
/**
 * ------------------------------------------
 *  Image Handling
 * ------------------------------------------
 */
const imageSrc = computed(() => {
  const image = $props.product.image;
  if (!image) {
    return 'https://static.vecteezy.com/system/resources/previews/004/639/366/non_2x/error-404-not-found-text-design-vector.jpg';
  }
  return `data:image/jpeg;base64,${image}`;
});

/**
 * ------------------------------------------
 *  Discount Handling
 * ------------------------------------------
 */
const handleDiscountChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  discount.value = parseInt(target.value);
  $cartStore.updateDiscount($props.product.barcode, discount.value);
};

const applyPromoCode = () => {
  console.log(discountCodes.value)
  var index: number = 0
  if (discountCodes.value) {
    for (; index < discountCodes.value.length; index++) {
      const element = ref<IPromoCodes | null>(null)
      element.value = discountCodes.value[index];
      if (element.value) {
        if (element.value.code === promoCode.value && element.value.isActive === 1) {
          console.log("Codigo Valido")
          promoCodeDiscount.value = element.value.discount
          isValidPromoCode.value = true;
          applyPromoValidation.value = true
          disableButton.value = true
          break;
        } else if (element.value.code !== promoCode.value || element.value.isActive === 0) {
          applyPromoValidation.value = true
          console.log("codigo invalido")
          isValidPromoCode.value = false;

        }
      }
    }

    const product = $cartStore.cart.find(
      (item) => item.barcode === $props.product.barcode
    )
    if (product) {
      const newPrice = product.salePrice - ((product.salePrice * promoCodeDiscount.value) / 100)
      $cartStore.setDiscountPrice(product, newPrice)
      //product.salePrice = product.salePrice - ((product.salePrice * promoCodeDiscount.value) / 100)
    }
  }

  setTimeout(() => {
    applyPromoValidation.value = false
    promoCode.value = ''
  }, 5000);

}
</script>

<template>
  <div class="flex-row">
    <div
      class="grid grid-cols-5 sm:grid-cols-8 sm:grid-rows-1 justify-self-center justify-items-center items-center gap-4 border-b-2 p-2 min-">
      <figure class="col-span-2 sm:col-span-1">
        <img class="w-full" :src="imageSrc" alt="" />
      </figure>

      <div class="col-span-3 justify-self-start space-y-2">
        <p class="text-sm">{{ product.name }}</p>

        <p class="text-xs flex items-center gap-1 text-red-600 font-semibold">
          <InfoIcon class="size-5 inline-block" />
          <span>{{ stockFormatted }}</span>
        </p>

        <span class="inline-block text-xs font-medium me-2 px-2.5 py-0.5 rounded"
          :class="[product.storehouseId === 1 ? 'bg-primary-600 text-primary-900' : 'bg-secondary-600 text-secondary-900']">
          {{ product.storehouseId === 1 ? "Fala" : "Bodega 2" }}
        </span>
      </div>


      <div class="col-span-2 flex items-center gap-2 md:gap-1">
        <button @click="$cartStore.decreaseQuantity(product)"
          class="bg-primary-500 py-2 px-4 md:px-2 md:py-1 lg:py-2 lg:px-4 m-2 rounded-lg border-2 border-transparent hover:bg-primary-600 hover:border-primary-700 transition">
          -
        </button>
        <p>{{ productQuantityInCart }}</p>
        <button @click="$cartStore.increaseQuantity(product)"
          class="bg-primary-500 py-2 px-4 m-2 md:px-2 md:py-1 lg:py-2 lg:px-4 rounded-lg border-2 border-transparent hover:bg-primary-600 hover:border-primary-700 transition">
          +
        </button>

      </div>

      <div
        class="col-span-2 row-start-2 col-start-4 sm:row-start-1 sm:col-start-7 flex flex-wrap gap-4 md:gap-1 lg:gap-4 items-center">
        <select @change="handleDiscountChange" v-model="discount" class="p-2 border rounded lg:m-5">
          <option value="0">0%</option>
          <option value="5">5%</option>
          <option value="10">10%</option>
          <option value="15">15%</option>
          <option value="20">20%</option>
        </select>
        <p>{{ toCurrency(price) }}</p>
        <CloseIcon @click="$cartStore.deleteItem(product)" class="cursor-pointer text-red-500 hover:text-red-700" />
      </div>
    </div>
  </div>
  <div v-if="showCuppon" class="flex justify-end mr-1 mt-2 ">

    <transition name="fade">
      <ErrorIcon v-if="!isValidPromoCode && applyPromoValidation" />

    </transition>
    <transition name="fade">
      <GreenCheckMark  v-if="isValidPromoCode && applyPromoValidation" />
    </transition>

    <input type="text" id="promoCodeInput" class=" items-end block w-36 p-2 text-gray-900 border
border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500
dark:bg-gray-700 dark:border-yellow-200 dark:placeholder-gray-400 dark:text-white
dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Ingrese Cupón" v-model="promoCode">

    <button :disabled="disableButton" @click="applyPromoCode" type="button" class="focus:outline-none text-white bg-yellow-400 hover:bg-yellow-500 focus:ring-4
focus:ring-yellow-300 font-medium rounded-lg text-sm ml-1 px-2 py-1 me-2  dark:focus:ring-yellow-900">
      Aplicar
    </button>
  </div>



</template>
