'use client';

import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
} from 'react-bootstrap';
import { createUser } from '@/lib/dbActions';

type SignUpForm = {
  email: string;
  password: string;
  confirmPassword: string;
};

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .required('Email is required')
    .email('Enter a valid email address'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(40, 'Password must not exceed 40 characters'),
  confirmPassword: Yup.string()
    .required('Please confirm your password')
    .oneOf(
      [Yup.ref('password'), ''],
      'The passwords do not match',
    ),
});

/** Displays the form for creating a new user account. */
const SignUp = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SignUpForm>({
    resolver: yupResolver(validationSchema),
  });

  const onSubmit = async (data: SignUpForm) => {
    await createUser(data);

    await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirectTo: '/home',
    });
  };

  return (
    <Container className="py-5 flex-grow-1">
      <Row className="justify-content-center">
        <Col xs={12} md={6} lg={5}>
          <h1 className="text-center mb-4">
            Sign up
          </h1>

          <Card>
            <Card.Body>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Form.Group
                  className="mb-3"
                  controlId="signUpEmail"
                >
                  <Form.Label>
                    Email
                  </Form.Label>

                  <Form.Control
                    type="email"
                    autoComplete="email"
                    {...register('email')}
                    isInvalid={Boolean(errors.email)}
                  />

                  <Form.Control.Feedback type="invalid">
                    {errors.email?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group
                  className="mb-3"
                  controlId="signUpPassword"
                >
                  <Form.Label>
                    Password
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
                    Confirm password
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
                    Create account
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

            <Card.Footer className="text-center">
              Already have an account?{' '}

              <Link href="/auth/signin">
                Sign in
              </Link>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SignUp;
