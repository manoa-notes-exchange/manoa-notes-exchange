'use client';

import { Button, Col, Form, Row } from 'react-bootstrap';
import { Search as SearchIcon } from 'react-bootstrap-icons';

type CourseSearchFormProps = {
  departments: string[];
  department: string;
  courseNumber: string;
  semesters: string[];
  semester: string;
};

const CourseSearchForm = ({
  departments,
  department,
  courseNumber,
  semesters,
  semester,
}: CourseSearchFormProps) => (
  <Form action="/search" method="get" className="border rounded p-3">
    <Row className="g-3 align-items-end">
      <Col xs={12} md={6} lg={3}>
        <Form.Group controlId="department">
          <Form.Label>Department</Form.Label>
          <Form.Select name="department" defaultValue={department}>
            <option value="">All departments</option>
            {departments.map((item) => <option key={item} value={item}>{item}</option>)}
          </Form.Select>
        </Form.Group>
      </Col>

      <Col xs={12} md={6} lg={3}>
        <Form.Group controlId="courseNumber">
          <Form.Label>Course number</Form.Label>
          <Form.Control
            type="search"
            name="courseNumber"
            placeholder="e.g. 314"
            defaultValue={courseNumber}
          />
        </Form.Group>
      </Col>

      <Col xs={12} md={6} lg={3}>
        <Form.Group controlId="semester">
          <Form.Label>Offered in</Form.Label>
          <Form.Select name="semester" defaultValue={semester}>
            <option value="">Any semester</option>
            {semesters.map((item) => <option key={item} value={item}>{item}</option>)}
          </Form.Select>
        </Form.Group>
      </Col>

      <Col xs={12} md={6} lg={3}>
        <Button type="submit" variant="success" className="w-100">
          <SearchIcon aria-hidden="true" className="me-1" />
          Search
        </Button>
      </Col>
    </Row>
  </Form>
);

export default CourseSearchForm;
