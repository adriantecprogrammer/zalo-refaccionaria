import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiClient from "@/api/apiClient";
import type { Product } from "@/types";
import { useCartStore } from "@/stores/cart";
import { useNotificationStore } from "@/stores/notification";

export const useProductStore = defineStore("productStore", () => {
  const products = ref<Product[]>([]);
  const searchQuery = ref<string>("");
  const isLoading = ref<boolean>(false);

  const cartStore = useCartStore();
  const notificationStore = useNotificationStore();

  const getAllProducts = async () => {
    isLoading.value = true;
    try {
      const response = await apiClient.get("/products");
      products.value = response.data.map((product: any) => ({
        ...product,
        cantidadAMano: parseFloat(product.cantidadAMano),
        coste: parseFloat(product.coste),
        precioVenta: parseFloat(product.precioVenta),
      }));
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    } finally {
      console.log(products.value);
      isLoading.value = false;
    }
  };

  const searchProductsByName = async (name: string): Promise<boolean> => {
    isLoading.value = true;
    try {
      const formattedName = name.replace(/ /g, "+");
      const response = await apiClient.get(
        `/products/search?name=${formattedName}`,
      );

      products.value = response.data.map((product: any) => ({
        ...product,
        cantidadAMano: parseFloat(product.cantidadAMano),
        coste: parseFloat(product.coste),
        precioVenta: parseFloat(product.precioVenta),
      }));

      if (products.value.length === 0) {
        notificationStore.showNotification(
          "No hay productos con un nombre similar a ese",
          "error",
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error searching products by name:", error);
      notificationStore.showNotification(
        "Error al buscar productos por nombre",
        "error",
      );
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const searchProductByBarcode = async (barcode: string): Promise<boolean> => {
    isLoading.value = true;
    try {
      const response = await apiClient.get(
        `/products/search?barcode=${barcode}`,
      );
      if (response.data.length === 1) {
        const product = response.data[0];
        if (product.stockQuantity > 0) {
          cartStore.addToCart(product);
          notificationStore.showNotification(
            "Producto agregado al carrito con éxito",
            "success",
          );
          return true;
        } else {
          notificationStore.showNotification(
            "No hay stock suficiente",
            "error",
          );
          return false;
        }
      } else {
        notificationStore.showNotification(
          "No existe un producto con ese código de barras",
          "error",
        );
        return false;
      }
    } catch (error) {
      console.error("Error searching product by barcode:", error);
      notificationStore.showNotification(
        "Error al buscar el producto",
        "error",
      );
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const addSingleProductToCart = () => {
    const filteredProducts = filterProducts.value;
    if (filteredProducts.length === 1) {
      const product = filteredProducts[0];
      if (product.stockQuantity > 0) {
        cartStore.addToCart(product);
        notificationStore.showNotification(
          "Producto agregado al carrito con éxito",
          "success",
        );
        return true; // Indica que se agregó el producto
      } else {
        notificationStore.showNotification("No hay stock suficiente", "error");
        return false; // Indica que no se agregó el producto
      }
    }
  };

  const filterProducts = computed(() => {
    return products.value.filter(
      (product) =>
        product.barcode
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase()) ||
        product.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
    );
  });

  return {
    isLoading,
    products,
    searchQuery,
    getAllProducts,
    searchProductsByName,
    searchProductByBarcode,
    filterProducts,
    addSingleProductToCart,
  };
});
