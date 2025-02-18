<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useInventoryTransferStore } from '@/stores/inventoryTransfer';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';
import { formatToHumanReadableDate } from '@/helpers';

import DefaultLayout from "@/layouts/DefaultLayout.vue";
import AngleLeftIcon from '@/components/icons/AngleLeftIcon.vue';
import ArrowLeftIcon from "@/components/icons/ArrowLeftIcon.vue";
import CloseIcon from "@/components/icons/CloseIcon.vue";
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import Spinner from "@/components/SpinnerComponent.vue";

const $inventoryTransferStore = useInventoryTransferStore();
const $userStore = useUserStore();
const $router = useRouter();

const showDialog = ref(false);
const showHistorial = ref(false);

const handleConfirm = () => {
  showDialog.value = true;
};

const closeDialog = () => {
  showDialog.value = false;
};

const confirmTransfer = async () => {
  showDialog.value = false;
  try {
    await $inventoryTransferStore.registerTransfer();
    $inventoryTransferStore.clearTransfers();
  } catch (error) {
    console.error(error);
  }
};

const barcodeInput = ref('');

const handleBarcodeInput = async () => {
  const product = await $inventoryTransferStore.getProductByBarcode(barcodeInput.value);
  if (product) {
    $inventoryTransferStore.addProductToTransfer(product);
    barcodeInput.value = '';
  }
};

const removeProduct = (id: number) => {
  $inventoryTransferStore.removeProductFromTransfer(id);
};

const clearSelectedOrigin = () => {
  $inventoryTransferStore.clearSelectedOrigin();
};

const clearSelectedDestination = () => {
  $inventoryTransferStore.clearSelectedDestination();
};

const loadUserSpecificData = () => {
  $inventoryTransferStore.loadTransfersFromStorage();
  $inventoryTransferStore.loadSelectedOriginFromStorage();
  $inventoryTransferStore.loadSelectedDestinationFromStorage();
};

onMounted(() => {
  $inventoryTransferStore.getAllWarehouses();
  loadUserSpecificData();
  $inventoryTransferStore.getTransferHistorail();
});

watch(() => $userStore.user, () => {
  loadUserSpecificData();
});

// Watch for changes to selectedOrigin and selectedDestination to update localStorage
watch(() => $inventoryTransferStore.selectedOrigin, () => {
  $inventoryTransferStore.saveSelectedOriginToStorage();
});

watch(() => $inventoryTransferStore.selectedDestination, () => {
  $inventoryTransferStore.saveSelectedDestinationToStorage();
});
</script>



