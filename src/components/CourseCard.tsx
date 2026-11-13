'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Bookmark, BookmarkCheck } from 'react-bootstrap-icons';
import styles from './CourseCard.module.css';

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
    <article className={styles.card}>
      <div className={styles.body}>
        <h2 className={styles.courseCode}>{courseCode}</h2>
        <p className={styles.courseName}>{courseName}</p>
        <div className={styles.semesters}>
          {semesters.map((semester) => (
            <span className={styles.semester} key={semester}>{semester}</span>
          ))}
        </div>
        <div className={styles.rating} role="img" aria-label={`Rated ${displayRating} out of 5`}>
          <span className={styles.stars} aria-hidden="true">
            {'★'.repeat(fullStars)}
            {hasHalfStar && <span className={styles.halfStar}>★</span>}
            <span className={styles.emptyStars}>{'☆'.repeat(emptyStars)}</span>
          </span>
          <span className={styles.materialCount}>Materials</span>
        </div>
        {showMaterialsMessage && (
          <p className={styles.materialsMessage} role="status">
            No materials have been shared for this course yet.
          </p>
        )}
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.viewButton}
          onClick={() => setShowMaterialsMessage(!showMaterialsMessage)}
          aria-expanded={showMaterialsMessage}
        >
          View materials
        </button>
        {currentUser && (
          <button
            type="button"
            className={saved ? styles.savedButton : styles.saveButton}
            onClick={toggleSaved}
            aria-pressed={saved}
          >
            {saved ? <BookmarkCheck aria-hidden="true" /> : <Bookmark aria-hidden="true" />}
            {saved ? 'Saved' : 'Save'}
          </button>
          )}
      </div>
    </article>
  );
}

export default CourseCard;
