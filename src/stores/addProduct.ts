import { ref } from "vue";
import { defineStore } from "pinia";
import apiProduct from "../api/apiProduct";
import { useNotificationStore } from "@/stores/notification";

const STORE_NAME = "addProduct";

export const useNewProductStore = defineStore(STORE_NAME, () => {
  const $notificationStore = useNotificationStore();

  const loading = ref<boolean>(false);
  const error = ref<Error | null>(null);

  const createProduct = async (productData: any) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await apiProduct.post("/productsTNT", productData);
      $notificationStore.showNotification(
        "Producto creado exitosamente",
        "success",
      );
      return response.data;
    } catch (err) {
      error.value = err as Error;
      $notificationStore.showNotification(
        "Error al crear el producto",
        "error",
      );
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    createProduct,
  };
});
