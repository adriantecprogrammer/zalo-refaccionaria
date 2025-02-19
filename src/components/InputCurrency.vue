<script setup lang="ts">
import { computed, watch } from "vue";
import { useCurrencyInput } from "vue-currency-input";

/**
 * ------------------------------------------
 *	Utils
 * ------------------------------------------
 */
interface CurrencyInputProps {
  id: string;
  placeholder?: string; // Placeholder
  isRequired?: boolean;
  modelValue: number;
  readonly?: boolean;
}

interface Emit {
  (e: "update:modelValue", value: number): void;
  (e: "change", value: number): void;
  (e: "blur", event: Event): void;
}

const $props = withDefaults(defineProps<CurrencyInputProps>(), {
  isRequired: true,
  readonly: false, // Default value for readonly
});

const { inputRef, setValue, setOptions } = useCurrencyInput({
  currency: "MXN",
});
const $emit = defineEmits<Emit>();

/**
 * ------------------------------------------
 *	Data
 * ------------------------------------------
 */
const displayValue = computed(() => {
  return typeof $props.modelValue === "number"
    ? $props.modelValue.toString()
    : $props.modelValue;
});

/**
 * ------------------------------------------
 *	Watchers
 * ------------------------------------------
 */
// Watch for changes in modelValue to update the input externally
watch(
  () => $props.modelValue,
  (value) => {
    console.log("valueSet", value);
    setValue(value);
    setOptions({ currency: "MXN", precision: 2 });
  },
);

/**
 * ------------------------------------------
 *	Methods
 * ------------------------------------------
 */

/**
 * updateValue
 * @param event
 */
const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = target.value;
  const finalValue = value === "" ? 0 : parseFloat(value);

  $emit("update:modelValue", finalValue);
  $emit("change", finalValue);
};

/**
 * handleBlur
 * @param event
 */
const handleBlur = (event: Event) => {
  $emit("blur", event);
};
</script>

<template>
  <input
    :id="id"
    :placeholder="placeholder"
    :readonly="readonly"
    :required="isRequired"
    :value="displayValue"
    @input="updateValue"
    @change="handleBlur"
    @blur="handleBlur"
    class="block w-full rounded-lg border p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white border-slate-100 !text-customBlueDark dark:!text-customBlue dark:bg-customDark dark:border-customBlue/30"
    ref="inputRef"
    type="text"
  />
</template>
