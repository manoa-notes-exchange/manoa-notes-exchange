'use client';

import { useState, useTransition } from 'react';
import { Badge, Button, Card } from 'react-bootstrap';
import { Bookmark, BookmarkCheck } from 'react-bootstrap-icons';
import { toggleSavedCourse } from '@/lib/dbActions';
import { redirect } from 'next/navigation';

type CourseCardProps = {
  courseCode: string;
  courseName: string;
  rating: number;
  semesters: string[];
  isSaved: boolean;
};

function CourseCard({ courseCode, courseName, rating, semesters, isSaved }: CourseCardProps) {
  const [saved, setSaved] = useState(isSaved);
  const [isPending, startTransition] = useTransition();
  const [saveMessage, setSaveMessage] = useState('');

  const handleSave = () => {
    setSaveMessage('');
    startTransition(async () => {
      const result = await toggleSavedCourse(courseCode);
      if (result.ok) {
        setSaved(result.saved);
      } else {
        setSaveMessage(result.message);
        redirect('/auth/signin');
      }
    });
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
      </Card.Body>
      <Card.Footer className="bg-white d-flex gap-2">
        <Button
          type="button"
          variant="success"
          size="sm"
          href='/courses'
        >
          View materials
        </Button>
        <Button
          type="button"
          variant={saved ? 'success' : 'outline-success'}
          size="sm"
          onClick={handleSave}
          aria-pressed={saved}
          disabled={isPending}
          aria-label={saved ? `Unsave ${courseCode}` : `Save ${courseCode}`}
        >
          {saved ? <BookmarkCheck aria-hidden="true" /> : <Bookmark aria-hidden="true" />}
          <span className="ms-1">
            {isPending ? (saved ? 'Removing...' : 'Saving...') : saved ? 'Saved' : 'Save'}
          </span>
        </Button>
        <span className="align-self-center text-danger small" role="status">{saveMessage}</span>
      </Card.Footer>
    </Card>
  );
}

export default CourseCard;
