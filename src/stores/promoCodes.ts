import { defineStore } from "pinia";
import type { IPromoCodes } from "@/types";
import { ref } from "vue";
import { useUserStore } from "@/stores/user";
import apiPromoCodes from "@/api/apiPromoCodes";

const STORE_NAME = "promoCodes";

export const usePromoCodesStore = defineStore(STORE_NAME, () => {
  const userStore = useUserStore();
  const codes = ref<IPromoCodes[] | null>([]);
  const storePromoCodes = ref();
  const discountCodes = ref<IPromoCodes[]>([]);

  const getPromoCodeStorageKey = () => {
    const currentUser = userStore.user;
    return currentUser ? `promo_${currentUser.id}` : "codes";
  };

  const getPromoCodes = async () => {
    try {
      const promoCodes = await apiPromoCodes.get("/promo-codes");
      codes.value = promoCodes.data;
      savePromoCodesLocalStorage();
    } catch (error) {
      return error;
    }
  };

  const savePromoCodesLocalStorage = () => {
    storePromoCodes.value = localStorage.setItem(
      getPromoCodeStorageKey(),
      JSON.stringify(codes.value),
    );
  };

  const getStorePromoCodes = () => {
    storePromoCodes.value = localStorage.getItem(getPromoCodeStorageKey());
    discountCodes.value = storePromoCodes.value
      ? JSON.parse(storePromoCodes.value)
      : [];
    console.log(discountCodes.value);
  };

  return {
    getPromoCodes,
    codes,
    storePromoCodes,
    getStorePromoCodes,
    discountCodes,
  };
});
