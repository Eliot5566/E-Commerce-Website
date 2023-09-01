import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import './product.css';
import Rating from './Rating';
import axios from 'axios';
import { useContext } from 'react';
import { Store } from '../Store';

function Product(props) {
  const { product } = props;
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;
  const addToCartHandler = async (item) => {
    // 判斷是否已經存在於購物車
    const existItem = cartItems.find((x) => x._id === product._id);
    // 如果已經存在於購物車，就把數量加1
    // 如果不存在於購物車，就把產品加到購物車中
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${item._id}`);
    if (data.countInStock < quantity) {
      window.alert('Sorry. Product is out of stock');
      return;
    }
    ctxDispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...item, quantity },
    });
  };
  return (
    <Card className="product" key={product.slug}>
      <Link to={`/product/${product.slug}`}>
        <img src={product.image} className="card-img-top" alt={product.name} />
      </Link>
      <Card.Body>
        <Link to={`/product/${product.slug}`}>
          <Card.Title className="ct">{product.name}</Card.Title>
        </Link>

        <Rating rating={product.rating} numReviews={product.numReviews} />

        <Card.Text>
          <strong>{product.price}</strong>
        </Card.Text>
        {product.countInStock === 0 ? (
          <Button variant="light" disabled>
            熱銷一空
          </Button>
        ) : (
          <Button onClick={() => addToCartHandler(product)}>
            Add to cart{' '}
          </Button>
        )}
      </Card.Body>
    </Card>
  );
}

export default Product;
