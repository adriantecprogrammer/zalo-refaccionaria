<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router';
import { computed, onMounted } from 'vue';
import NavBar from './components/NavBar.vue';
import { useShiftsStore } from './stores/shifts';

const $shiftsStore = useShiftsStore();
const route = useRoute();
const showNav = computed(() => {
  // Mostrar el navbar en todas las rutas excepto en la vista de login
  return route.name !== "LOGIN.VIEW";
});

onMounted(async () => {
  await $shiftsStore.checkForOpenShift();
});


</script>

<template>
  <div class="flex flex-col h-screen">
    <NavBar v-if="showNav" class="h-14"/>
    <div class="h-dvh">
      <RouterView />
    </div>
  </div>
</template>