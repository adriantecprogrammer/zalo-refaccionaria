<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { defineProps, defineEmits } from 'vue';
import { useShiftsStore } from '@/stores/shifts';
import { formatToHumanReadableDate } from '@/helpers';
import { PaymentMethodId } from '@/types';
import { toCurrency } from '@/helpers';
import { getFormattedCurrentTime } from '@/helpers';

type BalanceState = 'deficient' | 'balanced' | 'excessive';

defineProps({
  visible: Boolean,
});

const $shiftsStore = useShiftsStore();
const emit = defineEmits(['close', 'closeWithoutShift', 'confirm']);


const denominations = ref([
  { value: 0.1, count: 0 },
  { value: 0.5, count: 0 },
  { value: 1, count: 0 },
  { value: 2, count: 0 },
  { value: 5, count: 0 },
  { value: 10, count: 0 },
  { value: 20, count: 0 },
  { value: 50, count: 0 },
  { value: 100, count: 0 },
  { value: 200, count: 0 },
  { value: 500, count: 0 },
  { value: 1000, count: 0 },
]);

const comments = ref('')
const finalCash = ref(0);
const showCalculetorMoney = ref(false);


const configClasses = computed(() => {
  return {
    'balanced': 'bg-green-100 text-green-800 ',
    'deficient': 'bg-red-100 text-red-800 ',
    'excessive': 'bg-yellow-100 text-yellow-800 ',
  }[isBalanced.value];
});

const calculatedCashAmount = computed(() => {
  return denominations.value.reduce((total, denom) => {
    return total + denom.value * denom.count;
  }, 0);
});

const configStatus = computed(() => {
  return {
    'balanced': '$ Balanceado',
    'deficient': '$ Insuficiente',
    'excessive': '$ Excedente',
  }[isBalanced.value];
});

const configDifference = computed(() => {
  return {
    'balanced': '',
    'deficient': ', Faltan: ',
    'excessive': ', Sobran:',
  }[isBalanced.value];
});

const isBalanced = computed<BalanceState>(() => {
  if (finalCash.value === $shiftsStore.expectedAccumulatedCash) {
    return 'balanced'
  } else if (finalCash.value < $shiftsStore.expectedAccumulatedCash) {
    return 'deficient'
  } else {
    return 'excessive'
  }
});

const diferenceCash = computed(() => {
  return Math.abs($shiftsStore.expectedAccumulatedCash - finalCash.value);
});

const paymentMethodFormatter = (paymentMethod: PaymentMethodId) => {
  if (paymentMethod === PaymentMethodId.Card) {
    return 'Tarjeta'
  } else if (paymentMethod === PaymentMethodId.Cash) {
    return 'Efectivo'
  } else if (paymentMethod === PaymentMethodId.Transfer) {
    return 'Transferencia'
  } else if (paymentMethod === PaymentMethodId.CashCard) {
    return 'Efectivo + Tarjeta'
  } else {
    return 'Efectivo + Transferencia'
  }
};

const handleLogout = async () => {
  await $shiftsStore.closeShift(finalCash.value, comments.value);
  emit('confirm');
};

const closeWithoutShift = () => {
  emit('closeWithoutShift');
};

const closeModal = () => {
  emit('close');
};

watch(calculatedCashAmount, (newVal) => {
  finalCash.value = newVal;
  console.log(finalCash.value)
});


onMounted(() => {
  console.log($shiftsStore.initialCash)
});
</script>


