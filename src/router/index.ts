import { createRouter, createWebHistory } from "vue-router";
import { ROUTE_NAME } from "./names";
import HomeView from "@/views/HomeView.vue";
import PaymentView from "@/views/PaymentView.vue";
import LoginView from "@/views/LoginView.vue";
import OrderHistoryView from "@/views/OrderHistoryView.vue";
import InventoriesView from "@/views/InventoriesView.vue";
import NewProductView from "@/views/NewProductView.vue";
import SaleInProcessView from "@/views/SaleInProcessView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/login",
    },
    {
      path: "/home",
      name: ROUTE_NAME.HOME_VIEW,
      component: HomeView,
    },
    {
      path: "/payment",
      name: ROUTE_NAME.PAYMENT_VIEW,
      component: PaymentView,
    },
    {
      path: "/login",
      name: ROUTE_NAME.LOGIN_VIEW,
      component: LoginView,
    },
    {
      path: "/orders",
      name: ROUTE_NAME.ORDER_HISTORY_VIEW,
      component: OrderHistoryView,
    },
    {
      path: "/inventories",
      name: ROUTE_NAME.INVENTORIES_VIEW,
      component: InventoriesView,
    },
    /*
    {
      path: '/newProduct',
      name: ROUTE_NAME.NEW_PRODUCT_VIEW,
      component: NewProductView
    },
    */
    {
      path: "/saleInProcess",
      name: ROUTE_NAME.SALE_IN_PROCESS_VIEW,
      component: SaleInProcessView,
    },
  ],
});

export default router;