<template>
  <DefaultLayout>
    <div class="flex justify-between p-5 ">
      <div class="flex items-center gap-4">
        <button class="bg-transparent border p-1.5 rounded-md cursor-pointer hover:bg-secondary-600 transition"
          @click="$router.back()">
          <ArrowLeftIcon class="size-6 text-black" />
        </button>
        <h1 class="text-3xl">Movimientos de inventario</h1>
      </div>

      <button @click="showHistorial = !showHistorial"
        class="text-primary-900 border border-primary-900 hover:text-primary-1000 hover:border-primary-1000 hover:bg-secondary-200 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
        {{
          showHistorial ? 'Ocultar historial' : 'Ver historial'
        }}
      </button>
    </div>

    <div v-if="showHistorial">
      <div class="mt-5 p-5 xl:p-10">
        <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table class="w-full text-sm text-left rtl:text-right text-gray-500">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3">Producto (Nombre)</th>
                <th scope="col" class="px-6 py-3">Código</th>
                <th scope="col" class="px-6 py-3">Se traslado de</th>
                <th scope="col" class="px-6 py-3">hacía</th>
                <th scope="col" class="px-6 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in $inventoryTransferStore.transferHistory" :key="product.id"
                class="bg-white border-b hover:bg-gray-50">
                <td scope="row" class="px-6 py-4">
                  {{ product.product }}
                </td>
                <td scope="row" class="px-6 py-4">
                  {{ product.productBarcode }}
                </td>
                <td scope="row" class="px-6 py-4">
                  {{ product.fromStorehouseId === 1
                    ? 'Fala'
                    : 'Bodega'
                  }}
                </td>
                <td class="px-6 py-4">{{ product.fromStorehouseId === 1
                  ? 'Fala'
                  : 'Bodega'
                  }}
                </td>
                <td class="px-6 py-4">
                  {{ formatToHumanReadableDate(product.createdAt) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>


    <template v-else>
      <div class="flex flex-col p-5 gap-y-5 xl:p-10 max-w-screen-sm">
        <div class="flex gap-x-5">
          <div>
            <h3 class="text-lg">De</h3>
            <p class="text-sm">Elige el <strong>Origen</strong> de los productos a mover</p>
            <select v-model="$inventoryTransferStore.selectedOrigin"
              class="border-2 rounded-md border-secondary-900 mt-2 p-2 w-full">
              <option v-for="warehouse in $inventoryTransferStore.availableOrigins" :key="warehouse.id"
                :value="warehouse">{{ warehouse.name }}</option>
            </select>
            <button v-if="$inventoryTransferStore.selectedOrigin" @click="clearSelectedOrigin"
              class="mt-2 text-sm text-red-500 hover:underline">
              Limpiar selección
            </button>
          </div>
          <div class="flex items-center">
            <AngleLeftIcon />
          </div>
          <div>
            <h3 class="text-lg">Para</h3>
            <p class="text-sm">Elige el <strong>Destino</strong> para el traslado de los productos</p>
            <select v-model="$inventoryTransferStore.selectedDestination"
              class="border-2 rounded-md border-secondary-900 mt-2 w-full p-2">
              <option v-for="warehouse in $inventoryTransferStore.availableDestinations" :key="warehouse.id"
                :value="warehouse">{{ warehouse.name }}</option>
            </select>
            <button v-if="$inventoryTransferStore.selectedDestination" @click="clearSelectedDestination"
              class="mt-2 text-sm text-red-500 hover:underline">
              Limpiar selección
            </button>
          </div>
        </div>
        <div class="mt-3">
          <input placeholder="Introduce el código de barras del producto a mover" type="text"
            class="border-2 rounded-md border-secondary-900 p-2 w-full" v-model="barcodeInput"
            :disabled="!$inventoryTransferStore.selectedOrigin || !$inventoryTransferStore.selectedDestination"
            :class="{ 'bg-gray-100 cursor-not-allowed': !$inventoryTransferStore.selectedOrigin || !$inventoryTransferStore.selectedDestination }"
            @keyup.enter="handleBarcodeInput">
          <p v-if="!$inventoryTransferStore.selectedOrigin || !$inventoryTransferStore.selectedDestination"
            class="text-xs  mt-1">
            Debes seleccionar el origen y el destino para poder introducir el código de barras.
          </p>
        </div>
      </div>
      <div class="mt-5 p-5 xl:p-10">
        <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table class="w-full text-sm text-left rtl:text-right text-gray-500">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3">Producto (Nombre)</th>
                <th scope="col" class="px-6 py-3">Cantidad a la mano (Stock Quantity)</th>
                <th scope="col" class="px-6 py-3">Check</th>
                <th scope="col" class="px-6 py-3">Quitar</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in $inventoryTransferStore.productsToTransfer" :key="product.name"
                class="bg-white border-b hover:bg-gray-50">
                <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{{ product.name }}</th>
                <td class="px-6 py-4">{{ product.stockQuantity }}</td>
                <td class="px-6 py-4">
                  <span
                    :class="{ 'text-green-500': product.storehouseId !== $inventoryTransferStore.selectedDestination?.id, 'text-red-500': product.storehouseId === $inventoryTransferStore.selectedDestination?.id }">
                    {{ product.storehouseId !== $inventoryTransferStore.selectedDestination?.id ? 'Válido' : 'Inválido'
                    }}
                  </span>
                </td>
                <td>
                  <CloseIcon @click="removeProduct(product.id)"
                    class=" cursor-pointer text-red-500 hover:text-red-700" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <button
          class="py-2 px-4 mt-5 rounded-md text-white flex justify-center items-center gap-2 md:min-w-52 hover:bg-primary-1000"
          :class="{ 'bg-primary-600 cursor-not-allowed': $inventoryTransferStore.emptyProducts, 'bg-primary-900 hover:bg-primary-1000': !$inventoryTransferStore.emptyProducts }"
          :disabled="$inventoryTransferStore.emptyProducts" @click="handleConfirm">
          Confirmar Traslado
        </button>
      </div>
    </template>
    <ConfirmDialog :visible="showDialog" :quantity="$inventoryTransferStore.productsToTransfer.length"
      @close="closeDialog" @confirm="confirmTransfer" />
    <Spinner :show="$inventoryTransferStore.isLoading" />
  </DefaultLayout>
</template>
