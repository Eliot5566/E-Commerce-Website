import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { useState } from 'react';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, order: action.payload, error: '' };

    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
}
export default function OrderScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;

  //params是從url傳過來的值 這裡的params是一個物件
  const params = useParams();
  const { id: orderId } = params;
  console.log(orderId);
  const navigate = useNavigate();
  //
  const [isLoading, setIsLoading] = useState(true); // 新增 isLoading 状态

  const [{ loading, error, order }, dispatch] = useReducer(reducer, {
    loading: true,
    order: {},
    error: '',
  });

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/orders/${orderId}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        data.order_items = JSON.parse(data.order_items);
        data.shipping_address = JSON.parse(data.shipping_address);
        console.log(data.shipping_address);

        data.orderItems = data.order_items.map((item) => {
          return {
            _id: item._id,
            name: item.name,
            slug: item.slug,
            category: item.category,
            image: item.image,
            price: item.price,
            countInStock: item.countInStock,
            numReviews: item.numReviews,
            rating: item.rating,
            description: item.description,
            quantity: item.quantity,
          };
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
        setIsLoading(false); // 在数据加载完成后设置 isLoading 为 false
        console.log(data);
        // console.log(order);
        //為甚麼這裡的order是空的 但是在上面的dispatch裡面的data是有值的 但是在這裡的order就是空的 這是為什麼
        //因為這裡的order是一開始的order 一開始的order是空的 所以這裡的order就是空的
        //payload: data 這裡的data是從後端傳過來的data 這裡的data是有值的
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: err.message });
        setIsLoading(false); // 在数据加载失败后设置 isLoading 为 false
      }
    };

    if (!userInfo) {
      navigate('/login');
    }
    if (!order._id || (order._id && order._id !== orderId)) {
      fetchOrder();
    }
  }, [orderId, userInfo, navigate, isLoading]);
  return loading ? (
    <LoadingBox></LoadingBox>
  ) : error ? (
    <MessageBox variant="danger">{error}</MessageBox>
  ) : (
    <div>
      <Helmet>
        <title>訂單 {orderId}</title>
      </Helmet>
      <h1 className="my-3">訂單編號 {orderId}</h1>
      <Row>
        <Col md={8}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>運送資訊</Card.Title>

              <Card.Text>
                {order.shipping_address && (
                  <div>
                    <strong>姓名:</strong> {order.shipping_address.fullName}{' '}
                    <br />
                    <strong>地址: </strong> {order.shipping_address.address},
                    {order.shipping_address.city},{' '}
                    {order.shipping_address.postalCode},
                    {order.shipping_address.country}
                  </div>
                )}
              </Card.Text>

              {order.isDelivered ? (
                <MessageBox variant="success">
                  Delivered at {order.deliveredAt}
                </MessageBox>
              ) : (
                <MessageBox variant="danger">Not Delivered</MessageBox>
              )}
            </Card.Body>
          </Card>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>付款資訊</Card.Title>
              <Card.Text>
                <strong>付款方式:</strong> {order.payment_method}
              </Card.Text>
              {order.isPaid ? (
                <MessageBox variant="success">
                  Paid at {order.paidAt}
                </MessageBox>
              ) : (
                <span>尚未付款</span>
              )}
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title>購買明細</Card.Title>
              <ListGroup variant="flush">
                {order?.orderItems?.map((item) => (
                  <ListGroup.Item key={item._id}>
                    <Row className="align-items-center">
                      <Col md={6}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="img-fluid rounded img-thumbnail"
                        />{' '}
                        <Link to={`/product/${item.slug}`}>{item.name}</Link>
                      </Col>
                      <Col md={3}>
                        <span>{item.quantity}</span>
                      </Col>
                      <Col md={3}>${item.price}</Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>訂單明細</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>商品</Col>
                    <Col>${parseFloat(order.items_price).toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>運費</Col>
                    <Col>${parseFloat(order.shipping_price).toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong>總價</strong>
                    </Col>
                    <Col>
                      <strong>
                        ${parseFloat(order.total_price).toFixed(2)}
                      </strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
