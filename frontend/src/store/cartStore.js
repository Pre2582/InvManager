import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  items: [],
  isOpen: false,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

  addToCart: (product, qty = 1) => {
    const { items } = get();
    const existing = items.find((i) => i.product_id === product.id);

    if (existing) {
      const newQty = existing.quantity + qty;
      if (newQty > product.quantity) return false;
      set({
        items: items.map((i) =>
          i.product_id === product.id ? { ...i, quantity: newQty } : i
        ),
      });
    } else {
      if (qty > product.quantity) return false;
      set({
        items: [
          ...items,
          {
            product_id: product.id,
            name: product.name,
            sku: product.sku,
            price: Number(product.price),
            quantity: qty,
            image_url: product.image_url || null,
            max_stock: product.quantity,
          },
        ],
      });
    }
    return true;
  },

  removeFromCart: (product_id) =>
    set({ items: get().items.filter((i) => i.product_id !== product_id) }),

  updateQuantity: (product_id, qty) => {
    const items = get().items;
    const item = items.find((i) => i.product_id === product_id);
    if (!item) return;
    if (qty <= 0) {
      set({ items: items.filter((i) => i.product_id !== product_id) });
    } else if (qty <= item.max_stock) {
      set({
        items: items.map((i) =>
          i.product_id === product_id ? { ...i, quantity: qty } : i
        ),
      });
    }
  },

  // Called after an order is placed or products are refreshed to keep stock limits in sync
  syncStockLimits: (products) => {
    const items = get().items;
    const updated = items
      .map((item) => {
        const product = products.find((p) => p.id === item.product_id);
        if (!product) return item;
        return {
          ...item,
          max_stock: product.quantity,
          quantity: Math.min(item.quantity, product.quantity),
        };
      })
      .filter((item) => item.quantity > 0);
    set({ items: updated });
  },

  clearCart: () => set({ items: [] }),
}));

export default useCartStore;
