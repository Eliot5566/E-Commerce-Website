// import { Alert } from 'bootstrap';

// export default function MessageBox(props) {
//   return <Alert variant={props.variant || 'info'}>{props.children}</Alert>;
// }

import React from 'react';
import { Alert } from 'react-bootstrap';

const MyComponent = () => {
  return (
    <div>
      <Alert variant="danger">
        This is an error alert — check it out!
      </Alert>
    </div>
  );
};

export default MyComponent;
