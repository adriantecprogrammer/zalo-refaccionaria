<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import { ROUTE_NAME } from "@/router/names";
import { toCurrency } from "@/helpers";
import { useCartStore } from "@/stores/cart";
import { useShiftsStore } from "@/stores/shifts";
import { useRouter } from "vue-router";
import { usePromoCodesStore } from "@/stores/promoCodes";

/**
 * ------------------------------------------
 *  Components
 * ------------------------------------------
 */
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import ProductCart from "@/components/ProductCart.vue";
import ProductSearchAndCart from "@/components/ProductSearchAndCart.vue";
import SearchIcon from "@/components/icons/SearchIcon.vue";
import OpenShiftDialog from "@/components/OpenShiftDialog.vue";
import Spinner from "@/components/SpinnerComponent.vue";
import GreenCheckMark from "@/components/icons/GreenCheckMark.vue";
import ErrorIcon from "@/components/icons/ErrorIcon.vue";
import type { IPromoCodes } from "@/types";

/**
 * ------------------------------------------
 *  Utils
 * ------------------------------------------
 */
const $cartStore = useCartStore();
const $shiftsStore = useShiftsStore();
const $promoCodeStore = usePromoCodesStore();
const $router = useRouter();
const peticion = ref<boolean>(false);
const nothingToShow = ref<boolean>(false);
const errorPetition = ref<boolean>(false);
const showBotonPause = ref<boolean>(false);
const promoCodeDiscount = ref<number>(0);
const isValidPromoCode = ref<boolean>(true);
const applyPromoValidation = ref<boolean>(false);
const discountCodes = ref<IPromoCodes[] | null>([]);
const disableButton = ref<boolean>(false);
const showCuppon = ref<boolean>(false);

/**
 * ------------------------------------------
 *  Data
 * ------------------------------------------
 */
const showProductSearch = ref<boolean>(false);

const totalPrice = computed(() => {
  return $cartStore.cart.reduce((acc, item) => {
    const discountAmount = (item.salePrice * item.discount) / 100;
    return acc + (item.salePrice - discountAmount) * item.quantity;
  }, 0);
});

const showCalculatorModal = ref<boolean>($shiftsStore.showCalculetorModal);

/*
 *
 *
 *  LIFECYCLE
 *
 */

onMounted(() => {
  $shiftsStore.checkForOpenShift();

  if ($cartStore.cart.length === 0) {
    nothingToShow.value = false;
    showCuppon.value = false;
  } else {
    nothingToShow.value = true;
  }
  showPauseBoton();
  $promoCodeStore.getStorePromoCodes();
  discountCodes.value = $promoCodeStore.discountCodes;
});

watch(
  () => $shiftsStore.showCalculetorModal,
  (newVal) => {
    showCalculatorModal.value = newVal;
  },
);

watch(
  () => $cartStore.cart.length, // Observa el cambio en la longitud del carrito
  (newCartLength: number) => {
    showBotonPause.value = newCartLength > 0; // Actualiza el estado del botón
    showCuppon.value = true;
    if (newCartLength === 0) {
      showCuppon.value = false;
    }
  },
  { immediate: true }, // Ejecutar inmediatamente al montar
);

/*
 *
 * METHODS
 *
 */
const showPauseBoton = () => {
  if ($cartStore.cart.length > 0) {
    showBotonPause.value = true;
  }
};

const handleConfirm = async (cashAmount: number) => {
  try {
    await $shiftsStore.startNewShift(cashAmount);
    $shiftsStore.showCalculetorModal = false;
  } catch (error) {
    console.error("Error al confirmar el corte:", error);
  }
};

const handleClose = () => {
  $shiftsStore.showCalculetorModal = false;
};

const pauseSail = () => {
  //console.log($cartStore.storedCart)
  console.log($cartStore.cart);
  const cartJson = JSON.stringify($cartStore.cart);
  //console.log(cartJson)

  $cartStore
    .postSaleInProcess(cartJson)
    .then((response) => {
      if (response.success) {
        console.log("La petición fue exitosa:", response.data);
        peticion.value = true;

        $cartStore.clearCart();
        setTimeout(() => {
          peticion.value = false;
        }, 2000);
      } else {
        //peticion.value = false;
        errorPetition.value = true;
        setTimeout(() => {
          errorPetition.value = false;
        }, 2000);
        console.log("Hubo un problema con la petición.");
      }
    })
    .catch((error) => {
      console.error("Error en la petición:", error);
    });
};

const reSetDisableButton = () => {
  disableButton.value = false;
};
</script>

