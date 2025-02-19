import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import apiClient from "@/api/apiClient";
import type { Warehouse, Product, ITransferHistory } from "@/types";
import { useUserStore } from "@/stores/user";
import { useNotificationStore } from "@/stores/notification";

export const useInventoryTransferStore = defineStore(
  "inventoryTransferStore",
  () => {
    const emptyProducts = computed<boolean>(
      () => productsToTransfer.value.length === 0,
    );
    const error = ref<string | null>(null);
    const isLoading = ref<boolean>(false);
    const productsToTransfer = ref<Product[]>([]);
    const warehouses = ref<Warehouse[]>([]);
    const transferHistory = ref<ITransferHistory[]>([]);

    const selectedOrigin = ref<Warehouse | null>(null);
    const selectedDestination = ref<Warehouse | null>(null);

    const userStore = useUserStore();
    const notificationStore = useNotificationStore();

    const availableOrigins = computed(() => {
      return warehouses.value.filter(
        (warehouse) => warehouse.id !== selectedDestination.value?.id,
      );
    });

    const availableDestinations = computed(() => {
      return warehouses.value.filter(
        (warehouse) => warehouse.id !== selectedOrigin.value?.id,
      );
    });

    const getAllWarehouses = async () => {
      isLoading.value = true;
      error.value = null;

      try {
        const response = await apiClient.get("/storehouses");
        warehouses.value = response.data;
      } catch (err) {
        error.value = "Error fetching warehouses";
        console.error(err);
      } finally {
        isLoading.value = false;
      }
    };

    const getUserSpecificStorageKey = (key: string) => {
      const currentUser = userStore.user;
      return currentUser ? `${key}_${currentUser.id}` : key;
    };

    const loadTransfersFromStorage = () => {
      const storedTransfers = localStorage.getItem(
        getUserSpecificStorageKey("transfer"),
      );
      productsToTransfer.value = storedTransfers
        ? JSON.parse(storedTransfers)
        : [];
    };

    const loadSelectedOriginFromStorage = () => {
      const storedOrigin = localStorage.getItem(
        getUserSpecificStorageKey("selectedOrigin"),
      );
      selectedOrigin.value = storedOrigin ? JSON.parse(storedOrigin) : null;
    };

    const loadSelectedDestinationFromStorage = () => {
      const storedDestination = localStorage.getItem(
        getUserSpecificStorageKey("selectedDestination"),
      );
      selectedDestination.value = storedDestination
        ? JSON.parse(storedDestination)
        : null;
    };

    const saveSelectedOriginToStorage = () => {
      localStorage.setItem(
        getUserSpecificStorageKey("selectedOrigin"),
        JSON.stringify(selectedOrigin.value),
      );
    };

    const saveSelectedDestinationToStorage = () => {
      localStorage.setItem(
        getUserSpecificStorageKey("selectedDestination"),
        JSON.stringify(selectedDestination.value),
      );
    };

    const clearSelectedOrigin = () => {
      selectedOrigin.value = null;
      localStorage.removeItem(getUserSpecificStorageKey("selectedOrigin"));
    };

    const clearSelectedDestination = () => {
      selectedDestination.value = null;
      localStorage.removeItem(getUserSpecificStorageKey("selectedDestination"));
    };

    watch(
      productsToTransfer,
      (newTransfers) => {
        localStorage.setItem(
          getUserSpecificStorageKey("transfer"),
          JSON.stringify(newTransfers),
        );
      },
      { deep: true },
    );

    const addProductToTransfer = (product: Product) => {
      if (
        !productsToTransfer.value.some((p) => p.barcode === product.barcode)
      ) {
        productsToTransfer.value.push(product);
      }
    };

    const removeProductFromTransfer = (id: number) => {
      productsToTransfer.value = productsToTransfer.value.filter(
        (p) => p.id !== id,
      );
    };

    const getTransferHistorail = async () => {
      try {
        const response = await apiClient.get("/transfers");
        transferHistory.value = response.data;
      } catch (error) {
        console.error("Error getting transfer history:", error);
      }
    };

    const registerTransfer = async () => {
      if (!selectedOrigin.value || !selectedDestination.value) {
        notificationStore.showNotification(
          "Origen y destino son requeridos",
          "error",
        );
        return;
      }

      const payload = {
        fromStorehouseId: selectedOrigin.value.id,
        toStorehouseId: selectedDestination.value.id,
        status: "Pendiente",
        products: productsToTransfer.value.map((product) => ({
          id: product.id,
        })),
      };

      try {
        const response = await apiClient.post("/transfers", payload);
        clearTransfers();
        notificationStore.showNotification(
          "Transferencia registrada con éxito",
          "success",
        );
        return response.data;
      } catch (error) {
        console.error("Error registering transfer:", error);
        notificationStore.showNotification(
          "Error al registrar la transferencia",
          "error",
        );
        throw error;
      }
    };

    const clearTransfers = () => {
      productsToTransfer.value = [];
      clearSelectedOrigin();
      clearSelectedDestination();
    };

    const getProductByBarcode = async (
      barcode: string,
    ): Promise<Product | null> => {
      isLoading.value = true;
      try {
        const response = await apiClient.get(
          `/products/search?barcode=${barcode}`,
        );
        const product = response.data[0];
        if (product) {
          if (product.stockQuantity > 0) {
            if (
              selectedOrigin.value &&
              product.storehouseId === selectedOrigin.value.id
            ) {
              return product;
            } else {
              notificationStore.showNotification(
                "El producto seleccionado no se encuentra en el origen seleccionado",
                "error",
              );
              return null;
            }
          } else {
            notificationStore.showNotification(
              "No hay stock suficiente o el producto no existe",
              "error",
            );
            return null;
          }
        } else {
          notificationStore.showNotification(
            "No existe un producto con ese código de barras",
            "error",
          );
          return null;
        }
      } catch (error) {
        console.error("Error searching product by barcode:", error);
        notificationStore.showNotification(
          "Error al buscar el producto",
          "error",
        );
        return null;
      } finally {
        isLoading.value = false;
      }
    };

    return {
      availableDestinations,
      availableOrigins,
      emptyProducts,
      error,
      isLoading,
      productsToTransfer,
      selectedDestination,
      selectedOrigin,
      warehouses,
      transferHistory,

      addProductToTransfer,
      clearSelectedDestination,
      clearSelectedOrigin,
      clearTransfers,
      getAllWarehouses,
      getProductByBarcode,
      getTransferHistorail,
      getUserSpecificStorageKey,
      loadSelectedDestinationFromStorage,
      loadSelectedOriginFromStorage,
      loadTransfersFromStorage,
      registerTransfer,
      removeProductFromTransfer,
      saveSelectedDestinationToStorage,
      saveSelectedOriginToStorage,
    };
  },
);
