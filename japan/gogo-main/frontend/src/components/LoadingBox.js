import Spinner from 'react-bootstrap/Spinner';

export default function LoadingBox() {
  return (
    <Spinner animation="border" role="statux">
      <span className="virually-hidden">Loading... </span>
    </Spinner>
  );
}
