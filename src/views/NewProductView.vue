<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import ArrowLeftIcon from "@/components/icons/ArrowLeftIcon.vue";
import Spinner from "@/components/SpinnerComponent.vue";
import { useNewProductStore } from '../stores/addProduct';
import { useInventoryTransferStore } from '@/stores/inventoryTransfer';
import { useNotificationStore } from '@/stores/notification';

const $newProductStore = useNewProductStore();
const $inventoryTransferStore = useInventoryTransferStore();
const $notificationStore = useNotificationStore();

const name = ref('');
const salePrice = ref(0);
const stockQuantity = ref(1);
const barcode = ref('');
const brand = ref('');
const internalReference = "";
const storehouseId = ref<number | null>(null);


const categories = ref([
  { name: 'Autos', id: 25266566 },
  { name: 'Universo DC', id: 25266905 },
  { name: 'Marvel', id: 25266911 },
  { name: 'Anime', id: 25266926 },
  { name: 'Videojuegos', id: 25266954 },
  { name: 'Star wars', id: 25266967 },
  { name: 'Terror', id: 25266977 },
  { name: 'Lego', id: 25266981 },
  { name: 'Funko', id: 25266997 },
  { name: 'Spawn', id: 25267008 },
  { name: 'Tortugas ninja', id: 25267023 },
  { name: 'Thundercats', id: 25267051 },
  { name: 'Ghostbusters', id: 25267052 },
  { name: 'Cómics y cartas', id: 25267053 },
  { name: 'Alien vs Predator', id: 25267054 },
  { name: 'Disney', id: 25267055 },
  { name: 'Masters of the Universe', id: 25267056 },
  { name: 'Otros', id: 25267057 },
].sort((a, b) => a.name.localeCompare(b.name)));

onMounted(() => {
  $inventoryTransferStore.getAllWarehouses();
});


const searchQuery = ref('');
const selectedCategories = ref<number[]>([]);

const loading = computed(() => $newProductStore.loading);

