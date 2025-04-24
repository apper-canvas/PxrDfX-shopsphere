import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  total: 0,
  count: 0,
  loading: false,
  error: null
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartItems: (state, action) => {
      state.items = action.payload;
      state.count = action.payload.length;
      state.total = action.payload.reduce((total, item) => {
        const price = item.price || 0;
        const quantity = item.quantity || 1;
        return total + (price * quantity);
      }, 0);
      state.loading = false;
      state.error = null;
    },
    addItem: (state, action) => {
      const existingIndex = state.items.findIndex(item => 
        item.product_id && item.product_id.Id === action.payload.product_id.Id
      );
      
      if (existingIndex >= 0) {
        // Increase quantity of existing item
        state.items[existingIndex].quantity += action.payload.quantity || 1;
      } else {
        // Add new item
        state.items.push(action.payload);
      }
      
      // Update count and total
      state.count = state.items.length;
      state.total = state.items.reduce((total, item) => {
        const price = item.price || 0;
        const quantity = item.quantity || 1;
        return total + (price * quantity);
      }, 0);
    },
    updateItem: (state, action) => {
      const { id, quantity } = action.payload;
      const itemIndex = state.items.findIndex(item => item.Id === id);
      
      if (itemIndex >= 0) {
        state.items[itemIndex].quantity = quantity;
        
        // Recalculate total
        state.total = state.items.reduce((total, item) => {
          const price = item.price || 0;
          const quantity = item.quantity || 1;
          return total + (price * quantity);
        }, 0);
      }
    },
    removeItem: (state, action) => {
      state.items = state.items.filter(item => item.Id !== action.payload);
      state.count = state.items.length;
      state.total = state.items.reduce((total, item) => {
        const price = item.price || 0;
        const quantity = item.quantity || 1;
        return total + (price * quantity);
      }, 0);
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.count = 0;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    }
  }
});

export const { 
  setCartItems, 
  addItem, 
  updateItem, 
  removeItem, 
  clearCart,
  setLoading,
  setError
} = cartSlice.actions;

export default cartSlice.reducer;