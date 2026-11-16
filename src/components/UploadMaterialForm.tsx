'use client';

import { useSession } from 'next-auth/react';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import swal from 'sweetalert';
import { redirect } from 'next/navigation';
import { InferType } from 'yup';
import LoadingSpinner from '@/components/LoadingSpinner';
import { UploadMaterialSchema } from '@/lib/validationSchemas';

type UploadMaterialData = InferType<typeof UploadMaterialSchema>;

// Sample choices for the M1 mockup. These match the sample data on the Browse page.
// In M2 they come from the database (Course and Offering tables).
const courses = ['ICS 314', 'ICS 311'];
const instructors = ['Instructor A', 'Instructor B'];
const semesters = ['Fall 2026', 'Spring 2027', 'Spring 2026'];
const types = ['Notes', 'Study guide', 'Practice problems', 'Cheat sheet'];

const emptyForm: UploadMaterialData = {
  title: '',
  course: '',
  instructor: '',
  semester: '',
  type: 'Notes',
  link: '',
  description: '',
  ownWork: false,
};

const UploadMaterialForm: React.FC = () => {
  const { status } = useSession();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UploadMaterialData>({
    resolver: yupResolver(UploadMaterialSchema),
    defaultValues: emptyForm,
  });

  if (status === 'loading') {
    return <LoadingSpinner />;
  }
  if (status === 'unauthenticated') {
    redirect('/auth/signin');
  }

  // M1 mockup: the form validates but does not save yet.
  // In M2 this calls a server action, which must validate the data again on the server.
  const onSubmit = async () => {
    await swal('Looks good', 'Saving uploads is coming in Milestone 2. Nothing was saved yet.', 'info');
    reset(emptyForm);
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <h1 className="mb-1">Upload Course Material</h1>
          <p className="text-muted mb-4">
            Share notes, study guides or practice problems for a UH M&#257;noa course. Link to a file you host
            somewhere else, such as Google Drive.
          </p>
          <Card>
            <Card.Body>
              <Form noValidate onSubmit={handleSubmit(onSubmit)}>
                <Form.Group className="mb-3" controlId="upload-title">
                  <Form.Label>Title</Form.Label>
                  <input
                    id="upload-title"
                    type="text"
                    placeholder="e.g. Midterm 1 review: JavaScript and ESLint"
                    {...register('title')}
                    className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                  />
                  <div className="invalid-feedback">{errors.title?.message}</div>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="upload-course">
                      <Form.Label>Course</Form.Label>
                      <select
                        id="upload-course"
                        {...register('course')}
                        className={`form-select ${errors.course ? 'is-invalid' : ''}`}
                      >
                        <option value="">Choose a course</option>
                        {courses.map((course) => (
                          <option key={course} value={course}>{course}</option>
                        ))}
                      </select>
                      <div className="invalid-feedback">{errors.course?.message}</div>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="upload-instructor">
                      <Form.Label>Instructor</Form.Label>
                      <select
                        id="upload-instructor"
                        {...register('instructor')}
                        className={`form-select ${errors.instructor ? 'is-invalid' : ''}`}
                      >
                        <option value="">Choose an instructor</option>
                        {instructors.map((instructor) => (
                          <option key={instructor} value={instructor}>{instructor}</option>
                        ))}
                      </select>
                      <div className="invalid-feedback">{errors.instructor?.message}</div>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="upload-semester">
                      <Form.Label>Semester</Form.Label>
                      <select
                        id="upload-semester"
                        {...register('semester')}
                        className={`form-select ${errors.semester ? 'is-invalid' : ''}`}
                      >
                        <option value="">Choose a semester</option>
                        {semesters.map((semester) => (
                          <option key={semester} value={semester}>{semester}</option>
                        ))}
                      </select>
                      <div className="invalid-feedback">{errors.semester?.message}</div>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="upload-type">
                      <Form.Label>Type</Form.Label>
                      <select
                        id="upload-type"
                        {...register('type')}
                        className={`form-select ${errors.type ? 'is-invalid' : ''}`}
                      >
                        {types.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <div className="invalid-feedback">{errors.type?.message}</div>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3" controlId="upload-link">
                  <Form.Label>Link</Form.Label>
                  <input
                    id="upload-link"
                    type="url"
                    placeholder="https://"
                    {...register('link')}
                    className={`form-control ${errors.link ? 'is-invalid' : ''}`}
                  />
                  <div className="invalid-feedback">{errors.link?.message}</div>
                  <Form.Text>Make sure the link is shared so anyone with it can view.</Form.Text>
                </Form.Group>

                <Form.Group className="mb-3" controlId="upload-description">
                  <Form.Label>Description (optional)</Form.Label>
                  <textarea
                    id="upload-description"
                    rows={4}
                    {...register('description')}
                    className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                  />
                  <div className="invalid-feedback">{errors.description?.message}</div>
                </Form.Group>

                <div className="form-check mb-3">
                  <input
                    id="upload-own-work"
                    type="checkbox"
                    {...register('ownWork')}
                    className={`form-check-input ${errors.ownWork ? 'is-invalid' : ''}`}
                  />
                  <label className="form-check-label" htmlFor="upload-own-work">
                    This is my own work. It is not a copy of a real exam or textbook pages.
                  </label>
                  <div className="invalid-feedback">{errors.ownWork?.message}</div>
                </div>

                <Row className="pt-2">
                  <Col>
                    <Button type="submit" variant="primary">
                      Submit
                    </Button>
                  </Col>
                  <Col className="text-end">
                    <Button type="button" variant="warning" onClick={() => reset(emptyForm)}>
                      Reset
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UploadMaterialForm;
