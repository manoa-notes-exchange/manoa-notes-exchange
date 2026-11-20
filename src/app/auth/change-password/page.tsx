'use client';

import { useForm } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import swal from 'sweetalert';
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
} from 'react-bootstrap';
import { changePassword } from '@/lib/dbActions';
import LoadingSpinner from '@/components/LoadingSpinner';

type ChangePasswordForm = {
  oldpassword: string;
  password: string;
  confirmPassword: string;
};

const validationSchema = Yup.object().shape({
  oldpassword: Yup.string()
    .required('Current password is required'),
  password: Yup.string()
    .required('New password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(40, 'Password must not exceed 40 characters'),
  confirmPassword: Yup.string()
    .required('Please confirm your new password')
    .oneOf(
      [Yup.ref('password'), ''],
      'The passwords do not match',
    ),
});

/** Displays the change-password page. */
const ChangePassword = () => {
  const { data: session, status } = useSession();
  const email = session?.user?.email || '';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordForm>({
    resolver: yupResolver(validationSchema),
  });

  const onSubmit = async (data: ChangePasswordForm) => {
    await changePassword({
      email,
      ...data,
    });

    await swal(
      'Password changed',
      'Your password has been changed successfully.',
      'success',
      { timer: 2000 },
    );

    reset();
  };

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  return (
    <Container className="py-5 flex-grow-1">
      <Row className="justify-content-center">
        <Col xs={12} md={6} lg={5}>
          <h1 className="text-center mb-4">
            Change password
          </h1>

          <Card>
            <Card.Body>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Form.Group
                  className="mb-3"
                  controlId="currentPassword"
                >
                  <Form.Label>
                    Current password
                  </Form.Label>

                  <Form.Control
                    type="password"
                    autoComplete="current-password"
                    {...register('oldpassword')}
                    isInvalid={Boolean(errors.oldpassword)}
                  />

                  <Form.Control.Feedback type="invalid">
                    {errors.oldpassword?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group
                  className="mb-3"
                  controlId="newPassword"
                >
                  <Form.Label>
                    New password
                  </Form.Label>

                  <Form.Control
                    type="password"
                    autoComplete="new-password"
                    {...register('password')}
                    isInvalid={Boolean(errors.password)}
                  />

                  <Form.Control.Feedback type="invalid">
                    {errors.password?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group
                  className="mb-3"
                  controlId="confirmPassword"
                >
                  <Form.Label>
                    Confirm new password
                  </Form.Label>

                  <Form.Control
                    type="password"
                    autoComplete="new-password"
                    {...register('confirmPassword')}
                    isInvalid={Boolean(errors.confirmPassword)}
                  />

                  <Form.Control.Feedback type="invalid">
                    {errors.confirmPassword?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <div className="clearfix pt-2">
                  <Button
                    type="submit"
                    variant="success"
                  >
                    Change password
                  </Button>

                  <Button
                    type="button"
                    variant="outline-secondary"
                    className="float-end"
                    onClick={() => reset()}
                  >
                    Reset
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ChangePassword;