<template>
  <!--
    <AlertNotification />
  -->

  <DefaultLayout>
    <transition name="fade">
      <ProductSearchAndCart
        v-show="showProductSearch"
        @close="showProductSearch = false"
      />
    </transition>

    <div v-show="!showProductSearch" class="relative lg:h-screen lg:flex">
      <main class="lg:w-2/5 py-10 px-5 lg:h-screen bg-secondary-300 space-y-6">
        <section class="space-y-4">
          <h2 class="text-3xl font-black text-black">Buscar productos</h2>

          <label
            for="search"
            class="mb-2 text-sm font-medium text-gray-900 sr-only"
            >Search</label
          >

          <div class="relative">
            <div
              class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none"
            >
              <SearchIcon class="size-5" />
            </div>

            <input
              type="search"
              id="search"
              class="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 hover:bg-gray-100"
              placeholder="Buscar por nombre"
              required
              @click="showProductSearch = true"
            />
          </div>
        </section>
      </main>

      <aside
        class="lg:w-3/5 bg-white border border-l-2 px-5 py-10 flex flex-col lg:h-screen"
      >
        <div class="flex-col">
          <h2 class="text-3xl font-black text-black mb-8">Carrito</h2>
          <div class="flex-row">
            <button
              @click="pauseSail"
              v-if="showBotonPause"
              class="boton_detalle px-4 py-2 mt-1 mb-4 text-white bg-primary-1000 hover:bg-yellow-300 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm text-nowrap text-center"
            >
              <i class="fas fa-pause mr-2"></i>
              Pausar venta
            </button>
            <small v-if="peticion" class="scale-in-center ml-4 text-blue-600"
              >Venta pausada</small
            >
            <small
              v-if="errorPetition"
              class="scale-in-center ml-4 text-red-600 font-bold"
              >Ocurrio un error al pausar</small
            >
            <Toast />
          </div>
        </div>

        <section class="flex-grow lg:overflow-y-auto mb-10" v-auto-animate>
          <ProductCart
            v-for="product in $cartStore.cart"
            :key="product.barcode"
            :product="product"
          />
        </section>

        <div class="flex items-end mb-2">
          <div
            v-if="isValidPromoCode && applyPromoValidation"
            class="p-1 text-xs text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400"
            role="alert"
          >
            <span class="font-light"
              >Descuento aplicado {{ promoCodeDiscount }}%</span
            >
          </div>

          <div
            v-if="!isValidPromoCode && applyPromoValidation"
            class="p-1 text-xs text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-green-400"
            role="alert"
          >
            <span class="font-light">Cupon no Válido</span>
          </div>
        </div>
        <section class="mt-auto space-y-4">
          <div class="flex justify-between">
            <p class="text-2xl font-semibold">
              Total:
              <span class="text-primary-900">{{ toCurrency(totalPrice) }}</span>
            </p>
            <div v-if="showCuppon" class="flex mr-1">
              <transition name="fade">
                <ErrorIcon v-if="!isValidPromoCode && applyPromoValidation" />
              </transition>
              <transition name="fade">
                <GreenCheckMark
                  :discount="promoCodeDiscount"
                  v-if="isValidPromoCode && applyPromoValidation"
                />
              </transition>
            </div>
          </div>

          <button
            class="w-full uppercase px-4 py-2 text-center text-white rounded-lg"
            @click="
              $router.push({ name: ROUTE_NAME.PAYMENT_VIEW });
              reSetDisableButton();
            "
            :disabled="$cartStore.emptyCart"
            :class="{
              'bg-primary-600 cursor-not-allowed': $cartStore.emptyCart,
              'bg-primary-900 hover:bg-primary-3000': !$cartStore.emptyCart,
            }"
          >
            Ir a pagar
          </button>
        </section>
      </aside>
    </div>

    <OpenShiftDialog
      :visible="showCalculatorModal"
      @close="handleClose"
      @confirm="handleConfirm"
    />
    <Spinner :show="$shiftsStore.isLoading" />
  </DefaultLayout>
</template>

<style>
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-leave-from,
.fade-enter-to {
  opacity: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s;
}

button[disabled] {
  pointer-events: none;
}

.scale-in-center {
  -webkit-animation: scale-in-center 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)
    both;
  animation: scale-in-center 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

@-webkit-keyframes scale-in-center {
  0% {
    -webkit-transform: scale(0);
    transform: scale(0);
    opacity: 1;
  }

  100% {
    -webkit-transform: scale(1);
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes scale-in-center {
  0% {
    -webkit-transform: scale(0);
    transform: scale(0);
    opacity: 1;
  }

  100% {
    -webkit-transform: scale(1);
    transform: scale(1);
    opacity: 1;
  }
}
</style>
