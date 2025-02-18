<script setup lang="ts">
import { paymentMethodConfigs } from "@/config/paymentMethodConfig";
import { PaymentMethodId } from "@/types";
import { ref, computed, onMounted, watch } from "vue";
import { toCurrency } from "@/helpers";
import { useCartStore } from "@/stores";
import { useNotificationStore } from '@/stores/notification';
import { useRouter } from "vue-router";
import { useUserStore } from '@/stores/user';
import { useOrderStore } from "@/stores/order";
import InputCurrency from "@/components/InputCurrency.vue";

import type {
  PaymentAmount,
  PaymentMethod,
  LabelForPaymentMethod,
  User,
} from "@/types";

/**
 * ------------------------------------------
 *  Components
 * ------------------------------------------
 */
import ArrowLeftIcon from "@/components/icons/ArrowLeftIcon.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import Spinner from "@/components/SpinnerComponent.vue";
import ValidateOrderDialog from "@/components/ValidateOrderDialog.vue";


/**
 * ------------------------------------------
 *  Utils
 * ------------------------------------------
 */
const $router = useRouter();
const $cartStore = useCartStore();
const $notificationStore = useNotificationStore();
const $userStore = useUserStore();
const $orderStore = useOrderStore();

onMounted(() => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  if (users.length > 0) {
    $userStore.users = users;
  }

  if (user) {
    $userStore.user = user;
  }
});


/**
 * ------------------------------------------
 *  Data
 * ------------------------------------------
 */

const cashiers = ref<User[]>($userStore.users);
const cashReceived = ref<number>(0);
const creditOrDebitCommissionRate = 0.035;
const currentUser = ref<User | null>($userStore.user);
const selectedUser = ref<User | null>(currentUser.value)
const discount = ref<number>(0);
const discountOptions = [0, 5, 10]; // Opciones de descuento en porcentaje
const paymentAmounts = ref<PaymentAmount[]>([]);
const selectedPaymentMethod = ref("");
const electronicPay = ref();
const physicalPay = ref();
const isOpenValidateOrderDialog = ref<boolean>(false);
const buttonPayText = ref<string>('PAGAR')
const userPin = ref<string>()

const paymentMethods: PaymentMethod[] = Object.entries(
  paymentMethodConfigs
).map(([id, config]) => ({
  id: id as PaymentMethodId,
  name: config.name,
}));
const labelForPaymentMethod: LabelForPaymentMethod = paymentMethods.reduce(
  (acc, method) => ({
    ...acc,
    [method.id]: method.name,
  }),
  {} as LabelForPaymentMethod
);

const changeDue = computed<number>(() => {
  const totalCash = paymentAmounts.value.reduce((sum, payment) => {
    if (payment.method === PaymentMethodId.Cash) {
      return sum + payment.amount;
    }
    return sum;
  }, 0);

  return parseFloat((cashReceived.value - totalCash).toFixed(2));
});

const isCombinedMethod = computed<boolean>(() =>
  ["cash_card", "cash_transfer"].includes(
    selectedPaymentMethod.value
  )
);

const commissionAmount = computed(() => {
  if (isCombinedMethod.value) {
    // Si es un método combinado, calcular la comisión solo sobre la parte pagada con tarjeta
    return paymentAmounts.value.reduce((sum, payment) => {
      if (
        payment.method === PaymentMethodId.Card
      ) {
        return sum + calculateCommission(payment.amount);
      }
      return sum;
    }, 0);
  } else {
    // Si no es combinado, calcular la comisión sobre el subtotal
    if (
      selectedPaymentMethod.value === PaymentMethodId.Card
    ) {
      return calculateCommission(subtotal.value);
    }
    return 0;
  }
});

const subtotal = computed(() => {
  // Calcula el subtotal teniendo en cuenta los descuentos de los productos
  const productSubtotal = $cartStore.cart.reduce((acc, item) => {
    const productDiscountAmount = (item.salePrice * item.discount) / 100;
    return acc + (item.salePrice - productDiscountAmount) * item.quantity;
  }, 0);

  // Aplica el descuento de la venta al subtotal de los productos
  const saleDiscountAmount = productSubtotal * (discount.value / 100);
  return parseFloat((productSubtotal - saleDiscountAmount).toFixed(2));
});


const totalWithCommission = computed(() => {
  return parseFloat((subtotal.value + commissionAmount.value).toFixed(2));
});

