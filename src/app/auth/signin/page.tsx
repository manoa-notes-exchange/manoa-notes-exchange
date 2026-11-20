'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Spinner,
} from 'react-bootstrap';

const SignInForm = () => {
  const searchParams = useSearchParams();
  const authError = searchParams.get('error');

  const handleSubmit = async (
    event: React.SubmitEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const target = event.currentTarget;
    const formData = new FormData(target);

    const email = formData.get('email');
    const password = formData.get('password');

    await signIn('credentials', {
      email,
      password,
      redirectTo: '/home',
    });
  };

  return (
    <Container className="py-5 flex-grow-1">
      <Row className="justify-content-center">
        <Col xs={12} md={6} lg={5}>
          <h1 className="text-center mb-4">
            Sign in
          </h1>

          <Card>
            <Card.Body>
              {authError === 'CredentialsSignin' && (
                <Alert variant="danger">
                  Incorrect email or password. Please try again.
                </Alert>
              )}

              <Form method="post" onSubmit={handleSubmit}>
                <Form.Group
                  className="mb-3"
                  controlId="formBasicEmail"
                >
                  <Form.Label>Email</Form.Label>

                  <Form.Control
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                  />
                </Form.Group>

                <Form.Group
                  className="mb-3"
                  controlId="formBasicPassword"
                >
                  <Form.Label>Password</Form.Label>

                  <Form.Control
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                  />
                </Form.Group>

                <div className="clearfix">
                  <Button
                    type="submit"
                    variant="success"
                  >
                    Sign in
                  </Button>

                  <Button
                    type="reset"
                    variant="outline-secondary"
                    className="float-end"
                  >
                    Reset
                  </Button>
                </div>
              </Form>
            </Card.Body>

            <Card.Footer className="text-center">
              Don&apos;t have an account?{' '}

              <Link href="/auth/signup">
                Sign up
              </Link>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

/** Displays the sign-in page. */
const SignIn = () => (
  <Suspense
    fallback={(
      <div className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">
            Loading sign-in page
          </span>
        </Spinner>
      </div>
    )}
  >
    <SignInForm />
  </Suspense>
);

export default SignIn;
