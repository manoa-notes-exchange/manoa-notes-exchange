'use client';

import { useSession } from 'next-auth/react';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { DefaultValues, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import swal from 'sweetalert';
import { redirect } from 'next/navigation';
import { InferType } from 'yup';
import LoadingSpinner from '@/components/LoadingSpinner';
import { UploadMaterialSchema } from '@/lib/validationSchemas';
import { ALLOWED_SITES_TEXT } from '@/lib/allowedHosts';
import { addMaterial } from '@/lib/dbActions';

type UploadMaterialData = InferType<typeof UploadMaterialSchema>;

/** One offering the form can save to: a course, a semester and an instructor (#25, #26). */
export type OfferingChoice = { id: number; course: string; semester: string; instructor: string };

const types = ['Notes', 'Study guide', 'Practice problems', 'Cheat sheet'];

const emptyForm: DefaultValues<UploadMaterialData> = {
  title: '',
  course: '',
  semester: '',
  offeringId: undefined,
  type: 'Notes',
  link: '',
  description: '',
  ownWork: false,
};

/** Sorts "Spring 2027" after "Fall 2026": by year, then Spring, Summer, Fall. Newest first. */
const termOrder: Record<string, number> = { Spring: 1, Summer: 2, Fall: 3 };
const semesterKey = (semester: string) => {
  const [term, year] = semester.split(' ');
  return Number(year) * 10 + (termOrder[term] ?? 0);
};

const UploadMaterialForm = ({ offerings }: { offerings: OfferingChoice[] }) => {
  const { status } = useSession();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UploadMaterialData>({
    resolver: yupResolver(UploadMaterialSchema),
    defaultValues: emptyForm,
  });

  // The choices narrow each other (#26): a course shows only its semesters,
  // and a semester shows only the instructors teaching that course then.
  const course = useWatch({ control, name: 'course' });
  const semester = useWatch({ control, name: 'semester' });
  const courses = [...new Set(offerings.map((o) => o.course))].sort();
  const semesters = [...new Set(offerings.filter((o) => o.course === course).map((o) => o.semester))]
    .sort((a, b) => semesterKey(b) - semesterKey(a));
  const instructorChoices = offerings
    .filter((o) => o.course === course && o.semester === semester)
    .sort((a, b) => a.instructor.localeCompare(b.instructor));

  if (status === 'loading') {
    return <LoadingSpinner />;
  }
  if (status === 'unauthenticated') {
    redirect('/auth/signin');
  }

  // Saves through the server action, which checks everything again (#26).
  const onSubmit = async (data: UploadMaterialData) => {
    const result = await addMaterial(data);
    if (result.ok) {
      await swal('Uploaded', 'Thanks for sharing! Your material has been saved.', 'success');
      reset(emptyForm);
    } else {
      await swal('Not saved', result.message, 'error');
    }
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
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="upload-course">
                      <Form.Label>Course</Form.Label>
                      <select
                        id="upload-course"
                        {...register('course', {
                          // A new course clears the semester and instructor picked for the old one.
                          onChange: () => {
                            setValue('semester', '');
                            setValue('offeringId', '' as unknown as number);
                          },
                        })}
                        className={`form-select ${errors.course ? 'is-invalid' : ''}`}
                      >
                        <option value="">Choose a course</option>
                        {courses.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <div className="invalid-feedback">{errors.course?.message}</div>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="upload-semester">
                      <Form.Label>Semester</Form.Label>
                      <select
                        id="upload-semester"
                        disabled={!course}
                        {...register('semester', {
                          // A new semester clears the instructor picked for the old one.
                          onChange: () => setValue('offeringId', '' as unknown as number),
                        })}
                        className={`form-select ${errors.semester ? 'is-invalid' : ''}`}
                      >
                        <option value="">{course ? 'Choose a semester' : 'Choose a course first'}</option>
                        {semesters.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <div className="invalid-feedback">{errors.semester?.message}</div>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="upload-instructor">
                      <Form.Label>Instructor</Form.Label>
                      <select
                        id="upload-instructor"
                        disabled={!semester}
                        {...register('offeringId')}
                        className={`form-select ${errors.offeringId ? 'is-invalid' : ''}`}
                      >
                        <option value="">{semester ? 'Choose an instructor' : 'Choose a semester first'}</option>
                        {instructorChoices.map((o) => (
                          <option key={o.id} value={o.id}>{o.instructor}</option>
                        ))}
                      </select>
                      <div className="invalid-feedback">{errors.offeringId?.message}</div>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
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
                  <Form.Text>
                    Links from {ALLOWED_SITES_TEXT}. Make sure the link is shared so anyone with it can view.
                  </Form.Text>
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
                    <Button type="submit" variant="success" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : 'Submit'}
                    </Button>
                  </Col>
                  <Col className="text-end">
                    <Button type="button" variant="outline-secondary" onClick={() => reset(emptyForm)}>
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
