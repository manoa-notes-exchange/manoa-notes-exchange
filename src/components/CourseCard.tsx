'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Alert, Badge, Button, Card } from 'react-bootstrap';
import { Bookmark, BookmarkCheck } from 'react-bootstrap-icons';
// import styles from './CourseCard.module.css';

type CourseCardProps = {
  courseCode: string;
  courseName: string;
  rating: number;
  semesters: string[];
};

function CourseCard({ courseCode, courseName, rating, semesters }: CourseCardProps) {
  const [saved, setSaved] = useState(false);
  const [showMaterialsMessage, setShowMaterialsMessage] = useState(false);
  const { data: session } = useSession();
  const currentUser = session?.user?.email;

  const toggleSaved = () => {
    setSaved(!saved);
  };

  const displayRating = Math.max(0, Math.min(5, Number.isFinite(rating) ? rating : 0));
  const fullStars = Math.floor(displayRating);
  const hasHalfStar = displayRating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <Card className="h-100">
      <Card.Body>
        <Card.Title as="h2">{courseCode}</Card.Title>
        <Card.Subtitle as="p" className={`text-muted mb-2`}>
          {courseName}
        </Card.Subtitle>
        <div className="d-flex flex-wrap gap-1 mb-2">
          {semesters.map((semester) => (
            <Badge bg="light" text="dark" className={`border`} key={semester}>
              {semester}
            </Badge>
          ))}
        </div>
        <div>
          <span role="img" aria-label={`Rated ${displayRating} out of 5`} className='stars'>
            {'★'.repeat(fullStars)}
            {hasHalfStar && <span className='halfStar'>★</span>}
            <span className='emptyStars'>{'☆'.repeat(emptyStars)}</span>
          </span>
          <span className="ms-1">Materials</span>
        </div>
        {showMaterialsMessage && (
          <Alert variant="light" className={`border mt-2`} role="status">
            No materials have been shared for this course yet.
          </Alert>
        )}
      </Card.Body>
      <Card.Footer className="bg-white d-flex gap-2">
        <Button
          type="button"
          variant="success"
          size="sm"
          onClick={() => setShowMaterialsMessage(!showMaterialsMessage)}
          aria-expanded={showMaterialsMessage}
        >
          View materials
        </Button>
        {currentUser && (
          <Button
            type="button"
            variant={saved ? 'success' : 'outline-success'}
            size="sm"
            onClick={toggleSaved}
            aria-pressed={saved}
          >
            {saved ? <BookmarkCheck aria-hidden="true" /> : <Bookmark aria-hidden="true" />}
            <span className="ms-1">{saved ? 'Saved' : 'Save'}</span>
          </Button>
        )}
      </Card.Footer>
    </Card>
  );
}

export default CourseCard;