const remainingAmount = computed<number>(() => {
  const paidAmount = paymentAmounts.value.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );

  const paidAmountFormatted = parseFloat(paidAmount.toFixed(2));

  const totalToPay = subtotal.value;

  return parseFloat((totalToPay - paidAmountFormatted).toFixed(2));
});

/**
 * ------------------------------------------
 *  LIFECYCLE
 * ------------------------------------------
 */

watch(selectedUser, () => {
  if (selectedUser.value?.id !== currentUser.value?.id) {
    buttonPayText.value = 'Validar Orden'
  } else {
    buttonPayText.value = 'PAGAR'
  }
})


/**
 * ------------------------------------------
 *  Methods
 * ------------------------------------------
 */

const openValidateOrderDialog = () => {
  console.log(currentUser.value?.name, 'ff')
  console.log(selectedUser.value?.name, 'ff');

  if (selectedUser.value?.id && currentUser.value?.id) {
    if (!selectedPaymentMethod.value) {
      $notificationStore.showNotification(
        "Debe seleccionar un método de pago.",
        "warning"
      );
    } else {
      if (selectedUser.value?.id !== currentUser.value?.id) {

        console.log('es diferente');
        userPin.value = selectedUser.value?.pin
        isOpenValidateOrderDialog.value = true
      }
      else {
        console.log('es igual');
        if (currentUser.value?.pin) {
          submitPayment(currentUser.value?.pin)
        }
      }
    }
    console.log("si entro")

  }


}

const closeValidateOrderDialog = () => {
  isOpenValidateOrderDialog.value = false
}

function handleBlur(event: Event) {
  const target = event.target as HTMLInputElement
  const input = target;

  if (paymentAmounts.value[0].amount > subtotal.value) {
    paymentAmounts.value[0].amount = parseFloat(subtotal.value.toFixed(2));
  }

  input.value = paymentAmounts.value[0].amount.toFixed(2);
  paymentAmounts.value[1].amount = parseFloat((subtotal.value - paymentAmounts.value[0].amount).toFixed(2));
}

const calculateCommission = (amount: number) => {
  return parseFloat((amount * creditOrDebitCommissionRate).toFixed(2));
};

function selectPaymentMethod(method: PaymentMethodId) {

  console.log('method', method);
  selectedPaymentMethod.value = method;
  paymentAmounts.value = [];
  cashReceived.value = 0;

  if (isCombinedMethod.value) {
    paymentAmounts.value = [
      { method: PaymentMethodId.Cash, amount: 0 },
      { method: method.split("_")[1] as PaymentMethodId, amount: 0 },
    ];
    console.log(paymentAmounts.value[1].method)
    console.log(paymentAmounts.value[1].amount)
    console.log('este es combinado ' + method)

  } else {
    let totalAmount = subtotal.value;

    // metodos para determinar pago electronico o fisico
    if (method === PaymentMethodId.Card) {
      const commission = calculateCommission(totalAmount);
      electronicPay.value = parseFloat(totalAmount.toFixed(2))
      totalAmount += commission;

      physicalPay.value = 0
      paymentAmounts.value = [{ method, amount: parseFloat(totalAmount.toFixed(2)) }];
      console.log(electronicPay.value)
      console.log('es con tarjeta')

    } else if (method === PaymentMethodId.Transfer) {
      physicalPay.value = 0
      electronicPay.value = parseFloat(totalAmount.toFixed(2))
      paymentAmounts.value = [{ method, amount: parseFloat(electronicPay.value.toFixed(2)) }];
      console.log(electronicPay.value)

    } else if (method === PaymentMethodId.Cash) {
      physicalPay.value = parseFloat(totalAmount.toFixed(2))
      electronicPay.value = 0
      paymentAmounts.value = [{ method, amount: parseFloat(physicalPay.value.toFixed(2)) }];
      console.log(physicalPay.value)
    }
  }
}

const getMixPayment = () => {
  paymentAmounts.value.forEach((pay) => {
    const method = pay.method
    if (method === PaymentMethodId.Cash) {
      physicalPay.value = pay.amount
      cashReceived.value = physicalPay.value
      paymentAmounts.value = [{ method, amount: parseFloat(physicalPay.value.toFixed(2)) }];
      console.log(physicalPay.value + 'a')
    } else {
      electronicPay.value = pay.amount
      paymentAmounts.value = [{ method, amount: parseFloat(electronicPay.value.toFixed(2)) }];
      console.log(electronicPay.value + 'a')
    }

  })
}

