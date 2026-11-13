import { Container } from 'react-bootstrap';
import Link from 'next/link';

/** The Footer appears at the bottom of every page. */
const Footer = () => (
  <footer className="mt-auto py-3 bg-dark text-white">
    <Container className="text-center">
      <p className="mb-2">
        This project is not affiliated with the University of Hawaiʻi.
      </p>

      <Link className="footer-link me-3" href="/">
        Manoa Notes Exchange
      </Link>

      <a
        className="footer-link"
        href="https://github.com/"
        target="_blank"
        rel="noreferrer"
      >
        GitHub Project
      </a>
    </Container>
  </footer>
);

export default Footer;
