import { randomDateWithinDays, randomFloat, randomInt, sample } from '../../utils/random';
import type { Address, Order, OrderItem, OrderStatus } from './types';

const firstNames = [
  'Ava',
  'Liam',
  'Noah',
  'Mia',
  'Sophia',
  'Ethan',
  'Lucas',
  'Isla',
  'Zoe',
  'Aria',
  'Levi',
  'Elena'
];

const lastNames = [
  'Walker',
  'Patel',
  'Garcia',
  'Khan',
  'Yamamoto',
  'Santos',
  'Novak',
  'Kim',
  'Nielsen',
  'Okoro',
  'Miller',
  'Silva'
];

const products = [
  'Quartz Watch',
  'Travel Backpack',
  'Noise Cancelling Headphones',
  'Ceramic Mug Set',
  'Wireless Charger',
  'Running Shoes',
  'Canvas Jacket',
  'Portable Speaker',
  'Desk Lamp',
  'Yoga Mat',
  'Sunglasses',
  'Leather Notebook'
];

const cities = [
  'Berlin',
  'Lisbon',
  'Toronto',
  'Singapore',
  'Austin',
  'Oslo',
  'Helsinki',
  'Kyoto',
  'Dublin',
  'Stockholm'
];

const countries = [
  'Germany',
  'Portugal',
  'Canada',
  'Singapore',
  'USA',
  'Norway',
  'Finland',
  'Japan',
  'Ireland',
  'Sweden'
];

const statuses: OrderStatus[] = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
];

const createCustomerName = (): string => {
  return `${sample(firstNames)} ${sample(lastNames)}`;
};

const createAddress = (): Address => {
  const cityIndex = randomInt(0, cities.length - 1);
  return {
    street: `${randomInt(12, 240)} ${sample(lastNames)} Street`,
    city: cities[cityIndex],
    country: countries[cityIndex],
    postalCode: `${randomInt(10000, 99999)}`
  };
};

const createItems = (): OrderItem[] => {
  const count = randomInt(1, 4);
  return Array.from({ length: count }, (_, index) => {
    const quantity = randomInt(1, 3);
    const price = randomFloat(12, 180, 2);
    return {
      id: `item-${Date.now()}-${index}-${randomInt(100, 999)}`,
      productName: sample(products),
      quantity,
      price
    };
  });
};

const calculateTotal = (items: OrderItem[]): number => {
  return Number(
    items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)
  );
};

export const generateMockOrders = (count: number): Order[] => {
  return Array.from({ length: count }, (_, index) => {
    const createdDate = randomDateWithinDays(30);
    const updatedDate = new Date(createdDate.getTime() + randomInt(1, 5) * 60 * 60 * 1000);
    const items = createItems();
    const customerName = createCustomerName();
    return {
      id: `ORD-${String(index + 1).padStart(4, '0')}`,
      customerName,
      customerEmail: `${customerName.toLowerCase().replace(/\s+/g, '.')}@mail.com`,
      status: sample(statuses),
      items,
      totalAmount: calculateTotal(items),
      currency: 'USD',
      createdAt: createdDate.toISOString(),
      updatedAt: updatedDate.toISOString(),
      shippingAddress: createAddress()
    };
  });
};

export const createMockOrder = (nextId: number): Order => {
  const createdDate = new Date();
  const items = createItems();
  const customerName = createCustomerName();
  return {
    id: `ORD-${String(nextId).padStart(4, '0')}`,
    customerName,
    customerEmail: `${customerName.toLowerCase().replace(/\s+/g, '.')}@mail.com`,
    status: 'pending',
    items,
    totalAmount: calculateTotal(items),
    currency: 'USD',
    createdAt: createdDate.toISOString(),
    updatedAt: createdDate.toISOString(),
    shippingAddress: createAddress()
  };
};

export const pickNextStatus = (current: OrderStatus): OrderStatus => {
  const nextMap: Record<OrderStatus, OrderStatus[]> = {
    pending: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: ['delivered'],
    cancelled: ['cancelled']
  };
  return sample(nextMap[current]);
};
