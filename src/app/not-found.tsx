import Link from 'next/link';
import { Card, Col, Container, Row } from 'react-bootstrap';

/** Displays a Not Found page when the requested route does not exist. */
const NotFound = () => (
  <Container className="py-5 flex-grow-1">
    <Row className="justify-content-center">
      <Col xs={12} md={8} lg={6}>
        <Card>
          <Card.Body className="text-center">
            <h1 className="mb-3">
              Page not found
            </h1>

            <p className="text-secondary mb-4">
              The page you requested does not exist or may have been moved.
            </p>

            <Link
              className="btn btn-success"
              href="/search"
            >
              Search courses
            </Link>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
);

export default NotFound;
