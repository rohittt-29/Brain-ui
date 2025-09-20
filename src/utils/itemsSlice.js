import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from './axios'

const getErrorMessage = (err) => {
  if (err?.isAuthMissing) return 'Please login to continue'
  const msg = err?.response?.data?.message || err?.message || 'Request failed'
  return msg
}

export const fetchItems = createAsyncThunk('items/fetchItems', async (_, thunkAPI) => {
  try {
    const res = await api.get('/items')
    return res.data
  } catch (err) {
    return thunkAPI.rejectWithValue(getErrorMessage(err))
  }
})

export const createItem = createAsyncThunk('items/createItem', async (payload, thunkAPI) => {
  try {
    const res = await api.post('/items', payload)
    return res.data
  } catch (err) {
    return thunkAPI.rejectWithValue(getErrorMessage(err))
  }
})

export const updateItem = createAsyncThunk('items/updateItem', async ({ id, data }, thunkAPI) => {
  try {
    const res = await api.put(`/items/${id}`, data)
    return res.data
  } catch (err) {
    return thunkAPI.rejectWithValue(getErrorMessage(err))
  }
})

export const deleteItem = createAsyncThunk('items/deleteItem', async (id, thunkAPI) => {
  try {
    await api.delete(`/items/${id}`)
    return id
  } catch (err) {
    return thunkAPI.rejectWithValue(getErrorMessage(err))
  }
})

const itemsSlice = createSlice({
  name: 'items',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchItems.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.loading = false
        // Ensure we always have an array
        const payload = action.payload
        if (Array.isArray(payload)) {
          state.list = payload
        } else if (payload && Array.isArray(payload.data)) {
          state.list = payload.data
        } else {
          state.list = []
        }
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to fetch items'
      })

      .addCase(createItem.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createItem.fulfilled, (state, action) => {
        state.loading = false
        state.list.unshift(action.payload)
      })
      .addCase(createItem.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to create item'
      })

      .addCase(updateItem.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateItem.fulfilled, (state, action) => {
        state.loading = false
        const idx = state.list.findIndex((i) => i._id === action.payload._id)
        if (idx !== -1) state.list[idx] = action.payload
      })
      .addCase(updateItem.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to update item'
      })

      .addCase(deleteItem.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteItem.fulfilled, (state, action) => {
        state.loading = false
        state.list = state.list.filter((i) => i._id !== action.payload)
      })
      .addCase(deleteItem.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to delete item'
      })
  },
})

export default itemsSlice.reducer


