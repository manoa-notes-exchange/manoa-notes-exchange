'use client'

import { Button, Card, Col, Container, Form, InputGroup, Row } from 'react-bootstrap';
import { CloudArrowUp, Search, Star } from 'react-bootstrap-icons';

/** The Home page. */
const Home = () => (
  <main className="landing-page">
    <section className="landing-hero">
      <Container>
        <Row className="align-items-center gy-4">
          <Col lg={7} className="landing-hero-copy">
            <h1>Study materials for your UH Mānoa courses, shared by students</h1>
            <p>
              Notes, study guides and practice problems sorted by course, semester and instructor.
              Free to read. Sign in to upload, rate, and save.
            </p>
            <div className="d-flex flex-wrap gap-2">
              <Button variant="light" href="/auth/signin">Sign in</Button>
              <Button variant="outline-light" href="/auth/signup">Sign up</Button>
            </div>
          </Col>

          <Col lg={5}>
            <Card className="landing-search-card border-0 shadow-sm">
              <Card.Header className="bg-white border-0 pb-0 fw-semibold">
                Find your course
              </Card.Header>
              <Card.Body>
                <Form.Label htmlFor="course-search" className="small mb-1">
                  Department and number
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    id="course-search"
                    type="search"
                    placeholder="e.g. ICS 314"
                    aria-label="Search by department and course number"
                  />
                  <Button className="landing-search-button">
                    <Search aria-hidden="true" /> Search
                  </Button>
                </InputGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>

    <section className="landing-how-it-works">
      <Container>
        <h2 className="text-center">How it works</h2>
        <Row className="text-center gy-4">
          <Col md={4}>
            <Search size={36} className="landing-step-icon" aria-hidden="true" />
            <h3>Find</h3>
            <p>Search by department and number, then filter by semester and instructor.</p>
          </Col>
          <Col md={4}>
            <CloudArrowUp size={36} className="landing-step-icon" aria-hidden="true" />
            <h3>Share</h3>
            <p>Upload your notes and guides so the next class starts ahead.</p>
          </Col>
          <Col md={4}>
            <Star size={36} className="landing-step-icon" aria-hidden="true" />
            <h3>Rate</h3>
            <p>Rate courses and instructors, and see what others thought before you register.</p>
          </Col>
        </Row>
      </Container>
    </section>

    <section className="landing-community">
      <Container>
        <Row className="align-items-center gy-3">
          <Col md={6}>
            <h2>Kept clean by students</h2>
            <p>
              Anyone can report a material that looks like a copied exam, textbook pages or spam.
              Admins review every report before anything is removed.
            </p>
          </Col>
          <Col md={6}>
            <h3>Browse by department</h3>
            <div className="d-flex flex-wrap gap-2">
              {['ICS', 'MATH', 'PHYS', 'CHEM', 'ECON', 'EE'].map((department) => (
                <Button
                  key={department}
                  variant="outline-secondary"
                  size="sm"
                  className="rounded-pill landing-department-button"
                >
                  {department}
                </Button>
              ))}
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  </main>
);

export default Home;