async function submitPayment(userPin: string) {

  console.log("este el user", userPin);
  console.log(userPin)

  // Verificar que haya un método de pago seleccionado
  if (!selectedPaymentMethod.value) {
    $notificationStore.showNotification(
      "Debe seleccionar un método de pago.",
      "warning"
    );
    return;
  }

  const totalPaid = paymentAmounts.value.reduce((sum, payment) => sum + payment.amount, 0);

  console.log(commissionAmount.value)

  if (totalPaid === 0) {
    $notificationStore.showNotification(
      "El dinero recibido no cubre el total a pagar.",
      "warning"
    );
    return;
  }

  // Verificar el monto restante o si se usa tarjeta y el total pagado es igual al total con comisión
  const isRemainingAmountValid = remainingAmount.value === 0 ||
    ((selectedPaymentMethod.value === PaymentMethodId.Card) && totalPaid === totalWithCommission.value);

  if (!isRemainingAmountValid) {
    $notificationStore.showNotification(
      `El monto total ingresado (${toCurrency(totalPaid)}) no coincide con el total a pagar (${toCurrency(totalWithCommission.value)}). Por favor, verifique los montos.`,
      "warning"
    );
    return;
  }

  if (isCombinedMethod.value) {
    getMixPayment()
  }

  // Verificar que el efectivo recibido sea suficiente para cubrir el monto en efectivo
  console.log(paymentAmounts.value.find(payment => payment.method === PaymentMethodId.Cash));
  const cashPayment = paymentAmounts.value.find(payment => payment.method === PaymentMethodId.Cash);
  console.log('cashPayment', cashPayment);
  console.log('cashReceived', cashReceived.value);
  console.log('cashPayment.amount', cashPayment?.amount);
  if (cashPayment && !isCombinedMethod.value && (cashReceived.value < cashPayment.amount)) {
    $notificationStore.showNotification(
      "El dinero recibido en efectivo no es suficiente para cubrir el monto a pagar.",
      "warning"
    );
    return;
  }
  console.log(cashReceived.value + " kk")
  console.log(selectedUser.value?.id)
  console.log(totalWithCommission.value)
  console.log(selectedPaymentMethod.value)
  console.log(discount.value)
  console.log(cashReceived.value)
  console.log(physicalPay.value)
  console.log(electronicPay.value)
  console.log(commissionAmount.value)


  if (selectedUser.value) {
    try {
      const pdfUrl = await $orderStore.registerOrder(
        selectedUser.value?.id,
        userPin,
        totalWithCommission.value,
        'pendiente',
        selectedPaymentMethod.value,
        discount.value,
        cashReceived.value,
        physicalPay.value,
        electronicPay.value,
        commissionAmount.value,
        $cartStore.cart
      );
      console.log($cartStore.cart)
      $notificationStore.showNotification("Operación exitosa", "success");

      // Vaciar el carrito antes de abrir la nueva ventana
      $cartStore.clearCart();

      // Abrimos el PDF en una nueva ventana
      window.open(pdfUrl, '_blank');

      // Redirigimos al carrito después de abrir el PDF
      $router.push({ name: 'HOME.VIEW' });
    } catch (error) {
      console.error('Error during checkout:', error);
      $notificationStore.showNotification("Error al registrar la orden", "error");
    }
  } else {
    $notificationStore.showNotification("No hay un cajero seleccionado", "error");
  }
}

/**
 * ------------------------------------------
 *  Watchers
 * ------------------------------------------
 */

watch(discount, () => {
  if (isCombinedMethod.value) {
    // Si es un método combinado, establecer ambos montos a 0
    paymentAmounts.value = paymentAmounts.value.map(payment => ({
      ...payment,
      amount: 0
    }));
  } else {
    // Recalcular el monto cuando se cambia el descuento para métodos no combinados
    paymentAmounts.value = paymentAmounts.value.map(payment => ({
      ...payment,
      amount: totalWithCommission.value
    }));
  }
  cashReceived.value = 0;
});
</script>

