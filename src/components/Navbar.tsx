'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import {
  Container,
  Image,
  Nav,
  Navbar,
  NavDropdown,
} from 'react-bootstrap';
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
    <Navbar
      bg="dark"
      data-bs-theme="dark"
      expand="lg"
      className="floral-navbar"
    >
      <Container>
        <Navbar.Brand
          href={currentUser ? '/home' : '/'}
          className="manoa-brand"
        >
          <Image
            src="/manoa-notes-icon.png"
            width={48}
            height={48}
            alt="Manoa Notes Exchange logo"
            className="manoa-brand-icon"
          />

          <span className="manoa-brand-text">
            <span className="manoa-brand-main">
              Mānoa
            </span>

            <span className="manoa-brand-subtitle">
              Notes Exchange
            </span>
          </span>
        </Navbar.Brand>

        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          className="manoa-navbar-toggle"
        />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto ms-lg-4 justify-content-start">
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
                  href="/search"
                  active={pathName.startsWith('/search')}
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

          <Nav className="manoa-account-nav">
            {session ? (
              <NavDropdown
                id="login-dropdown"
                title={currentUser}
                align="end"
              >
                <NavDropdown.Item
                  id="login-dropdown-sign-out"
                  href="/auth/signout"
                >
                  <BoxArrowRight className="me-2" />
                  Sign out
                </NavDropdown.Item>

                <NavDropdown.Item
                  id="login-dropdown-change-password"
                  href="/auth/change-password"
                >
                  <Lock className="me-2" />
                  Change password
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <NavDropdown
                id="login-dropdown"
                title="Sign in"
                align="end"
              >
                <NavDropdown.Item
                  id="login-dropdown-sign-in"
                  href="/auth/signin"
                >
                  <PersonFill className="me-2" />
                  Sign in
                </NavDropdown.Item>

                <NavDropdown.Item
                  id="login-dropdown-sign-up"
                  href="/auth/signup"
                >
                  <PersonPlusFill className="me-2" />
                  Sign up
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
