'use client';

import { signOut } from 'next-auth/react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';

/** Displays the confirmation page before signing the user out. */
const SignOut = () => (
  <Container
    id="signout-page"
    className="py-5 flex-grow-1"
  >
    <Row className="justify-content-center">
      <Col xs={12} md={6} lg={5}>
        <h1 className="text-center mb-4">
          Sign out
        </h1>

        <Card>
          <Card.Body>
            <p className="text-center mb-4">
              Are you sure you want to sign out of Manoa Notes Exchange?
            </p>

            <div className="d-flex justify-content-between">
              <Button
                type="button"
                variant="success"
                onClick={() => signOut({
                  redirectTo: '/',
                })}
              >
                Sign out
              </Button>

              <Button
                type="button"
                variant="outline-secondary"
                href="/home"
              >
                Cancel
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
);

export default SignOut;