const filteredCategories = computed(() => {
  return categories.value.filter(category => 
    category.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const selectedFile = ref<File | null>(null);
const base64Image = ref<string | null>(null);

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;

  if (files && files.length > 0) {
    const file = files[0];
    const allowedTypes = ['image/jpeg', 'image/png'];

    if (!allowedTypes.includes(file.type)) {
      $notificationStore.showNotification('Solo se permiten archivos JPEG y PNG','error');
      target.value = ''; 
      return;
    }

    selectedFile.value = file;
    convertFileToBase64(selectedFile.value);
  }
};

const convertFileToBase64 = (file: File) => {
  base64Image.value = null;
  const reader = new FileReader();
  reader.onload = (e) => {
    let base64 = (e.target?.result as string) || '';
    base64 = base64.replace(/^data:image\/(jpeg|png);base64,/, '');
    base64Image.value = base64;
  };
  reader.readAsDataURL(file);
};

const handleSubmit = async (event: Event) => {
  event.preventDefault();

  if (barcode.value.includes(' ')) {
    $notificationStore.showNotification('El código de barras no debe contener espacios','error');
    return;
  }

  const productData = {
    barcode: barcode.value,
    brand: brand.value,
    categories: selectedCategories.value,
    image: base64Image.value || '',
    internalReference: internalReference,
    name: name.value,
    salePrice: salePrice.value.toFixed(2),
    stockQuantity: stockQuantity.value,
    storehouseId: storehouseId.value,
  };

  try {
    await $newProductStore.createProduct(productData);
     resetForm();
  } catch (err) {
    console.error('Error al crear el producto:', err);
  }
};

const resetForm = () => {
  name.value = '';
  salePrice.value = 0;
  stockQuantity.value = 1 ;
  barcode.value = '';
  brand.value = '';
  selectedCategories.value = [];
  selectedFile.value = null;
  base64Image.value = '';
  storehouseId.value = null;
};
</script>

<template>
  <DefaultLayout>
    <div>
      <main class="lg:w-3/4 mx-auto p-10 space-y-10">
        <section class="flex items-center gap-2">
          <button
            class="bg-transparent border p-1.5 rounded-md cursor-pointer hover:bg-secondary-600 transition"
            @click="$router.back()"
          >
            <ArrowLeftIcon class="size-6 text-black" />
          </button>
          <h1 class="text-3xl font-black text-black">Agregar un nuevo producto</h1>
        </section>

        <section>
          <form @submit="handleSubmit" class="max-w-md mx-auto">
            <div class="relative z-0 w-full mb-5 group">
              <input 
                type="text" 
                name="name" 
                id="name" 
                class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-primary-1000 peer" 
                placeholder=" " 
                v-model="name" 
                required 
              />
              <label for="name" class="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 peer-focus:text-primary-1000 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Nombre</label>
            </div>
            <div class="grid md:grid-cols-2 md:gap-x-6">
                <div class="relative z-0 w-full mb-5 group">
                    <input 
                    type="number" 
                    name="salePrice"
                    id="salePrice" 
                    class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-primary-1000 peer" 
                    placeholder=" " 
                    v-model.number="salePrice" 
                    min="0" 
                    required 
                    />
                    <label for="salePrice" class="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 peer-focus:text-primary-1000 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Precio</label>
                </div>
                <div class="relative z-0 w-full mb-5 group">
                    <input 
                    type="number" 
                    name="stockQuantity" 
                    id="stockQuantity" 
                    class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-primary-1000 peer" 
                    placeholder=" " 
                    v-model.number="stockQuantity" 
                    min="0" 
                    required 
                    />
                    <label for="stockQuantity" class="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 peer-focus:text-primary-1000 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Stock</label>
                </div>
                <div class="relative z-0 w-full mb-5 group">
              <input 
                type="text" 
                name="barcode" 
                id="barcode" 
                class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-primary-1000 peer" 
                placeholder=" " 
                v-model="barcode"
                required
                maxlength="5"
              />
              <label for="barcode" class="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 peer-focus:text-primary-1000 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Código de Barras</label>
            </div>
            <div class="relative z-0 w-full mb-5 group">
              <input 
                type="text" 
                name="brand" 
                id="brand" 
                class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-primary-1000 peer" 
                placeholder=" " 
                v-model="brand"
                required 
              />
              <label for="brand" class="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 peer-focus:text-primary-1000 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Marca</label>
            </div>
            </div>
            <div class="mb-5">
              <div class="mb-2">
                <label for="input-group-search" class="sr-only">Search</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg class="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                    </svg>
                  </div>
                  <input 
                    type="text" 
                    id="input-group-search" 
                    v-model="searchQuery" 
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-700 block w-full pl-10 p-2.5" 
                    placeholder="Buscar categoría"
                  />
                </div>
              </div>
              <ul class="h-48 pr-3 pb-3 overflow-y-auto text-sm text-gray-700" aria-labelledby="dropdownSearchButton">
                <li v-for="category in filteredCategories" :key="category.id">
                  <div class="flex items-center p-2 rounded hover:bg-gray-100">
                    <input 
                      :id="'checkbox-item-' + category.id" 
                      type="checkbox" 
                      :value="category.id" 
                      v-model="selectedCategories" 
                      class="w-4 h-4 text-primary-1000 bg-gray-100 border-gray-300 rounded focus:ring-primary-700 focus:ring-2"
                    />
                    <label :for="'checkbox-item-' + category.id" class="w-full ml-2 text-sm font-medium text-gray-900">{{ category.name }}</label>
                  </div>
                </li>
              </ul>
            </div>
            <div class="relative z-0 w-full mb-5 group">
              <label class="block text-sm font-medium text-gray-900">Inventario</label>
              <select v-model="storehouseId" class="border-2 rounded-md border-secondary-900  w-full" required>
                <option v-for="warehouse in $inventoryTransferStore.warehouses" :key="warehouse.id" :value="warehouse.id">{{ warehouse.name }}</option>
              </select>
            </div>
            <div>
              <label class="block my-5 text-sm font-medium text-gray-900" for="file">Imagen</label>
              <input 
                class="block w-full text-sm text-gray-900 border border-primary-700 rounded-lg cursor-pointer focus:outline-none" 
                id="file" 
                type="file" 
                @change="handleFileChange"
                accept=".jpeg, .jpg, .png"
              >

             <div v-if="base64Image" class="mt-4">
                <h3 class="text-lg font-medium">Preview</h3>
                <div>
                  <img :src="'data:image/jpeg;base64,' + base64Image" class="w-40 object-cover" />
                </div>
              </div>
            </div>
            <button type="submit" class="mt-5 text-white bg-primary-900 hover:bg-primary-1000 focus:ring-4 focus:outline-none focus:ring-primary-700 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center">Agregar Producto</button>
          </form>
        </section>
      </main>
      <Spinner :show="loading" />
    </div>
  </DefaultLayout>
</template>

<style scoped>
input::file-selector-button {
  background-color: #948971;
  color: #fff;
}

input::file-selector-button:hover {
  background-color: #877d67;
}
</style>
