import Link from 'next/link';
import { Card, Col, Container, Row } from 'react-bootstrap';

/** Displays a page when the user does not have permission to access a route. */
const NotAuthorized = () => (
  <Container className="py-5 flex-grow-1">
    <Row className="justify-content-center">
      <Col xs={12} md={8} lg={6}>
        <Card>
          <Card.Body className="text-center">
            <h1 className="mb-3">
              Not authorized
            </h1>

            <p className="text-secondary mb-4">
              You do not have permission to view this page.
            </p>

            <Link
              className="btn btn-success"
              href="/home"
            >
              Return to My Home
            </Link>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
);

export default NotAuthorized;
