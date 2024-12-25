import {createSlice} from '@reduxjs/toolkit'

const loaderSlice = createSlice({
    name:'loader',
    initialState:{loader:false},
    reducers:{
        showLoader: (state)=>{
                             state.loader=true;
                            },
        
        hideLoader:(state)=>{
                            state.loader=false
                             }
    }
});

export const {showLoader,hideLoader}=loaderSlice.actions //actions property returns the reducers
export default loaderSlice.reducer;