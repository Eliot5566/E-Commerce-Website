// import { Alert } from 'bootstrap';

// export default function MessageBox(props) {
//   return <Alert variant={props.variant || 'info'}>{props.children}</Alert>;
// }

import React from 'react';
import { Alert } from 'react-bootstrap';

const MyComponent = (props) => {
  return (
    <div>
      <Alert variant={props.variant || 'info'}>{props.children}</Alert>
    </div>
  );
};

export default MyComponent;
