import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Form from 'react-bootstrap/Form';

import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { Store } from '../Store';
import CheckoutSteps from '../components/CheckoutSteps';

export default function ShippingAddress() {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Store);
  //從購物車中獲取運送地址
  const {
    userInfo,
    cart: { shippingAddress },
  } = state;
  //如果shippingAddress是空的，就設定fullName、address、city、postalCode、country都是空字串
  const [fullName, setFullName] = useState(shippingAddress.fullName || '');
  const [address, setAddress] = useState(shippingAddress.address || '');
  const [city, setCity] = useState(shippingAddress.city || '');
  const [postalCode, setPostalCode] = useState(
    shippingAddress.postalCode || ''
  );

  useEffect(() => {
    if (!userInfo) {
      navigate('/signin?redirect=/shipping');
      //   navigate('/signin');
    }
  }, [navigate, userInfo]);

  const [country, setCountry] = useState(shippingAddress.country || '');

  const submitHandler = (e) => {
    e.preventDefault();
    ctxDispatch({
      type: 'SAVE_SHIPPING_ADDRESS',
      payload: {
        fullName,
        address,
        city,
        postalCode,
        country,
      },
    });
    localStorage.setItem(
      'shippingAddress',
      JSON.stringify({
        fullName,
        address,
        city,
        postalCode,
        country,
      })
    );
    navigate('/payment');
  };

  return (
    <div>
      <Helmet>
        <title>Shipping Address</title>
      </Helmet>
      <CheckoutSteps step1 step2></CheckoutSteps>
      <div className="container small-container">
        <h1 className="my-3">Shipping Address</h1>
        <Form onSubmit={submitHandler}>
          <Form.Group className="mb-3" controlId="fullName">
            <Form.Label>全名</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            ></Form.Control>
          </Form.Group>
          {/* //地址 */}
          <Form.Group className="mb-3" controlId="address">
            <Form.Label>地址</Form.Label>
            <Form.Control
              type="text"
              placeholder="輸入地址"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            ></Form.Control>
          </Form.Group>
          {/* //城市 */}
          <Form.Group className="mb-3" controlId="city">
            <Form.Label>城市</Form.Label>
            <Form.Control
              type="text"
              placeholder="輸入城市"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            ></Form.Control>
          </Form.Group>
          {/* 郵遞區號 */}
          <Form.Group className="mb-3" controlId="postalCode">
            <Form.Label>郵遞區號</Form.Label>
            <Form.Control
              type="text"
              placeholder="輸入郵遞區號"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              required
            ></Form.Control>
          </Form.Group>
          {/* //國家 */}
          <Form.Group className="mb-3" controlId="country">
            <Form.Label>國家</Form.Label>
            <Form.Control
              type="text"
              placeholder="輸入國家"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            ></Form.Control>
          </Form.Group>
          <div className="mb-3">
            <Button variant="primary" type="submit">
              下一步
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
