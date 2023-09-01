import { useEffect, useReducer } from 'react';
// import { Link } from 'react-router-dom';
import axios from 'axios';
import logger from '../logger.js';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Product from '../components/Product.js';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox.js';
import MessageBox from '../components/MessageBox.js';

//根據action.type來決定要做什麼事情
const reducer = (state, action) => {
  switch (action.type) {
    //如果是FETCH_REQUEST，就回傳一個新的state，並且把loading設為true
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    //如果是FETCH_SUCCESS，就回傳一個新的state，並且把loading設為false，並且把products設為action.payload
    case 'FETCH_SUCCESS':
      //action.payload是從後端傳來的資料
      return { ...state, products: action.payload, loading: false };
    //如果是FETCH_FAIL，就回傳一個新的state，並且把loading設為false，並且把error設為action.payload
    case 'FETCH_FAIL':
      //action.payload是從後端傳來的錯誤訊息
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

//useReducer是一個可以取代useState的hook
//useReducer 負責管理 state，並且可以透過 dispatch 來發送 action
//useReducer 接收兩個參數，第一個參數是 reducer，第二個參數是初始 state

//useEffect 負責處理非同步的邏輯，例如：發送 API 請求、訂閱事件、設置 timeout 等等
//useEffect 接收兩個參數，第一個參數是 callback function，第二個參數是 dependency array
//如果第二個參數是空陣列，就只會在元件第一次 render 時執行
//如果第二個參數是有值的陣列，就會在元件第一次 render 時執行，以及陣列中的值有改變時執行

//以上兩個hook的組合，可以用來取得資料，並且把資料放到state中
//這裡使用useReducer來取代useState，因為useReducer可以讓我們更好的管理state

function HomeScreen() {
  const [{ loading, error, products }, dispatch] = useReducer(logger(reducer), {
    products: [],
    loading: true,
    error: '',
  });
  //   const [products, setProducts] = useState([]);

  //使用useEffect來取得資料
  useEffect(() => {
    //定義一個async function，並且使用axios來取得資料
    const fetchData = async () => {
      //使用try catch來處理錯誤
      //dispatch是用來發送action的，這裡發送的是FETCH_REQUEST
      //dispatch({ type: 'FETCH_REQUEST' })，這裡的type是自己定義的，可以是任何字串
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        //使用axios來取得資料
        const result = await axios.get('/api/products');
        //如果成功，就發送FETCH_SUCCESS，並且把從後端取得的資料放到action.payload
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
        //如果失敗，就發送FETCH_FAIL，並且把錯誤訊息放到action.payload
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: err.message });
      }

      //   setProducts(result.data);
    };
    fetchData();
  }, []);
  return (
    <div>
      <Helmet>
        <title>拾月菓</title>
      </Helmet>
      <h1>Featured Products</h1>
      <div className="products">
        {loading ? (
          <LoadingBox />
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <Row>
            {products.map((product) => (
              <Col key={product.slug} sm={6} md={4} lg={3} className="mb-3">
                <Product product={product}> </Product>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
}

export default HomeScreen;
