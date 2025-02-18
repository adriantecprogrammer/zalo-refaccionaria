<script setup lang="ts">

/*
*
*
* IMPORTS
*/

import { ref } from 'vue'


/*
*
*
* COMPONENTS
*/

import GreenCheckMark from './icons/GreenCheckMark.vue';
import ErrorIcon from './icons/ErrorIcon.vue';


const emit = defineEmits(['close', 'confirm', 'validate']);

const cancel = () => emit('close');


/*
*
*
* DATA
*/

const $props = defineProps({
  visible: Boolean,
  userName: String,
  pin: String
});


const isvalidatePin = ref<boolean>(false)
const userPin = ref<string>()
const showIcons = ref<boolean>(false)



/*
*
*
* METHODS
* 
*/

const validateOrder = () => {
  if (userPin.value === $props.pin) {
    isvalidatePin.value = true
    showIcons.value = true
    setTimeout(() => {
      userPin.value = ''
      isvalidatePin.value = false
      showIcons.value = false;
      console.log(userPin.value)
      emit('validate', $props.pin)
    }, 1500);

  } else if (userPin.value !== $props.pin) {
    isvalidatePin.value = false
    showIcons.value = true
    setTimeout(() => {
      isvalidatePin.value = false
      showIcons.value = false;
    }, 3000);
  }

  console.log(userPin.value);

}

</script>

<template>
  <div v-if="$props.visible" class="card" id="confirm-modal" tabindex="-1" aria-hidden="true">

    <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 " @click.self="cancel">
      <div class="relative p-4 w-full max-w-md max-h-full  opacity-0 scale-in-center"
        :class="{ 'scale-100 opacity-100': visible }">
        <!-- Modal content -->

        <div class="relative bg-white rounded-lg shadow">

          <!-- Modal header -->
          <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
            <h3 class="text-3xl font-semibold text-gray-900">Validación de la Orden</h3>
            <button type="button"
              class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-red-600 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
              @click="cancel">
              <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 14 14">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
              </svg>
              <span class="sr-only">Close modal</span>
            </button>
          </div>
          <!-- Modal body -->
          <div class="p-4 md:p-5 space-y-4">
            <small class="text-left text-sm flex">
              Para validar la orden, por favor ingrese PIN de
              <span class="font-bold ml-1">{{ $props.userName }}</span>
            </small>

            <div
              class="flex w-full justify-between gap-1 border focus:outline focus:ring-1 p-1 rounded-md border-gray-600">
              <input v-model="userPin" class="rounded w-full border-none  focus:outline-none focus:ring-0" type="text"
                placeholder="Ingrese PIN de Usuario" />
              <transition name="fade">
                <GreenCheckMark v-if="isvalidatePin && showIcons" />
              </transition>

              <transition name="fade">
                <ErrorIcon v-if="!isvalidatePin && showIcons" />
              </transition>
            </div>
            <small v-if="showIcons && !isvalidatePin" class="text-red-600">PIN inválido. Intente de nuevo o inicie
              sesión nuevamente</small>
            <small v-if="showIcons && isvalidatePin" class="text-green-600">PIN válido. Procesando la orden</small>
          </div>

          <div class="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b">
            <button @click="validateOrder" type="button"
              class="text-white bg-primary-900 hover:bg-primary-1000 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
              Validar y Pagar
            </button>
            <button @click="cancel" type="button"
              class="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-red-600 focus:z-10 focus:ring-4 focus:ring-gray-100">
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
  -webkit-animation: scale-in-center 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
  animation: scale-in-center 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
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
