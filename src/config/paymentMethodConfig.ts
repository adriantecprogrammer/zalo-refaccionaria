import { PaymentMethodId } from "@/types";
import CashIcon from "@/components/icons/CashIcon.vue";
import CreditCardIcon from "@/components/icons/CreditCardIcon.vue";
import CreditCardIcon2 from "@/components/icons/CreditCardIcon2.vue";
import DolarIcon from "@/components/icons/DolarIcon.vue";
import type { Component } from "vue";

interface PaymentMethodConfig {
  icon: Component;
  name: string;
}

export const paymentMethodConfigs: Record<
  PaymentMethodId,
  PaymentMethodConfig
> = {
  [PaymentMethodId.Cash]: {
    icon: DolarIcon,
    name: "Efectivo",
  },
  [PaymentMethodId.Card]: {
    icon: CreditCardIcon,
    name: "Tarjeta",
  },
  [PaymentMethodId.Transfer]: {
    icon: CashIcon,
    name: "Transferencia",
  },
  [PaymentMethodId.CashCard]: {
    icon: CreditCardIcon2,
    name: "Efectivo + Tarjeta",
  },
  [PaymentMethodId.CashTransfer]: {
    icon: CashIcon,
    name: "Efectivo + Transferencia",
  },
};
