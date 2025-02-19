import { defineStore } from "pinia";
import { ref } from "vue";
import apiClient from "@/api/apiClient";
import apiOrders from "@/api/apiOrders";
import type { CartItem, NewOrder, Order, OrderDetail } from "@/types";
import { useShiftsStore } from "@/stores/shifts";

export const useOrderStore = defineStore("order", () => {
  const isLoading = ref(false);

  async function registerOrder(
    userId: number,
    userPin: string,
    total: number,
    status: string = "pendiente",
    paymentMethod: string,
    discount: number = 0,
    cashReceived: number,
    physicalAmount: number,
    electronicAmount: number,
    commission: number,
    cartItems: CartItem[],
  ) {
    isLoading.value = true;

    const shiftsStore = useShiftsStore();
    const shiftId = shiftsStore.shiftId;

    const order: NewOrder = {
      userId,
      userPin,
      total,
      status,
      paymentMethod,
      discount,
      cashReceived,
      physicalAmount,
      electronicAmount,
      commission,
      products: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        discount: item.discount || 0,
      })),
      shiftId,
    };

    try {
      if (!shiftId) {
        throw new Error("No se ha iniciado un turno");
      }

      const response = await apiOrders.post("/orders", order, {
        responseType: "blob",
      });
      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      return pdfUrl;
    } catch (error) {
      console.error("Failed to register order:", error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  async function getAllOrders(): Promise<Order[]> {
    try {
      const response = await apiClient.get("/orders");
      return response.data;
    } catch (error) {
      console.error("Error:", error);
      return [];
    }
  }

  async function getOrderDetail(
    id: number | undefined,
  ): Promise<OrderDetail[]> {
    try {
      if (id === undefined) {
        console.log("id is undefined");
        return [];
      }
      const url = `orderdetails/${id}`;
      console.log("esta es: " + url);
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error("Error:", error);
      return [];
    }
  }

  return {
    isLoading,
    registerOrder,
    getAllOrders,
    getOrderDetail,
  };
});
