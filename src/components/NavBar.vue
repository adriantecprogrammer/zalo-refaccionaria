<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import { Collapse } from 'flowbite';
import type { CollapseOptions } from 'flowbite';
import ConfirmLogoutDialog from '@/components/ConfirmLogoutDialog.vue';
import CloseShiftDialog from '@/components/CloseShiftDialog.vue';


const $userStore = useUserStore();

const showLogoutDialog = ref(false);
const showCloseShiftDialog = ref(false);

const handleCloseShift = () => {
  showCloseShiftDialog.value = true;
};

const closeLogoutDialog = () => {
  showLogoutDialog.value = false;
};

const confirmLogout = () => {
  closeLogoutDialog();
  $userStore.logout();
};

const closeShiftDialog = () => {
  showCloseShiftDialog.value = false;
};

const handleCloseWithoutShift = () => {
  closeShiftDialog();
  showLogoutDialog.value = true; // Ahora abrimos el ConfirmLogoutDialog
};

const handleConfirmLogout = () => {
  closeShiftDialog();
  $userStore.logout();
};

onMounted(() => {
  const $targetEl = document.getElementById('navbar-default') as HTMLElement;
  const $triggerEl = document.querySelector('[data-collapse-toggle="navbar-default"]') as HTMLElement;

  if ($targetEl && $triggerEl) {
    const options: CollapseOptions = {};
    new Collapse($targetEl, $triggerEl, options);
  }
});
</script>

<template>
  <nav class="bg-white border-gray-200 h-14 z-40">
    <div class="flex flex-wrap items-center justify-between mx-auto p-4">
      <router-link to="/home" class="flex items-center pb-1 space-x-1 md:space-x-3 rtl:space-x-reverse">
        <img src="@/assets/logotype.svg" class="h-8" alt="Logo" />
        <span class="md:text-xl font-bold text-black whitespace-nowrap">Treasure hunt store</span>
        <span class="md:text-xl">-</span>
        <span class="md:text-xl font-semibold text-primary-1000"> {{ $userStore.user?.name }} </span>
      </router-link>
      <button
        data-collapse-toggle="navbar-default"
        type="button"
        class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
        aria-controls="navbar-default"
        aria-expanded="false"
      >
        <span class="sr-only">Open main menu</span>
        <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15"/>
        </svg>
      </button>
      <div class="hidden w-full md:block md:w-auto" id="navbar-default">
        <ul class="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-4 lg:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white">
          <li>
            <router-link to="/inventories" class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 hover:underline md:hover:bg-transparent md:border-0 md:hover:text-primary-1000 md:p-0">Traslados</router-link>
          </li>
          <li>
            <router-link to="/orders" class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 hover:underline md:hover:bg-transparent md:border-0 md:hover:text-primary-1000 md:p-0">Ventas</router-link>
          </li>
          <li>
            <router-link to="/saleInProcess" class="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 hover:underline md:hover:bg-transparent md:border-0 md:hover:text-primary-1000 md:p-0">Ventas en Proceso</router-link>
          </li>
          <li class="md:-mt-1">
            <button  
              class="text-white bg-primary-900 hover:bg-primary-1000 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-1.5 text-nowrap text-center"
              @click="handleCloseShift">
              Cerrar sesión
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
  <CloseShiftDialog
    :visible="showCloseShiftDialog"
    @close="closeShiftDialog"
    @closeWithoutShift="handleCloseWithoutShift"
    @confirm="handleConfirmLogout"
  />
  <ConfirmLogoutDialog
    :visible="showLogoutDialog"
    @close="closeLogoutDialog"
    @confirm="confirmLogout"
  />
</template>
