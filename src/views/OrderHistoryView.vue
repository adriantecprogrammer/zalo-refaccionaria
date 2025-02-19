<script setup lang="ts">
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import { ref, onMounted, watch } from "vue";
import { useOrderStore } from "@/stores/order";
import { useUserStore } from "@/stores/user";
import type { Order, User, OrderDetail } from "@/types";
import ArrowLeftIcon from "@/components/icons/ArrowLeftIcon.vue";
import OrderFilterDropdown from "@/components/OrderFilterDropdown.vue";
import DetailsSaleDialog from "@/components/DetailsSaleDialog.vue";

// Utils
const orders = ref<Order[]>([]);
const filteredOrders = ref<Order[]>([]);
const $orderStore = useOrderStore();
const $userStore = useUserStore();
const users = ref<User[]>([]);
const selectedCashier = ref<number | null>(null);
const sortFilters = ref<{ recent: boolean; oldest: boolean }>({
  recent: false,
  oldest: false,
});
const showDetailsSale = ref(false);
const selectedOrder = ref<Order | undefined>(undefined);
const orderProducts = ref<OrderDetail[]>([]);

/*
 *
 * LIFECYCLE
 *
 */
onMounted(async () => {
  const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
  if (storedUsers.length > 0) {
    $userStore.users = storedUsers;
    users.value = storedUsers;
  }
  orders.value = await $orderStore.getAllOrders();
  filteredOrders.value = orders.value;
});

watch(
  [sortFilters, selectedCashier],
  () => {
    applyFilters();
  },
  { deep: true },
);

const applyFilters = () => {
  let sortedOrders = [...orders.value];

  if (sortFilters.value.recent) {
    sortedOrders.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }

  if (sortFilters.value.oldest) {
    sortedOrders.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }

  if (selectedCashier.value !== null) {
    sortedOrders = sortedOrders.filter(
      (order) => order.userId === selectedCashier.value,
    );
  }

  filteredOrders.value = sortedOrders;
};

/*
 *
 *
 * METHODS
 *
 */

const getOrderDetail = async (id: number) => {
  orderProducts.value = await $orderStore.getOrderDetail(id);
  console.log(orderProducts.value);
};

const getUserNameById = (userId: number) => {
  const user = users.value.find((user) => user.id === userId);

  return user ? user.name : "Unknown";
};

const handleFilterChange = ({
  filter,
  value,
}: {
  filter: "recent" | "oldest";
  value: boolean;
}) => {
  if (filter === "recent") {
    sortFilters.value.recent = value;
    sortFilters.value.oldest = !value;
  } else if (filter === "oldest") {
    sortFilters.value.oldest = value;
    sortFilters.value.recent = !value;
  }
};

const showDetailsSaleModal = (order: Order) => {
  getOrderDetail(order.id);

  setTimeout(() => {
    showDetailsSale.value = true;
    selectedOrder.value = order;
  }, 200);
};
const closeDetailsSaleModal = () => {
  showDetailsSale.value = false;
};
</script>

<template>
  <DefaultLayout>
    <div>
      <main class="lg:w-3/4 mx-auto p-10 space-y-10">
        <DetailsSaleDialog
          :visible="showDetailsSale"
          :order="selectedOrder"
          :orderDetail="orderProducts"
          :cashier="selectedOrder ? getUserNameById(selectedOrder.userId) : ''"
          @close="closeDetailsSaleModal"
        />
        <section class="flex items-center gap-2">
          <button
            class="bg-transparent border p-1.5 rounded-md cursor-pointer hover:bg-secondary-600 transition"
            @click="$router.back()"
          >
            <ArrowLeftIcon class="size-6 text-black" />
          </button>
          <h1 class="text-3xl font-black text-black">Historial de ventas</h1>
        </section>

        <section>
          <div class="flex flex-row-reverse items-center gap-2">
            <OrderFilterDropdown @filter-change="handleFilterChange" />
            <select
              v-model="selectedCashier"
              class="border border-gray-300 rounded-lg p-2"
            >
              <option :value="null">Todos</option>
              <option v-for="user in users" :key="user.id" :value="user.id">
                {{ user.name }}
              </option>
            </select>
          </div>
          <div class="relative overflow-x-auto shadow-md sm:rounded-lg mt-5">
            <table class="w-full text-sm text-left text-gray-500">
              <thead class="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3">Cajero</th>
                  <th scope="col" class="px-6 py-3">Fecha</th>
                  <th scope="col" class="px-6 py-3">Pago</th>
                  <th scope="col" class="px-6 py-3">Descuento</th>
                  <th scope="col" class="px-6 py-3">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="order in filteredOrders"
                  :key="order.id"
                  class="bg-white border-b hover:bg-gray-50"
                >
                  <td
                    class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                  >
                    {{ getUserNameById(order.userId) }}
                  </td>
                  <td class="px-6 py-4">{{ order.date }}</td>
                  <td class="px-6 py-4">{{ order.paymentMethod }}</td>
                  <td class="px-6 py-4">{{ order.discount }}</td>
                  <td class="px-6 py-4">{{ order.total }}</td>
                  <button
                    @click="showDetailsSaleModal(order)"
                    class="boton_detalle px-2 py-2 mt-2 mb-2 text-white bg-primary-900 hover:bg-primary-3000 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm text-nowrap text-center"
                  >
                    Ver Detalles
                  </button>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  </DefaultLayout>
</template>
