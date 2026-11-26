'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from 'react-bootstrap';
import {
  Bookmark,
  BookmarkFill,
} from 'react-bootstrap-icons';
import { toggleBookmark } from '@/lib/dbActions';

interface BookmarkButtonProps {
  materialId: number;
  initialBookmarked: boolean;
}

const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  materialId,
  initialBookmarked,
}) => {
  const router = useRouter();
  const { status } = useSession();
  const [bookmarked, setBookmarked] = useState<boolean>(
    initialBookmarked,
  );
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleBookmark = async () => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status !== 'authenticated') {
      return;
    }

    setSubmitting(true);

    try {
      const result = await toggleBookmark(materialId);

      if (result.ok) {
        setBookmarked(result.bookmarked);
        router.refresh();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Button
      type="button"
      variant={bookmarked ? 'success' : 'outline-success'}
      aria-pressed={bookmarked}
      disabled={status === 'loading' || submitting}
      onClick={handleBookmark}
    >
      {bookmarked ? (
        <BookmarkFill className="me-1" />
      ) : (
        <Bookmark className="me-1" />
      )}

      {bookmarked ? 'Bookmarked' : 'Bookmark'}
    </Button>
  );
};

export default BookmarkButton;
