import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { findBrands, findOffers } from './api';

export const fetchBrands = createAsyncThunk('search/fetchBrands', (number) => findBrands(number));

export const fetchOffers = createAsyncThunk('search/fetchOffers', ({ number, brand }) =>
  findOffers(number, brand)
);


const empty = { status: 'idle', error: null, items: [] };

const searchSlice = createSlice({
  name: 'search',
  initialState: { brands: empty, offers: empty, selectedId: null },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrands.pending, (state) => {
        state.brands = { status: 'loading', error: null, items: [] };
        state.offers = empty;
        state.selectedId = null;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.brands = { status: 'done', error: null, items: action.payload };
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        state.brands = { status: 'error', error: action.error.message, items: [] };
      })
      .addCase(fetchOffers.pending, (state, action) => {
        state.selectedId = action.meta.arg.goodsID;
        state.offers = { status: 'loading', error: null, items: [] };
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
        state.offers = { status: 'done', error: null, items: action.payload };
      })
      .addCase(fetchOffers.rejected, (state, action) => {
        state.offers = { status: 'error', error: action.error.message, items: [] };
      });
  },
});

export default searchSlice.reducer;
