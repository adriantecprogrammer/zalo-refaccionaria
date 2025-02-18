export interface Product {
  barcode: string;
  brand: string;
  cost: number;
  id: number;
  image: string;
  internalReference: string; // Ningun dato tiene este campo
  name: string;
  salePrice: number;
  stockQuantity: number;
  storehouseId: number;
}

export interface OrderDetail{
  id:          number;
  orderId:     number;
  productId:   number;
  productName: string;
  quantity:    number;
  unitPrice:   number;
  discount:    number;
}


export interface CartItem extends Product {
  quantity: number;
  discount: number;
}

export interface SailInProcess { 
  id:number
  createdAt:Date
  cartInfo: CartInfo;
}

export interface CartInfo {
  
  string:    string;
  json:      string;
  pass:      number;
}


export enum PaymentMethodId {
  Cash = "cash",
  Card = "card",
  Transfer = "transfer",
  CashCard = "cash_card",
  CashTransfer = "cash_transfer",
}

export interface PaymentMethod {
  id: PaymentMethodId;
  name: string;
}

export interface PaymentAmount {
  method: PaymentMethodId;
  amount: number;
}

export type LabelForPaymentMethod = {
  [K in PaymentMethodId]: string;
};

export interface LogPayment {
  cart: CartItem[];
  totalPayable: number;
  paymentMethods: PaymentAmount[];
  log: {
    date: Date;
  };
}

export interface User {
  id: number;
  name: string;
  email: string;
  pin:string
}

export interface NewOrder {
  userId: number;
  userPin: string;
  total: number;
  status: string;
  paymentMethod: string;
  discount: number;
  cashReceived: number;
  physicalAmount:number;
  electronicAmount:number;
  commission: number;
  products: { id: number, name:string, quantity: number, discount: number }[];
  shiftId: number | null;
}

export interface Order extends NewOrder {
  id: number;
  date: string;
}

export interface Warehouse {
  id: number;
  name: string;
  location: string;
}

export interface IShift {
  id: number;
  cashierId: number;
  start: string;
  end?: string | null;
  initialCash: number;
  finalCash?: number | null;
  totalSales?: number | null;
  status: string;
  closedAt?: string | null;
  note?: string | null;
}

export interface IOrderShift {
  numberOfSalesInShift: number;
  shiftId: number;
  totalSalesInShift: number;
  totalPhysicalAmount:number,
  totalElectronicAmount:number,
  sales: ISalesOrder[];
}

export interface ISalesOrder {
  paymentMethod: PaymentMethodId;
  totalOrders: number;
  totalByType: number;
}

export interface ITransferHistory {
  createdAt: string;
  fromStorehouseId: number;
  id: number;
  product: string;
  productBarcode: string;
  productStock: number;
  productTursoID: number;
  status: string;
  toStorehouseId: number;
  updatedAt: string;
}


export interface IPromoCodes {
  id:       number;
  code:     string;
  discount: number;
  isActive: number;
}
