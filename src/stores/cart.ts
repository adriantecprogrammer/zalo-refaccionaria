import { computed, ref, watch } from "vue";
import { defineStore } from "pinia";
import type { Product, CartItem, SailInProcess } from "@/types";
import { useNotificationStore } from "@/stores/notification";
import { useUserStore } from "@/stores/user";
import { useOrderStore } from "@/stores/order";
import apiCart from "@/api/apiCarts";

const STORE_NAME = "cart";

export const useCartStore = defineStore(STORE_NAME, () => {
  const $notificationStore = useNotificationStore();
  const userStore = useUserStore();
  const orderStore = useOrderStore();
  const storedCart = ref();
  const userPin = ref<string>("");

  const getCartStorageKey = () => {
    const currentUser = userStore.user;
    return currentUser ? `cart_${currentUser.id}` : "cart";
  };

  storedCart.value = localStorage.getItem(getCartStorageKey());
  const cart = ref<CartItem[]>(
    storedCart.value ? JSON.parse(storedCart.value) : [],
  );

  const emptyCart = computed<boolean>(() => cart.value.length === 0);
  const totalPayable = computed<number>(() => {
    const total = cart.value.reduce((acc, item) => {
      const discountAmount = (item.salePrice * item.discount) / 100;
      return acc + (item.salePrice - discountAmount) * item.quantity;
    }, 0);
    return Number(total.toFixed(2));
  });
  const totalQuantity = computed<number>(() =>
    cart.value.reduce((acc, item) => acc + item.quantity, 0),
  );

  watch(
    cart,
    (newCart) => {
      storedCart.value = localStorage.setItem(
        getCartStorageKey(),
        JSON.stringify(newCart),
      );
    },
    { deep: true },
  );

  watch(
    storedCart,
    () => {
      storedCart.value = localStorage.getItem(getCartStorageKey());
    },
    { deep: true },
  );

  function addToCart(product: Product) {
    if (product.stockQuantity === 0) {
      $notificationStore.showNotification("No hay stock suficiente", "error");
      return;
    }

    const itemInCart = cart.value.find(
      (item) => item.barcode === product.barcode,
    );

    if (itemInCart) {
      if (itemInCart.quantity < product.stockQuantity) {
        itemInCart.quantity++;
      } else {
        $notificationStore.showNotification("No hay stock suficiente", "error");
      }
    } else {
      cart.value.push({ ...product, quantity: 1, discount: 0 });
    }
  }

  function addToCartWithQuantity(product: Product, quantity: number) {
    if (product.stockQuantity === 0 || quantity > product.stockQuantity) {
      $notificationStore.showNotification("No hay stock suficiente", "error");
      return;
    }

    const itemInCart = cart.value.find(
      (item) => item.barcode === product.barcode,
    );

    if (itemInCart) {
      if (itemInCart.quantity + quantity <= product.stockQuantity) {
        itemInCart.quantity += quantity;
      } else {
        $notificationStore.showNotification("No hay stock suficiente", "error");
      }
    } else {
      cart.value.push({ ...product, quantity, discount: 0 });
    }
  }

  async function getSaleInProcess(): Promise<SailInProcess[]> {
    try {
      const response = await apiCart.get("/carts");
      return response.data;
    } catch (error) {
      console.error("Error:", error);
      return [];
    }
  }

  async function postSaleInProcess(
    cart: string | null,
  ): Promise<{ success: boolean; data: Product[] }> {
    const body = {
      string: cart,
    };

    try {
      const response = await apiCart.post("/carts", body);
      if (response.status === 200) {
        return {
          success: true, // La petición fue exitosa
          data: response.data,
        };
      } else {
        console.error("Petición no exitosa:", response.status);
        return {
          success: false,
          data: [],
        };
      }
    } catch (error) {
      console.error("Error en la petición:", error);
      return {
        success: false, // La petición falló
        data: [],
      };
    }
  }

  async function deleteSailInProcess(id: number | undefined) {
    try {
      const response = await apiCart.delete("/carts/" + id);
      console.log(response);
    } catch (error) {
      console.error("Error al eliminar venta en proceso:", error);
    }
  }

  function increaseQuantity(product: Product) {
    const itemInCart = cart.value.find(
      (item) => item.barcode === product.barcode,
    );

    if (itemInCart && itemInCart.quantity < product.stockQuantity) {
      itemInCart.quantity++;
    } else {
      $notificationStore.showNotification("No hay stock suficiente", "error");
    }
  }

  function decreaseQuantity(product: Product) {
    const itemInCart = cart.value.find(
      (item) => item.barcode === product.barcode,
    );

    if (itemInCart && itemInCart.quantity > 0) {
      itemInCart.quantity--;
      if (itemInCart.quantity === 0) {
        const index = cart.value.findIndex(
          (item) => item.barcode === product.barcode,
        );
        cart.value.splice(index, 1);
      }
    }
  }
  function setDiscountPrice(product: Product, newPrice: number) {
    const newProduct = cart.value.find(
      (item) => item.barcode === product.barcode,
    );

    if (newProduct) {
      newProduct.salePrice = newPrice;
    }
  }

  function deleteItem(product: Product) {
    const index = cart.value.findIndex(
      (item) => item.barcode === product.barcode,
    );
    cart.value.splice(index, 1);
  }

  function clearCart() {
    cart.value = [];
  }

  function updateDiscount(barcode: string, discount: number) {
    const itemInCart = cart.value.find((item) => item.barcode === barcode);
    if (itemInCart) {
      itemInCart.discount = discount;
    }
  }

  watch(
    () => userStore.user,
    () => {
      const storedCart = localStorage.getItem(getCartStorageKey());
      cart.value = storedCart ? JSON.parse(storedCart) : [];
    },
  );

  async function checkout(
    selectedUserId: number,
    paymentMethod: string,
    discount: number,
    status: string,
    cashReceived: number,
    amountToPay: number,
    commission: number,
  ) {
    if (emptyCart.value) {
      $notificationStore.showNotification("El carrito está vacío", "error");
      return;
    }

    try {
      await orderStore.registerOrder(
        selectedUserId,
        userPin.value,
        totalPayable.value,
        status,
        paymentMethod,
        discount,
        cashReceived,
        amountToPay,
        amountToPay,
        commission,
        cart.value,
      );
      $notificationStore.showNotification(
        "Orden registrada con éxito",
        "success",
      );
      clearCart();
    } catch (error) {
      $notificationStore.showNotification(
        "Error al registrar la orden",
        "error",
      );
    }
  }
  return {
    addToCartWithQuantity,
    deleteSailInProcess,
    postSaleInProcess,
    getSaleInProcess,
    storedCart,
    cart,
    emptyCart,
    totalPayable,
    totalQuantity,
    addToCart,
    clearCart,
    decreaseQuantity,
    deleteItem,
    increaseQuantity,
    updateDiscount,
    checkout,
    setDiscountPrice,
  };
});
