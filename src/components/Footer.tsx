import Link from 'next/link';
import { Col, Container, Row } from 'react-bootstrap';

const Footer = () => (
  <footer className="mt-auto py-4 bg-dark text-white floral-footer">
    <Container>
      <Row className="g-4">
        <Col xs={12} md={6} lg={5}>
          <h5>MANOA NOTES EXCHANGE</h5>

          <p className="text-white-50 mb-0">
            Free study materials for UH Mānoa courses, shared by students.
            A student project, not affiliated with the University of Hawaiʻi.
          </p>
        </Col>

        <Col xs={12} md={3} lg={{ span: 3, offset: 1 }}>
          <h5>EXPLORE</h5>

          <div>
            <Link className="footer-link" href="/courses">
              Search Courses
            </Link>
          </div>

          <div>
            <Link className="footer-link" href="/upload">
              Upload Material
            </Link>
          </div>

          <div>
            <Link className="footer-link" href="/privacy">
              Privacy
            </Link>
          </div>
        </Col>

        <Col xs={12} md={3}>
          <h5>PROJECT</h5>

          <div>
            <a
              className="footer-link"
              href="#"
            >
              Project Home Page
            </a>
          </div>

          <div>
            <a
              className="footer-link"
              href="#"
            >
              GitHub Organization
            </a>
          </div>
        </Col>
      </Row>

      <hr className="my-4" />

      <p className="text-center text-white-50 mb-0">
        ICS 314, Fall 2026
      </p>
    </Container>
  </footer>
);

export default Footer;
