import { configureStore } from "@reduxjs/toolkit";
import loaderReducer from './loaderSlice'
import useReducer from './userSlice'
const store = configureStore({
    reducer :{ loaderReducer:loaderReducer,
        userReducer:useReducer,//we can write userReducer
    }
});

export default store;