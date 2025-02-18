<script setup lang="ts">
/**
 * ------------------------------------------
 *	Components
 * ------------------------------------------
 */
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import Spinner from "@/components/SpinnerComponent.vue";

import { ref, computed,onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import {usePromoCodesStore} from '@/stores/promoCodes';

/*
*
* DATA
* 
*/
const email = ref<string>('');
const password = ref<string>('');
const $userStore = useUserStore();
const $promoCodesStore = usePromoCodesStore();

/*
*
* LIFECYCLE
* 
* 
*/

onMounted(() => {
   getCodes()
});


/*
*
* METHODS
* 
*/
const errorMessage = computed(() => $userStore.errorMessage);

const handleLogin = () => {

    $userStore.login(email.value, password.value);
};

const getCodes = async () => {
     await $promoCodesStore.getPromoCodes();
}

</script>

<template>
    <DefaultLayout>
        <section class="bg-primary-300">
            <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto h-full-screen lg:py-0">
                <a href="#" class="flex items-center text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900">
                    <img class="w-10 h-10 mr-2" src="@/assets/logotype.svg" alt="logo">
                    Treasure hunt store
                </a>
                <span class="mb-6 text-xs md:text-sm lg:text-base text-balance font-ligh text-center">Cazando tesoros,
                    creando recuerdos – Treasure Hunt Store</span>
                <div class="w-full bg-white rounded-lg shadow border md:mt-0 sm:max-w-md xl:p-0">
                    <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                            Inicia sesión
                        </h1>
                        <form @submit.prevent="handleLogin" class="space-y-4 md:space-y-6" action="#">
                            <div>
                                <label for="email" class="block mb-2 text-sm font-medium text-gray-900">Email</label>
                                <input v-model="email" type="email" name="email" id="email"
                                    class="bg-stone-50 border border-gray-300 text-gray-900 rounded-lg block w-full p-2.5"
                                    placeholder="Email" required>
                            </div>
                            <div>
                                <label for="password"
                                    class="block mb-2 text-sm font-medium text-gray-900">Contraseña</label>
                                <input v-model="password" type="password" name="password" id="password"
                                    placeholder="••••••••••"
                                    class="bg-stone-50 border border-gray-300 text-gray-900 rounded-lg block w-full p-2.5"
                                    required="true">
                            </div>
                            <button type="submit"
                                class="w-full text-white bg-primary-900 hover:bg-primary-1000 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Entrar</button>
                        </form>
                        <p v-if="errorMessage" class="text-red-500">{{ errorMessage }}</p>
                    </div>
                </div>
            </div>
        </section>
        <Spinner :show="$userStore.isLoading" />

    </DefaultLayout>
</template>