<template>
  <div v-if="visible" tabindex="-1" aria-hidden="true"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-y-auto ">
    <div class="relative p-4 w-full max-w-xl min-h-screen">
      <div class="relative bg-white rounded-lg shadow mt-16">
        <!-- Modal header -->
        <div class="flex items-center justify-between p-4 border-b rounded-t">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ showCalculetorMoney ? 'Calculadora de dinero' : 'Corte de caja' }}
          </h3>
          <button type="button"
            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-red-600 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
            @click="closeModal">
            <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
            </svg>
            <span class="sr-only">Close modal</span>
          </button>
        </div>

        <!-- Modal body -->
        <div class="p-4 space-y-4">


          <div v-if="showCalculetorMoney" class="p-4 space-y-4">
            <h4 class="text-sm font-medium text-gray-900">Monedas/billetes</h4>
            <div class="grid grid-cols-2 gap-y-2">
              <div v-for="denomination in denominations" :key="denomination.value" class="flex items-center space-x-2">
                <input type="number" v-model="denomination.count"
                  class="w-20 border border-pr rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0" min="0" />
                <span class="text-sm text-gray-700">${{ denomination.value }}</span>
              </div>
            </div>

            <div>
              Total: ${{ calculatedCashAmount }}
            </div>
          </div>

          <template v-else>

            <div class="space-y-2">
              <p class="flex justify-between items-center">

                Inicio del turno
                <span>{{ formatToHumanReadableDate(`${$shiftsStore.shiftOpen?.start}`, true) }}</span>
              </p>
              <p class="flex justify-between items-center">
                Fin del turno
                <span>{{ getFormattedCurrentTime() }}</span>
              </p>
            </div>

            <table class="min-w-full text-left text-gray-900">
              <thead>
                <tr>
                  <th>Tipo de venta</th>
                  <th>Cantidad</th>
                </tr>
              </thead>
              <tbody class="">
                <tr v-for="(sale, index) in $shiftsStore.shiftSales?.sales" :key="`${sale.paymentMethod}-${index}`">
                  <td>{{ paymentMethodFormatter(sale.paymentMethod) }}</td>
                  <td>{{ sale.totalOrders }}</td>
                </tr>
              </tbody>
              <tfoot class="border-t">
                <tr>
                  <td>Total de ventas</td>
                  <td>{{ $shiftsStore.cantSales }} </td>
                </tr>
              </tfoot>
            </table>

            <table class="min-w-full text-left text-gray-900">
              <tbody class="">
                <tr>
                  <td class="font-bold">Ventas Electronicas</td>
                  <td></td>
                  <td></td>
                </tr>
                <tr class="border-spacing-8">
                  <td>Suma de las ventas totales electronicas y mixto</td>
                  <td>{{ toCurrency($shiftsStore.totalElectronicSales) }}</td>
                </tr>
                <tr>
                  <td class="font-bold">Ventas en Efectivo</td>
                  <td></td>
                  <td></td>
                </tr>
                <tr class="border-spacing-8">
                  <td>Suma de las ventas totales en efectivo y mixto</td>
                  <td >{{ toCurrency($shiftsStore.totalSales) }}</td>
                </tr>
                <tr>
                  <td class="font-bold">Efectivo Inicial</td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td>Monto de efectivo al iniciar el turno</td>
                  <td>{{ toCurrency($shiftsStore.initialCash) }}</td>
                </tr>
              </tbody>
              <tfoot class="border-t">
                <tr>
                  <td>Efectivo total esperado en caja</td>
                </tr>
                <tr>
                  <td>(Ventas en Efectivo + Efectivo Inicial)</td>
                  <td>{{ toCurrency($shiftsStore.expectedAccumulatedCash) }} </td>
                </tr>
              </tfoot>
            </table>

            <div class="flex justify-between  gap-2">
              <p>Total de dinero que tienes actualmente en caja:</p>

              <div class="flex items-center flex-col gap-2">
                <span>{{ toCurrency(finalCash) }}</span>
                <button @click="showCalculetorMoney = true"
                  class=" bg-primary-900 hover:bg-primary-1000 text-white focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-1.5 py-1 text-center">
                  Tabulador
                </button>
              </div>
              
            </div>

            <p class="flex items-center gap-2">
              Status del corte:
              <span class="text-xs font-medium me-2 px-2.5 py-0.5 rounded" :class="configClasses">
                {{ configStatus }}
                {{ configDifference }} {{ isBalanced === 'balanced' ? '' : toCurrency(diferenceCash) }}
              </span>
            </p>


            <div class="mt-5">
              <label for="message" class="block mb-2 text-sm font-medium text-gray-900">Comentarios</label>
              <textarea id="message" rows="4"
                class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-900 focus:border-primary-900"
                placeholder="Escribe tus comentarios aqui..." v-model="comments"></textarea>
            </div>

          </template>

        </div>


        <!-- Modal footer -->
        <div class="flex justify-end space-x-2 p-4 border-t border-gray-200">

          <template v-if="!showCalculetorMoney">
            <button @click="closeModal" type="button"
              class="text-primary-900 border border-primary-900 hover:text-primary-1000 hover:border-primary-1000 hover:bg-secondary-200 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
              Cancelar
            </button>
            <button @click="closeWithoutShift" type="button"
              class=" text-primary-900 border border-primary-900 hover:text-primary-1000 hover:border-primary-1000 hover:bg-secondary-200 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
              Salir sin corte
            </button>
            <button @click="handleLogout"
              class="text-white bg-primary-900 hover:bg-primary-1000 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
              Cerrar corte y sesión
            </button>
          </template>

          <button v-else @click="showCalculetorMoney = false"
            class="text-primary-900 border border-primary-900 hover:text-primary-1000 hover:border-primary-1000 hover:bg-secondary-200 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
            Regresar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>