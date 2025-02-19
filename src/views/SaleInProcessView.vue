<script setup lang="ts">
import NothingToShow from "@/components/NothingToShow.vue";
import { useCartStore } from "@/stores/cart";
import { ref, onMounted } from "vue";
import type { SailInProcess, Product } from "@/types";
import ItemProductProcessDialog from "@/components/ItemProductProcessDialog.vue";
import CartIcon from "../components/icons/CartIcon.vue";
import router from "@/router";

const show = ref<boolean>();
const $cartStore = useCartStore();
const carts = ref<SailInProcess[]>([]);
const products = ref<Product[]>([]);
const showProducts = ref<boolean>(false);
const cart = ref<SailInProcess>();

async function getCarts() {
  try {
    carts.value = await $cartStore.getSaleInProcess();

    if (carts.value.length > 0) {
      show.value = false;
    } else {
      show.value = true;
      console.log("El arreglo está vacío.");
    }
  } catch (error) {
    console.error("Error al obtener los datos:", error);
  }
}

const goToHomeView = () => {
  router.push("/home");
};

const showItemProductProcessDialog = (id: number) => {
  showProducts.value = true;
  findCart(id);
};

const findCart = (id: number) => {
  cart.value = carts.value.find((cart) => cart.id === id);
};

const closeItemProductProcessDialog = () => {
  showProducts.value = false;
};

onMounted(() => {
  getCarts();
  console.log(products.value.length);
  //console.log(products.value)
});
//enviar $cartStore.storedCart al endpoint de la api de ventas en proceso
</script>

<template>
  <main class="lg:w-3/4 mx-auto p-10 space-y-10 m-6">
    <NothingToShow v-if="show" />
    <div v-else>
      <ItemProductProcessDialog
        :visible="showProducts"
        :cart="cart"
        @close="closeItemProductProcessDialog"
      >
      </ItemProductProcessDialog>
      <div class="flex justify-between mb-4">
        <h1 class="text-2xl font-bold">Ventas en Proceso</h1>
        <button
          class="bg-primary-900 py-2 px-4 rounded-md text-white flex justify-center items-center gap-2 md:min-w-52 hover:bg-primary-3000"
          @click="goToHomeView()"
        >
          Ver carrito
          <span class="flex items-center gap-0.5">
            <CartIcon class="size-5 text-white" />
            {{ $cartStore.totalQuantity }}
          </span>
        </button>
      </div>
      <table class="mt-4 w-full text-sm text-center text-gray-500">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3">ID venta</th>
            <th scope="col" class="px-6 py-3">Fecha</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="cart in carts"
            :key="cart.id"
            class="bg-white border-b hover:bg-gray-50"
          >
            <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
              Venta {{ cart.id }}
            </td>
            <td>{{ cart.createdAt }}</td>

            <button
              @click="showItemProductProcessDialog(cart.id)"
              class="boton_detalle ml-8 px-2 py-2 mt-2 mb-2 text-white bg-primary-900 hover:bg-primary-3000 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm text-nowrap text-center"
            >
              Ver Detalles
            </button>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>

<style scoped>
.botonReanudar {
  -webkit-box-shadow: -12px 10px 86px -5px rgba(0, 0, 0, 0.55);
  -moz-box-shadow: -12px 10px 86px -5px rgba(0, 0, 0, 0.55);
  box-shadow: -12px 10px 86px -5px rgba(0, 0, 0, 0.55);
}

.acordion {
  width: 50rem;
  align-items: center;
  justify-content: center;
}
</style>
