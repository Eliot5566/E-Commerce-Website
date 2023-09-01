import { createContext, useReducer } from 'react';
export const Store = createContext();

// initialsSte是一個物件，裡面有userInfo和cart兩個屬性
const initialState = {
  // userInfo是一個物件，裡面有name、email、isAdmin、token四個屬性
  userInfo: localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null,

  // cartItems是一個陣列，裡面放的是物件
  cart: {
    shippingAddress: localStorage.getItem('shippingAddress')
      ? JSON.parse(localStorage.getItem('shippingAddress'))
      : {},
    //這段是從CartScreen.js的useEffect裡面來的
    //用來更新Store.js裡的state cart cartItems
    cartItems: localStorage.getItem('cartItems')
      ? JSON.parse(localStorage.getItem('cartItems'))
      : [],
  },
};
// reducer是一個函式，裡面有兩個參數，state和action
function reducer(state, action) {
  // 這裡的action是一個物件，裡面有type和payload兩個屬性
  switch (action.type) {
    case 'CART_ADD_ITEM':
      // add to cart
      // newItem是一個物件，裡面有_id、name、image、price、countInStock、qty六個屬性
      //action.payload來自於CartScreen.js的dispatch({ type: 'CART_ADD_ITEM', payload: { ...product, qty } });
      const newItem = action.payload;
      const existItem = state.cart.cartItems.find(
        (item) => item._id === newItem._id
      );
      const cartItems = existItem
        ? state.cart.cartItems.map((item) =>
            item._id === existItem._id ? newItem : item
          )
        : [...state.cart.cartItems, newItem];
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      return { ...state, cart: { ...state.cart, cartItems } };
    case 'CART_REMOVE_ITEM': {
      const cartItems = state.cart.cartItems.filter(
        (item) => item._id !== action.payload._id
      );
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      return { ...state, cart: { ...state.cart, cartItems } };
    }
    case 'USER_SIGNIN':
      return { ...state, userInfo: action.payload };
    case 'USER_SIGNOUT':
      return {
        ...state,
        userInfo: null,
        cart: { cartItems: [], shippingAddress: {} },
      };
    case 'SAVE_SHIPPING_ADDRESS':
      return {
        ...state,
        cart: {
          ...state.cart,
          shippingAddress: action.payload,
        },
      };
    default:
      return state;
  }
}
export function StoreProvider(props) {
  //使用 useReducer 鉤子來管理應用程式的狀態。它需要兩個參數，第一個是 reducer 函式（在先前的程式碼中定義），
  //第二個是初始狀態（在先前的程式碼中定義）
  //state 是目前的狀態，而 dispatch 是一個函式，用於派發動作來更新狀態。
  //useReducer 鉤子，將初始狀態 initialState 和 reducer 函式結合起來。
  //useReducer 接受這兩個參數並返回一個陣列，其中的第一個元素是當前的狀態 state，
  //而第二個元素是一個 dispatch 函式。dispatch 函式用於派發動作，以便更新狀態。
  const [state, dispatch] = useReducer(reducer, initialState);

  //將 state 和 dispatch 打包成一個物件，使得這些值能夠被傳遞到 Store.Provider 中，供其子組件使用
  const value = { state, dispatch };

  //回傳一個 Store.Provider 元件，通過 value 屬性傳遞了上面創建的物件值
  //props.children 是指 StoreProvider 的子組件，也就是被包裹在 StoreProvider 中的其他組件。
  //這樣，這些子組件就可以透過 useContext(Store) 來訪問 state 和 dispatch。
  return <Store.Provider value={value}>{props.children} </Store.Provider>;
}
