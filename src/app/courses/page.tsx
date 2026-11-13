'use client';

import {
  Badge,
  Breadcrumb,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
} from 'react-bootstrap';
import { Bookmark, Flag, Star } from 'react-bootstrap-icons';

const resources = [
  {
    id: 1,
    title: 'Midterm 1 review: JavaScript and ESLint',
    semester: 'Fall 2026',
    instructor: 'Instructor A',
    uploader: 'student123',
    type: 'Study guide',
    rating: '★★★★★',
  },
  {
    id: 2,
    title: 'Lecture notes: Next.js server actions and Prisma',
    semester: 'Fall 2026',
    instructor: 'Instructor B',
    uploader: 'student456',
    type: 'Notes',
    rating: '★★★★☆',
  },
  {
    id: 3,
    title: 'Git branching and pull request steps',
    semester: 'Spring 2026',
    instructor: 'Instructor A',
    uploader: 'student789',
    type: 'Practice problems',
    rating: '★★★★☆',
  },
];

const CoursePage = () => (
  <Container className="course-page py-4">
    <Breadcrumb>
      <Breadcrumb.Item href="/courses">
        Search Courses
      </Breadcrumb.Item>

      <Breadcrumb.Item active>
        ICS 314
      </Breadcrumb.Item>
    </Breadcrumb>

    <Row className="g-4">
      <Col lg={8}>
        <h1 className="course-title">
          ICS 314: Software Engineering I
        </h1>

        <div className="mb-4">
          <span className="star-rating">★★★★☆</span>
          <span className="text-secondary ms-2">
            course rating from [N] students
          </span>
        </div>

        <Row className="g-2 mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Instructor</Form.Label>
              <Form.Select>
                <option>All instructors</option>
                <option>Instructor A</option>
                <option>Instructor B</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group>
              <Form.Label>Type</Form.Label>
              <Form.Select>
                <option>All types</option>
                <option>Study guide</option>
                <option>Notes</option>
                <option>Practice problems</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group>
              <Form.Label>Semester</Form.Label>
              <Form.Select>
                <option>All semesters</option>
                <option>Fall 2026</option>
                <option>Spring 2026</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {resources.map((resource) => (
          <Card className="resource-card mb-3" key={resource.id}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <Card.Title className="resource-title">
                    {resource.title}
                  </Card.Title>

                  <Card.Text className="text-secondary">
                    {resource.semester}
                    {' · '}
                    {resource.instructor}
                    {' · '}
                    uploaded by {resource.uploader}
                  </Card.Text>
                </div>

                <Badge className="resource-badge">
                  {resource.type}
                </Badge>
              </div>

              <div className="d-flex align-items-center flex-wrap gap-2 mt-3">
                <span className="star-rating me-2">
                  {resource.rating}
                </span>

                <Button className="resource-button" variant="outline-success">
                  <Bookmark className="me-1" />
                  Bookmark
                </Button>

                <Button className="resource-button" variant="outline-success">
                  <Star className="me-1" />
                  Rate
                </Button>

                <Button className="report-button ms-auto" variant="link">
                  <Flag className="me-1" />
                  Report
                </Button>
              </div>
            </Card.Body>
          </Card>
        ))}
      </Col>

      <Col lg={4}>
        <Card className="sidebar-card mb-3">
          <Card.Header>
            <strong>Instructors</strong>
          </Card.Header>

          <Card.Body className="p-0">
            <div className="sidebar-row">
              <span>Instructor A</span>
              <span className="star-rating">★★★★★</span>
            </div>

            <div className="sidebar-row">
              <span>Instructor B</span>
              <span className="star-rating">★★★★☆</span>
            </div>
          </Card.Body>
        </Card>

        <Card className="sidebar-card mb-3">
          <Card.Header>
            <strong>Offered in</strong>
          </Card.Header>

          <Card.Body className="p-0">
            <div className="sidebar-row justify-content-start">
              Fall 2026
              <span className="text-secondary ms-1">
                (Instructor A, Instructor B)
              </span>
            </div>

            <div className="sidebar-row justify-content-start">
              Spring 2027
              <span className="text-secondary ms-1">
                (Instructor B)
              </span>
            </div>
          </Card.Body>
        </Card>

        <Card className="sidebar-card">
          <Card.Header>
            <strong>Rate this course</strong>
          </Card.Header>

          <Card.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Your rating</Form.Label>

                <Form.Select defaultValue="5">
                  <option value="5">5 stars</option>
                  <option value="4">4 stars</option>
                  <option value="3">3 stars</option>
                  <option value="2">2 stars</option>
                  <option value="1">1 star</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Instructor (optional)</Form.Label>

                <Form.Select>
                  <option>Instructor A</option>
                  <option>Instructor B</option>
                </Form.Select>
              </Form.Group>

              <Button className="manoa-button" type="submit">
                Submit rating
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
);

export default CoursePage;