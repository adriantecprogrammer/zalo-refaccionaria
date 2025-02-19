<script setup lang="ts">
import axios from "axios";
import type { Order, OrderDetail } from "@/types";

const props = defineProps({
  visible: Boolean,
  order: Object as () => Order,
  cashier: String,
  orderDetail: Object as () => OrderDetail[],
});

const emit = defineEmits(["close", "confirm"]);

const cancel = () => emit("close");

function getTokenFromCookie(): string | null {
  const name = "token=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(";");

  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i].trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }
  return null;
}
const token = getTokenFromCookie();

const imprimirTicket = async (id: number | undefined) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const urlEndpoint = `https://ths-back-hono.clvrt.workers.dev/orders/ticket/${id}`;

    const response = await axios.get(urlEndpoint, {
      headers,
      responseType: "blob",
    });

    const imageBlob = new Blob([response.data], { type: "application/pdf" });
    const imageUrl = URL.createObjectURL(imageBlob);

    window.open(imageUrl);

    setTimeout(() => {
      URL.revokeObjectURL(imageUrl);
    }, 10000);
  } catch (error) {
    console.error("Error fetching the image:", error);
  }
};
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
        class="relative p-4 w-full max-w-md max-h-full opacity-0 scale-in-center"
        :class="{ 'scale-100 opacity-100': visible }"
      >
        <!-- Modal content -->

        <div class="relative bg-white rounded-lg shadow">
          <!-- Modal header -->
          <div
            class="flex items-center justify-between p-4 md:p-5 border-b rounded-t"
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
              <span class="sr-only">Close modal</span>
            </button>
          </div>
          <!-- Modal body -->
          <div class="p-4 md:p-5 space-y-4">
            <p class="text-base leading-relaxed text-gray-600">
              Cajero: <span class="font-bold">{{ cashier }}</span>
            </p>
            <p class="text-base leading-relaxed text-gray-600">
              Fecha: <span class="font-bold">{{ order?.date }}</span>
            </p>
            <p class="text-base leading-relaxed text-gray-600">
              Método de Pago:
              <span class="font-bold"> {{ order?.paymentMethod }}</span>
            </p>
            <p class="text-2xl font-bold leading-relaxed text-gray-900">
              Productos
            </p>
            <div v-for="products in props.orderDetail" :key="products.id">
              <p class="text-base leading-relaxed text-gray-600 xl font-bold">
                - {{ products.productName }}
              </p>
              <div class="flex-row">
                <span>Cantidad: {{ products.quantity }}</span>
                <span class="ml-4">Precio: ${{ products.unitPrice }}</span>
              </div>
            </div>
            <p class="text-2xl font-bold leading-relaxed text-gray-900">
              Total: ${{ order?.total }}
            </p>
          </div>

          <div
            class="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b"
          >
            <button
              @click="imprimirTicket(order?.id)"
              type="button"
              class="text-white bg-primary-900 hover:bg-primary-1000 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
              Ver Ticket
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
  </div>
</template>

<style scoped>
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
