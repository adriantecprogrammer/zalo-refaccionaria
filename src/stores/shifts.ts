import { defineStore } from "pinia";
import { computed, ref } from "vue";
import apiClient from "@/api/apiClient";
import { useUserStore } from "@/stores/user";
import { useNotificationStore } from "@/stores/notification";
import { type IOrderShift, type IShift } from "@/types";

export const useShiftsStore = defineStore("shiftsStore", () => {
  const $userStore = useUserStore();
  const $notificationStore = useNotificationStore();

  const cantSales = ref<number>(0);
  const initialCash = ref<number>(0);
  const isLoading = ref<boolean>(false);
  const shiftId = ref<number | null>(null);
  const shiftOpen = ref<IShift>();
  const shiftSales = ref<IOrderShift>();
  const showCalculetorModal = ref<boolean>(true);
  const totalSales = ref<number>(0);
  const totalElectronicSales = ref<number>(0);

  const expectedAccumulatedCash = computed<number>(() => {
    return Number(initialCash.value) + Number(totalSales.value);
  });

  const checkForOpenShift = async () => {
    isLoading.value = true;
    try {
      const response = await apiClient.get<IShift[]>("/shifts/open");

      if (response.data.length === 0) {
        showCalculetorModal.value = true; // No hay turnos abiertos
      } else {
        shiftId.value = response.data[0].id;
        initialCash.value = response.data[0].initialCash;
        shiftOpen.value = response.data[0];
        if (shiftId.value) {
          await getSalesById(shiftId.value);
        }
        showCalculetorModal.value = false; // Hay un turno abierto
      }
    } catch (error) {
      console.error("Error checking for open shift:", error);
    } finally {
      isLoading.value = false;
    }
  };

  // Método para registrar un nuevo corte
  const startNewShift = async (cashAmount: number) => {
    isLoading.value = true;
    try {
      const payload = {
        cashierId: $userStore.user?.id,
        initialCash: cashAmount,
      };

      await apiClient.post("/shifts/start", payload);
      $notificationStore.showNotification("Nuevo corte abierto", "success");
    } catch (error) {
      $notificationStore.showNotification(
        "Error al abrir un nuevo corte",
        "error",
      );
      console.error("Error al registrar un nuevo corte:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const closeShift = async (finalCash: number, note: string) => {
    isLoading.value = true;
    try {
      const payload = {
        shiftId: shiftId.value, // ID del turno abierto
        finalCash,
        totalSales: totalSales.value,
        note,
      };

      await apiClient.post("/shifts/close", payload);
      $notificationStore.showNotification(
        "Turno cerrado correctamente",
        "success",
      );

      resetShiftData();
    } catch (error) {
      $notificationStore.showNotification("Error al cerrar el turno", "error");
      console.error("Error al cerrar el turno:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const resetShiftData = () => {
    showCalculetorModal.value = true;
    shiftId.value = null;
    initialCash.value = 0;
    totalSales.value = 0;
    totalElectronicSales.value = 0;
  };

  const getSalesById = async (id: number) => {
    isLoading.value = true;
    try {
      console.log("id", id);
      const response = await apiClient.get<IOrderShift>(`/orders/shift/${id}`);
      console.log(response.data);
      shiftSales.value = response.data;
      shiftSales.value.totalSalesInShift = Number(
        shiftSales.value.totalSalesInShift,
      );

      if (shiftSales.value.totalPhysicalAmount > 0) {
        totalSales.value = shiftSales.value.totalPhysicalAmount;
      } else {
        totalSales.value = 0;
      }

      if (shiftSales.value.totalElectronicAmount > 0) {
        totalElectronicSales.value = shiftSales.value.totalElectronicAmount;
      } else {
        totalElectronicSales.value = 0;
      }

      cantSales.value = response.data.numberOfSalesInShift;
    } catch (error) {
      $notificationStore.showNotification(
        "Error al obtener las ventas",
        "error",
      );
      console.error("Error al obtener las ventas", error);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    cantSales,
    expectedAccumulatedCash,
    initialCash,
    isLoading,
    shiftId,
    shiftOpen,
    shiftSales,
    showCalculetorModal,
    totalSales,
    totalElectronicSales,

    checkForOpenShift,
    startNewShift,
    closeShift,
    resetShiftData,
    getSalesById,
  };
});
