import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./UserSlice";
import itemsReducer from "./itemsSlice";

const appStore = configureStore({
    reducer: {
        user: userReducer,
        items: itemsReducer,
    }
})
export default appStore;