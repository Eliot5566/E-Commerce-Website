// import React from 'react';
// import CheckoutSteps from '../components/CheckoutSteps';
// import { Helmet } from 'react-helmet-async';
// import { Form } from 'react-router-dom';
// import { useState } from 'react';
// import { Button } from 'react-bootstrap';
// import { useContext } from 'react';
// import { Store } from '../Store';
// import { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';

// export default function PaymentMethod() {
//   const navigate = useNavigate();
//   const { state, dispatch: ctxDispatch } = useContext(Store);

//   const {
//     cart: { shippingAddress, paymentMethod },
//   } = state;

//   const [paymentMethodName, setPaymentMethod] = useState(
//     paymentMethod || 'PayPal'
//   );

//   const [stripeMethodName, setStripeMethod] = useState(
//     paymentMethod || 'Stripe'
//   );

//   //定義submitHandler函式 用來處理表單提交
//   const submitHandler = (e) => {
//     e.preventDefault();
//     ctxDispatch({ type: 'SAVE_PAYMENT_METHOD', payload: paymentMethodName });
//     localStorage.setItem('paymentMethod', paymentMethodName);
//     navigate('/placeorder');
//   };

//   useEffect(() => {
//     if (!shippingAddress.address) {
//       navigate('/shipping');
//     }
//   }, [shippingAddress, navigate]);

//   return (
//     <div>
//       <CheckoutSteps step1 step2 step3></CheckoutSteps>
//       <div className="container small-container">
//         <Helmet>
//           <title>付款方式</title>
//         </Helmet>
//         <h1 className="my-3">付款方式</h1>
//         <Form onSubmit={submitHandler}>
//           <div className="mb-3">
//             <Form.Check
//               type="radio"
//               id="PayPal"
//               label="PayPal"
//               name="paymentMethod"
//               value="PayPal"
//               checked={paymentMethodName === 'PayPal'}
//               onChange={(e) => setPaymentMethod(e.target.value)}
//             ></Form.Check>
//           </div>

//           <div className="mb-3">
//             <Form.Check
//               type="radio"
//               id="Stripe"
//               label="Stripe"
//               name="stripeMethod"
//               value="Stripe"
//               checked={stripeMethodName === 'Stripe'}
//               onChange={(e) => setStripeMethod(e.target.value)}
//             ></Form.Check>
//           </div>
//           <Button type="submit">下一步</Button>
//         </Form>
//       </div>
//     </div>
//   );
// }
import React, { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import CheckoutSteps from '../components/CheckoutSteps';
import { Store } from '../Store';

export default function PaymentMethod() {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { shippingAddress, paymentMethod },
  } = state;

  const [paymentMethodName, setPaymentMethod] = useState(
    paymentMethod || 'PayPal'
  );

  useEffect(() => {
    if (!shippingAddress.address) {
      navigate('/shipping');
    }
  }, [shippingAddress, navigate]);
  const submitHandler = (e) => {
    e.preventDefault();
    ctxDispatch({ type: 'SAVE_PAYMENT_METHOD', payload: paymentMethodName });
    localStorage.setItem('paymentMethod', paymentMethodName);
    navigate('/placeorder');
  };
  return (
    <div>
      <CheckoutSteps step1 step2 step3></CheckoutSteps>
      <div className="container small-container">
        <Helmet>
          <title>Payment Method</title>
        </Helmet>
        <h1 className="my-3">Payment Method</h1>
        <Form onSubmit={submitHandler}>
          <div className="mb-3">
            <Form.Check
              type="radio"
              id="PayPal"
              label="PayPal"
              value="PayPal"
              checked={paymentMethodName === 'PayPal'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <Form.Check
              type="radio"
              id="Stripe"
              label="Stripe"
              value="Stripe"
              checked={paymentMethodName === 'Stripe'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <Button type="submit">Continue</Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
