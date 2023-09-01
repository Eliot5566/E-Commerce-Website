import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useReducer, useContext } from 'react';
import axios from 'axios';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import Rating from '../components/Rating';
import Badge from 'react-bootstrap/Badge';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
import './ProductScreen.css';
import { Store } from '../Store';

const reducer = (state, action) => {
  switch (action.type) {
    //如果是FETCH_REQUEST，就回傳一個新的state，並且把loading設為true
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    //如果是FETCH_SUCCESS，就回傳一個新的state，並且把loading設為false，並且把products設為action.payload
    case 'FETCH_SUCCESS':
      //action.payload是從後端傳來的資料
      return { ...state, product: action.payload, loading: false };
    //如果是FETCH_FAIL，就回傳一個新的state，並且把loading設為false，並且把error設為action.payload
    case 'FETCH_FAIL':
      //action.payload是從後端傳來的錯誤訊息
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

function ProductScreen() {
  const navigate = useNavigate();
  const params = useParams();
  const { slug } = params;
  const [{ loading, error, product }, dispatch] = useReducer(reducer, {
    product: [],
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
        const result = await axios.get(`/api/products/slug/${slug}`);
        //如果成功，就發送FETCH_SUCCESS，並且把從後端取得的資料放到action.payload
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
        //如果失敗，就發送FETCH_FAIL，並且把錯誤訊息放到action.payload
      } catch (err) {
        // err.message是從後端傳來的錯誤訊息 這裡的type是自己定義的，可以是任何字串
        dispatch({ type: 'FETCH_FAIL', payload: err.message });
      }

      //   setProducts(result.data);
    };
    fetchData();
  }, [slug]);
  //使用 useContext 來取得購物車的資料 從Store.js中取得state和dispatch
  //state是一個物件，裡面有userInfo和cart兩個屬性 cart是一個物件，裡面有cartItems這個屬性 cartItems是一個陣列，裡面放的是物件 
  const { state, dispatch: ctxDispatch } = useContext(Store);
  //把購物車的資料從state中取出來
  const { cart } = state;
  const addToCartHandler = async () => {
    // 判斷是否已經存在於購物車
    const existItem = cart.cartItems.find((x) => x._id === product._id);
    // 如果已經存在於購物車，就把數量加1
    // 如果不存在於購物車，就把產品加到購物車中
    const quantity = existItem ? existItem.quantity + 1 : 1;
    // 使用axios來取得資料
    const { data } = await axios.get(`/api/products/${product._id}`);
    // 如果庫存不足，就顯示訊息 很抱歉,庫存不足
    if (data.countInStock < quantity) {
      window.alert('很抱歉,庫存不足');
      return;
    }
    // 把產品加到購物車中 這裡的type是自己定義的，可以是任何字串 這裡的payload是一個物件，裡面有_id、name、image、price、countInStock、qty六個屬性
    // 這裡的...product是一個物件，裡面有_id、name、image、price、countInStock五個屬性 這裡的quantity是一個數字 
    ctxDispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } });
    navigate('/cart');
  };

  return (
    <div>
      <div>
        <Row>
          <Col md={6}>
            <img
              className="img-large"
              src={product.image}
              alt={product.name}
            ></img>
          </Col>
          <Col md={3}>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <Helmet>
                  <title>{product.name}</title>
                </Helmet>
              </ListGroup.Item>

              <ListGroup.Item>
                <Rating
                  rating={product.rating}
                  numReviews={product.numReviews}
                ></Rating>
              </ListGroup.Item>

              <ListGroup.Item>Price : {product.price}</ListGroup.Item>
              <ListGroup.Item>
                Description:
                <p>{product.description} </p>
              </ListGroup.Item>
            </ListGroup>
          </Col>
          <Col md={3}>
            <Card>
              <Card.Body>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <Row>
                      <Col>Price:</Col>
                      <Col>{product.price}</Col>
                    </Row>
                  </ListGroup.Item>
                  {/* 產品狀態 */}
                  <ListGroup.Item>
                    <Row>
                      <Col>Status:</Col>
                      <Col>
                        {product.countInStock > 0 ? (
                          <Badge bg="success">In Stock</Badge>
                        ) : (
                          <Badge bg="danger">Out of Stock</Badge>
                        )}
                      </Col>
                    </Row>

                    {product.countInStock > 0 && (
                      <ListGroup.Item className="atc">
                        <div className="d-grid atc">
                          <Button onClick={addToCartHandler} variant="primary">
                            Add to Cart
                          </Button>
                        </div>
                      </ListGroup.Item>
                    )}
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default ProductScreen;
