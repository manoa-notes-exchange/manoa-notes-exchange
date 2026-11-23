'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Tab,
  Table,
  Tabs,
} from 'react-bootstrap';
import { addOffering } from '@/lib/dbActions';

interface ReportItem {
  id: number;
  material: string;
  course: string;
  reportedBy: string;
  reason: string;
  status: 'Open' | 'Resolved';
}

interface CourseOption {
  id: number;
  courseCode: string;
  courseName: string;
}

interface InstructorOption {
  id: number;
  name: string;
}

interface AdminDashboardProps {
  courses: CourseOption[];
  instructors: InstructorOption[];
}

const NEW_INSTRUCTOR_OPTION = '__new__';

const sampleReports: ReportItem[] = [
  {
    id: 1,
    material: 'Final exam answers',
    course: 'ICS 211',
    reportedBy: 'student456',
    reason: 'Looks like a real exam',
    status: 'Open',
  },
  {
    id: 2,
    material: 'Chapter 3 scan',
    course: 'MATH 307',
    reportedBy: 'student789',
    reason: 'Copied textbook pages',
    status: 'Open',
  },
  {
    id: 3,
    material: 'Git notes',
    course: 'ICS 314',
    reportedBy: 'student321',
    reason: 'Spam or off-topic',
    status: 'Open',
  },
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ courses, instructors }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('reports');
  const [courseId, setCourseId] = useState<string>(
    courses[0] ? String(courses[0].id) : '',
  );
  const [selectedInstructor, setSelectedInstructor] = useState<string>(
    instructors[0] ? String(instructors[0].id) : NEW_INSTRUCTOR_OPTION,
  );
  const [newInstructorName, setNewInstructorName] = useState<string>('');
  const [semester, setSemester] = useState<string>('Spring');
  const [year, setYear] = useState<string>('2027');
  const [feedback, setFeedback] = useState<{
    variant: 'success' | 'danger';
    message: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const isAddingNewInstructor = selectedInstructor === NEW_INSTRUCTOR_OPTION;

  const handleAddOffering = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setSubmitting(true);

    try {
      const result = await addOffering({
        courseId: Number(courseId),
        instructorId: isAddingNewInstructor ? undefined : Number(selectedInstructor),
        newInstructorName: isAddingNewInstructor ? newInstructorName : undefined,
        semester,
        year,
      });

      if (!result.ok) {
        setFeedback({ variant: 'danger', message: result.message });
      } else {
        setFeedback({
          variant: 'success',
          message: `Added offering for ${semester} ${year.trim()}.`,
        });
        setNewInstructorName('');
        router.refresh();
      }
    } catch {
      setFeedback({
        variant: 'danger',
        message: 'Something went wrong while adding the offering.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-4">
      <h1 className="mb-3 fw-semibold">Admin</h1>

      <Tabs
        id="admin-tabs"
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k || 'reports')}
        className="mb-3"
      >
        <Tab
          eventKey="reports"
          title={(
            <span>
              Reports{' '}
              <Badge bg="danger" pill>
                {sampleReports.length}
              </Badge>
            </span>
          )}
        >
          <Table responsive hover className="align-middle mb-2">
            <thead>
              <tr>
                <th>Material</th>
                <th>Course</th>
                <th>Reported by</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sampleReports.map((report) => (
                <tr key={report.id}>
                  <td>
                    <a
                      href={`#report-${report.id}`}
                      className="text-success text-decoration-underline"
                    >
                      {report.material}
                    </a>
                  </td>
                  <td>{report.course}</td>
                  <td>{report.reportedBy}</td>
                  <td>{report.reason}</td>
                  <td>
                    <Badge bg="warning" text="dark" className="px-2 py-1">
                      {report.status}
                    </Badge>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button variant="outline-success" size="sm">
                        Keep
                      </Button>
                      <Button variant="danger" size="sm">
                        Remove
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <p className="text-muted small mb-4">Reported materials, newest first</p>
        </Tab>

        <Tab eventKey="courses" title="Courses and semesters">
          <p className="text-muted py-3">
            Manage existing courses and semester offerings here.
          </p>
        </Tab>

        <Tab eventKey="users" title="Users">
          <p className="text-muted py-3">
            Manage registered users and admin roles here.
          </p>
        </Tab>
      </Tabs>

      <Card className="mt-4 shadow-sm">
        <Card.Header className="bg-light fw-semibold">
          Add a semester offering
        </Card.Header>
        <Card.Body>
          {feedback && (
            <Alert
              variant={feedback.variant}
              dismissible
              onClose={() => setFeedback(null)}
            >
              {feedback.message}
            </Alert>
          )}
          <Form onSubmit={handleAddOffering}>
            <Row className="g-3 align-items-end">
              <Col xs={12} md={3}>
                <Form.Group controlId="offeringCourse">
                  <Form.Label>Course</Form.Label>
                  <Form.Select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.courseCode}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col xs={12} md={3}>
                <Form.Group controlId="offeringInstructor">
                  <Form.Label>Instructor</Form.Label>
                  <Form.Select
                    value={selectedInstructor}
                    onChange={(e) => setSelectedInstructor(e.target.value)}
                  >
                    {instructors.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name}
                      </option>
                    ))}
                    <option value={NEW_INSTRUCTOR_OPTION}>
                      + Add new instructor...
                    </option>
                  </Form.Select>
                </Form.Group>
              </Col>

              {isAddingNewInstructor && (
                <Col xs={12} md={3}>
                  <Form.Group controlId="offeringNewInstructor">
                    <Form.Label>New instructor name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. Cam Moore"
                      value={newInstructorName}
                      onChange={(e) => setNewInstructorName(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
              )}

              <Col xs={12} md={2}>
                <Form.Group controlId="offeringSemester">
                  <Form.Label>Semester</Form.Label>
                  <Form.Select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                  >
                    <option value="Spring">Spring</option>
                    <option value="Fall">Fall</option>
                    <option value="Summer">Summer</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col xs={12} md={2}>
                <Form.Group controlId="offeringYear">
                  <Form.Label>Year</Form.Label>
                  <Form.Control
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={2}>
                <Button
                  type="submit"
                  variant="success"
                  className="w-100"
                  disabled={submitting}
                >
                  {submitting ? 'Adding...' : 'Add offering'}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminDashboard;
