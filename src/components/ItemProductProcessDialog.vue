<script setup lang="ts">
import type { CartItem, SailInProcess } from "@/types";
import ProductInProcess from "./ProductInProcess.vue";
import { ref, onMounted } from "vue";
import { useCartStore } from "@/stores";
import router from "@/router";

const emit = defineEmits(["close", "confirm"]);
const cancel = () => emit("close");

const $store = useCartStore();

const showError = ref<boolean>(false);

const props = defineProps({
  cart: Object as () => SailInProcess | undefined,
  visible: Boolean,
});

const goToHomeView = () => {
  router.push("/home");
};

const currentProducts = ref<CartItem[]>([]);

const getProducts = (cart: SailInProcess | undefined) => {
  if (cart) {
    currentProducts.value = JSON.parse(cart.cartInfo.string);
  } else {
    console.warn("Cart is undefined");
  }
  return currentProducts.value;
};
async function deleteSailInProcess(id: number | undefined) {
  $store.deleteSailInProcess(id);
}

const addProductCart = () => {
  if ($store.cart.length === 0) {
    try {
      currentProducts.value.forEach((product) => {
        $store.addToCartWithQuantity(product, product.quantity);
        console.log(product.quantity);
        deleteSailInProcess(props.cart?.id);

        setTimeout(() => {}, 500);
        goToHomeView();
      });
    } catch (error) {
      showError.value = true;
      setTimeout(() => {
        showError.value = false;
      }, 5000);
      console.log("ocurrio un error al agregar al carrito");
    }
  } else {
    showError.value = true;
    setTimeout(() => {
      showError.value = false;
    }, 5000);
  }
};

onMounted(() => {});
</script>
<template>
  <div
    v-if="visible"
    class="card"
    id="confirm-modal"
    tabindex="-1"
    aria-hidden="true"
  >
    <div
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      @click.self="cancel"
    >
      <div
        class="relative p-4 w-auto max-h-full opacity-0 scale-in-center"
        :class="{ 'scale-100 opacity-100': visible }"
      >
        <div
          v-if="showError"
          id="toast-warning"
          class="mb-4 flex items-center w-full max-w-xs p-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800"
          role="alert"
        >
          <div
            class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-orange-500 bg-orange-100 rounded-lg dark:bg-orange-700 dark:text-orange-200"
          >
            <svg
              class="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z"
              />
            </svg>
            <span class="sr-only">Warning icon</span>
          </div>
          <div class="ms-3 text-sm font-normal">
            No puede reanudar si el carrito esta lleno
          </div>
        </div>

        <!-- Modal content -->

        <div class="relative bg-white rounded-lg shadow">
          <!-- Modal header -->
          <div
            class="flex items-center justify-between p-4 md:p-5 border-b rounded-t mb-4"
          >
            <h3 class="text-3xl font-semibold text-gray-900">
              Detalle de Venta
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
              <span class="sr-only">Close modal </span>
            </button>
          </div>
          <div class="ml-4 max-h-64 overflow-y-auto">
            <div
              v-for="(product, index) in getProducts(props.cart)"
              :key="index"
            >
              <ProductInProcess :product="product"></ProductInProcess>
            </div>
          </div>

          <!-- Modal body -->
          <div class="p-4 md:p-5 space-y-4">
            <div
              class="flex items-center space-x-3 p-4 md:p-5 border-t border-gray-200 rounded-b"
            >
              <button
                type="button"
                @click="addProductCart"
                class="text-white bg-primary-900 hover:bg-primary-3000 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center"
              >
                <!-- Icono Play SVG -->
                <svg
                  aria-hidden="true"
                  class="w-5 h-5 mr-2 mt-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M14.752 11.168l-6.518-3.72A1 1 0 007 8.338v7.324a1 1 0 001.234.962l6.518-3.72a1 1 0 000-1.732z"
                  ></path>
                </svg>
                Reanudar Venta
              </button>

              <button
                @click="cancel"
                type="button"
                class="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-red-600 focus:z-10 focus:ring-4 focus:ring-gray-100"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
