import { ReactNode } from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';

type AccountPageLayoutProps = {
  title: string;
  children: ReactNode;
};

const AccountPageLayout = ({
  title,
  children,
}: AccountPageLayoutProps) => (
  <Container className="py-5 flex-grow-1">
    <Row className="justify-content-center">
      <Col xs={12} md={6} lg={5}>
        <h1 className="text-center mb-4">
          {title}
        </h1>

        <Card>
          <Card.Body>
            {children}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
);

export default AccountPageLayout;