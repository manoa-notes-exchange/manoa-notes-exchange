import { Container } from 'react-bootstrap';

/** The Footer appears at the bottom of every page. */
const Footer = () => (
  <footer className="mt-auto py-3 bg-dark text-white">
    <Container className="text-center">
      <p className="mb-2">
        This project is not affiliated with the University of Hawaiʻi.
      </p>

      <a className="footer-link me-3" href="/">
        Manoa Notes Exchange
      </a>

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