<template>
  <DefaultLayout>
    <div>
      <main class="w-2/3 lg:w-1/2 mx-auto py-10 space-y-10">
        <ValidateOrderDialog :userName="selectedUser?.name" :pin="userPin" :visible="isOpenValidateOrderDialog"
          @validate="submitPayment" @close="closeValidateOrderDialog"></ValidateOrderDialog>
        <section class="flex items-center gap-2">
          <button class="bg-transparent border p-1.5 rounded-md cursor-pointer hover:bg-secondary-600 transition"
            @click="$router.back()">
            <ArrowLeftIcon class="size-6 text-black" />
          </button>
          <h2 class="text-3xl font-black text-black">Informar Pago</h2>
        </section>

        <section class="space-y-10">
          <h3 class="text-2xl font-black text-black">¿Cómo pagó el cliente?</h3>

          <article class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="method in paymentMethods" :key="method.id"
              class="bg-white p-4 flex items-center gap-2 rounded-md cursor-pointer" :class="{
                'border-2 border-primary-900':
                  selectedPaymentMethod === method.id,
              }" @click="selectPaymentMethod(method.id)">
              <span class="bg-secondary-200 p-2 rounded-md">
                <component :is="paymentMethodConfigs[method.id].icon" class="size-4 text-black" />
              </span>
              <p>{{ method.name }}</p>
            </div>
          </article>

          <article class="mt-10">
            <h3 class="text-2xl font-black text-black">Seleccione el Descuento</h3>
            <select v-model="discount" class="w-full p-2 border rounded">
              <option v-for="option in discountOptions" :key="option" :value="option">
                {{ option }}%
              </option>
            </select>
          </article>

          <article v-if="selectedPaymentMethod" v-show="isCombinedMethod">
            <h3 class="text-2xl font-black text-black">Distribución del Pago</h3>
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div v-for="(payment, index) in paymentAmounts" :key="index" class="w-full space-y-2">
                <label :for="`payment-${index}`" class="block font-medium">
                  {{ labelForPaymentMethod[payment.method] }}
                </label>
                <InputCurrency v-if="index === 0" :id="`payment-${index}`"
                  :placeholder="`Monto en ${labelForPaymentMethod[payment.method]}`"
                  v-model:model-value="payment.amount" @blur="handleBlur($event)" />

                <input v-else :id="`payment-${index}`"
                  :placeholder="`Monto en ${labelForPaymentMethod[payment.method]}`" :value="toCurrency(payment.amount)"
                  disabled class="block w-full p-2 border rounded" />

              </div>
            </div>
            <p class="text-lg font-semibold">
              Monto restante: {{ toCurrency(remainingAmount) }}
            </p>
          </article>

          <article v-if="selectedPaymentMethod === 'cash'" class="mt-10">
            <h3 class="text-2xl font-black text-black">Cambio</h3>
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div class="w-full space-y-2">
                <label for="cash-received" class="block font-medium">Cantidad Recibida en Efectivo</label>
                <input id="cash-received" placeholder="Monto recibido" class="w-full p-2 border rounded" min="0"
                  type="number" v-model.number="cashReceived" />
              </div>
            </div>
            <p class="text-lg font-semibold">
              Cambio a devolver: <span :class="{ 'text-green-600': changeDue >= 0, 'text-red-600': changeDue < 0 }">{{
                toCurrency(changeDue) }}</span>
            </p>
          </article>


          <article class="mt-10">
            <h3 class="text-2xl font-black text-black">Seleccione el Cajero</h3>
            <select v-model="selectedUser" class="w-full p-2 border rounded">
              <option v-for="cashier in cashiers" :key="cashier.id" :value="cashier">
                {{ cashier.name }}
              </option>
            </select>
          </article>

          <article>
            <div v-if="commissionAmount > 0 && subtotal > 0">
              <p v-if="subtotal > 0" class="text-xl font-black text-black text-center">
                Subtotal:
                <span class="text-sm text-primary-900">
                  {{ toCurrency(subtotal) }}
                </span>
              </p>
              <p v-if="commissionAmount > 0" class="text-xl font-black text-black text-center">
                Comisión:
                <span v-if="commissionAmount > 0" class="text-sm text-primary-900">
                  {{ toCurrency(commissionAmount) }}
                </span>
              </p>
            </div>
            <p class="text-3xl font-black text-black text-center">
              Total a pagar:
              <span class="text-primary-900">
                {{ toCurrency(totalWithCommission) }}
              </span>
            </p>
          </article>

          <article>
            <div class="flex justify-between gap-4 mt-10">
              <button
                class="w-full bg-transparent border border-primary-900 text-primary-900 uppercase p-4 rounded-md hover:bg-secondary-300"
                @click="$router.back()">
                Regresar
              </button>
              <button class="w-full bg-primary-900 text-white uppercase p-4 rounded-md hover:bg-primary-1000"
                @click="openValidateOrderDialog">
                {{ buttonPayText }}
              </button>
            </div>
          </article>
        </section>
      </main>
    </div>
    <Spinner :show="$orderStore.isLoading" />
  </DefaultLayout>
</template>
