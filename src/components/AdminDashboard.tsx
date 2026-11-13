'use client';

import React, { useState } from 'react';
import {
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

interface ReportItem {
  id: number;
  material: string;
  course: string;
  reportedBy: string;
  reason: string;
  status: 'Open' | 'Resolved';
}

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

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('reports');
  const [course, setCourse] = useState<string>('ICS 314');
  const [instructor, setInstructor] = useState<string>('Instructor B');
  const [semester, setSemester] = useState<string>('Spring');
  const [year, setYear] = useState<string>('2027');

  const handleAddOffering = (e: React.FormEvent) => {
    e.preventDefault();
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
          <Form onSubmit={handleAddOffering}>
            <Row className="g-3 align-items-end">
              <Col xs={12} md={3}>
                <Form.Group controlId="offeringCourse">
                  <Form.Label>Course</Form.Label>
                  <Form.Select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                  >
                    <option value="ICS 314">ICS 314</option>
                    <option value="ICS 211">ICS 211</option>
                    <option value="MATH 307">MATH 307</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col xs={12} md={3}>
                <Form.Group controlId="offeringInstructor">
                  <Form.Label>Instructor</Form.Label>
                  <Form.Select
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                  >
                    <option value="Instructor B">Instructor B</option>
                    <option value="Instructor A">Instructor A</option>
                    <option value="Instructor C">Instructor C</option>
                  </Form.Select>
                </Form.Group>
              </Col>

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
                <Button type="submit" variant="success" className="w-100">
                  Add offering
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
