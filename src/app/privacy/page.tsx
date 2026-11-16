import { Col, Container, Row } from 'react-bootstrap';

/** Privacy policy page explaining what user data is stored and why. */
const PrivacyPage = () => (
  <main className="py-5">
    <Container>
      <Row className="justify-content-center">
        <Col md={8}>
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h1 className="mb-3">Privacy Policy</h1>
              <p className="text-muted">
                Manoa Notes Exchange is committed to keeping your data minimal and
                transparent. Here is everything we store and why:
              </p>

              <ul className="mt-3">
                <li className="mb-3">
                  <strong>Email Address:</strong> Used to create your account,
                  identify your profile, and let you sign in.
                </li>
                <li className="mb-3">
                  <strong>Hashed Password:</strong> Used to authenticate your
                  account securely. Your password is always hashed and never
                  stored in plain text.
                </li>
                <li className="mb-3">
                  <strong>Uploaded Materials:</strong> Any notes, study guides,
                  or course files you choose to upload so other students can
                  view and share them.
                </li>
              </ul>

              <p className="mt-4 mb-0">
                <strong>Nothing else is collected or stored.</strong> We do not
                track you across other sites, sell your information, or store any
                additional personal data.
              </p>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  </main>
);

export default PrivacyPage;
