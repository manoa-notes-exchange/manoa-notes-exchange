'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import {
  BoxArrowRight,
  Lock,
  PersonFill,
  PersonPlusFill,
} from 'react-bootstrap-icons';

const NavBar: React.FC = () => {
  const { data: session, status } = useSession();
  const pathName = usePathname();

  if (status === 'loading') return null;

  const currentUser = session?.user?.email;
  const role = session?.user?.role;

  return (
    <Navbar bg="dark" data-bs-theme="dark" expand="lg">
      <Container>
        <Navbar.Brand href="/">
          Manoa Notes Exchange
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto justify-content-start">
            {currentUser && (
              <>
                <Nav.Link
                  id="home-nav"
                  href="/home"
                  active={pathName === '/home'}
                >
                  My Home
                </Nav.Link>

                <Nav.Link
                  id="search-courses-nav"
                  href="/courses"
                  active={pathName === '/courses'}
                >
                  Search Courses
                </Nav.Link>

                <Nav.Link
                  id="upload-nav"
                  href="/upload"
                  active={pathName === '/upload'}
                >
                  Upload
                </Nav.Link>
              </>
            )}

            {currentUser && role === 'ADMIN' && (
              <Nav.Link
                id="admin-nav"
                href="/admin"
                active={pathName === '/admin'}
              >
                Admin
              </Nav.Link>
            )}
          </Nav>

          <Nav>
            {session ? (
              <NavDropdown id="login-dropdown" title={currentUser}>
                <NavDropdown.Item
                  id="login-dropdown-sign-out"
                  href="/api/auth/signout"
                >
                  <BoxArrowRight className="me-2" />
                  Sign Out
                </NavDropdown.Item>

                <NavDropdown.Item
                  id="login-dropdown-change-password"
                  href="/auth/change-password"
                >
                  <Lock className="me-2" />
                  Change Password
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <NavDropdown id="login-dropdown" title="Login">
                <NavDropdown.Item
                  id="login-dropdown-sign-in"
                  href="/auth/signin"
                >
                  <PersonFill className="me-2" />
                  Sign In
                </NavDropdown.Item>

                <NavDropdown.Item
                  id="login-dropdown-sign-up"
                  href="/auth/signup"
                >
                  <PersonPlusFill className="me-2" />
                  Sign Up
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
