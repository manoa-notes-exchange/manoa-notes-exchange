'use client';

// #32: the course page's layout, kept from the M1 sample page.
// The page (src/app/courses/[id]/page.tsx) reads the database on the server
// and hands this component plain data, the same way Search hands data to CourseCard.
// Filters, Rate and Report stay as they are for now; they get wired up in M3.

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
import { Flag, Star } from 'react-bootstrap-icons';
import BookmarkButton from '@/components/BookmarkButton';

export type CourseDetailMaterial = {
  id: number;
  title: string;
  type: string;
  link: string;
  description: string;
  outdatedNote: string | null;
  semester: string;
  instructor: string;
  host: string;
  bookmarked: boolean;
};

type CourseDetailProps = {
  courseCode: string;
  courseName: string;
  rating: number;
  materials: CourseDetailMaterial[];
  instructors: string[];
  types: string[];
  offeredIn: { semester: string; instructors: string[] }[];
};

const CourseDetail = ({
  courseCode,
  courseName,
  rating,
  materials,
  instructors,
  types,
  offeredIn,
}: CourseDetailProps) => {
  const stars = Math.max(0, Math.min(5, Math.round(rating)));

  return (
    <Container className="course-page py-4">
      <Breadcrumb>
        <Breadcrumb.Item href="/search">Search Courses</Breadcrumb.Item>
        <Breadcrumb.Item active>{courseCode}</Breadcrumb.Item>
      </Breadcrumb>

      <Row className="g-4">
        <Col lg={8}>
          <h1 className="course-title">
            {courseCode}
            {': '}
            {courseName}
          </h1>

          <div className="mb-4">
            <span className="star-rating">
              {'★'.repeat(stars)}
              {'☆'.repeat(5 - stars)}
            </span>
            <span className="text-secondary ms-2">course rating</span>
          </div>

          {/* Filters show real choices; making them filter comes in M3 (#33). */}
          <Row className="g-2 mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Instructor</Form.Label>
                <Form.Select>
                  <option>All instructors</option>
                  {instructors.map((name) => <option key={name}>{name}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Type</Form.Label>
                <Form.Select>
                  <option>All types</option>
                  {types.map((type) => <option key={type}>{type}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Semester</Form.Label>
                <Form.Select>
                  <option>All semesters</option>
                  {offeredIn.map((row) => <option key={row.semester}>{row.semester}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {materials.length === 0 ? (
            <Card className="resource-card mb-3">
              <Card.Body>
                <Card.Text>
                  No materials yet for
                  {' '}
                  {courseCode}
                  . Be the first to share one.
                </Card.Text>
                <Button className="manoa-button" href="/upload">Upload a material</Button>
              </Card.Body>
            </Card>
          ) : materials.map((material) => (
            <Card className="resource-card mb-3" data-testid="material-card" key={material.id}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <Card.Title className="resource-title">
                      {/* Opens in a new tab and passes nothing back to our page (#26 safety). */}
                      <a href={material.link} target="_blank" rel="noopener noreferrer nofollow">
                        {material.title}
                      </a>
                    </Card.Title>
                    <Card.Text className="text-secondary mb-1">
                      {material.semester}
                      {' · '}
                      {material.instructor}
                      {material.host && ` · ${material.host}`}
                    </Card.Text>
                    {material.description && (
                      <Card.Text className="mb-1">{material.description}</Card.Text>
                    )}
                    {/* Set by an instructor or admin (#35). */}
                    {material.outdatedNote && (
                      <Card.Text className="small text-warning-emphasis mb-0">
                        Marked outdated:
                        {' '}
                        {material.outdatedNote}
                      </Card.Text>
                    )}
                  </div>
                  <Badge className="resource-badge">{material.type}</Badge>
                </div>

                <div className="d-flex align-items-center flex-wrap gap-2 mt-3">
                  {/* Real material id, so bookmarks land on My Home (#36). */}
                  <BookmarkButton
                    materialId={material.id}
                    initialBookmarked={material.bookmarked}
                  />
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
              {instructors.length === 0 ? (
                <div className="sidebar-row text-secondary">No instructors listed yet</div>
              ) : instructors.map((name) => (
                <div className="sidebar-row" key={name}>
                  <span>{name}</span>
                </div>
              ))}
            </Card.Body>
          </Card>

          <Card className="sidebar-card mb-3">
            <Card.Header>
              <strong>Offered in</strong>
            </Card.Header>
            <Card.Body className="p-0">
              {offeredIn.map((row) => (
                <div className="sidebar-row justify-content-start" key={row.semester}>
                  {row.semester}
                  <span className="text-secondary ms-1">
                    (
                    {row.instructors.join(', ')}
                    )
                  </span>
                </div>
              ))}
            </Card.Body>
          </Card>

          {/* Saving ratings comes in M3. */}
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
                    {instructors.map((name) => <option key={name}>{name}</option>)}
                  </Form.Select>
                </Form.Group>
                <Button className="manoa-button" type="submit">Submit rating</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CourseDetail;
