'use client';

// #38: lets an offering's instructor (or an admin) mark a material outdated with a short
// reason, or clear that mark. Only drawn when the course page says this person may manage
// the material; the server actions from #35 check again and refuse anyone else.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Form } from 'react-bootstrap';
import { ExclamationTriangle, XCircle } from 'react-bootstrap-icons';
import { clearMaterialOutdated, markMaterialOutdated } from '@/lib/dbActions';

type MarkOutdatedButtonProps = {
  materialId: number;
  outdatedNote: string | null;
};

const MAX_NOTE = 300; // same limit as markMaterialOutdated (#35)

const MarkOutdatedButton = ({ materialId, outdatedNote }: MarkOutdatedButtonProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const save = async () => {
    setSaving(true);
    setMessage('');
    try {
      const result = await markMaterialOutdated(materialId, note);
      if (result.ok) {
        setOpen(false);
        setNote('');
        router.refresh();
      } else {
        setMessage(result.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const clear = async () => {
    setSaving(true);
    setMessage('');
    try {
      const result = await clearMaterialOutdated(materialId);
      if (result.ok) {
        router.refresh();
      } else {
        setMessage(result.message);
      }
    } finally {
      setSaving(false);
    }
  };

  // Already marked: offer to clear it.
  if (outdatedNote) {
    return (
      <div className="mt-2">
        <Button variant="outline-secondary" size="sm" onClick={clear} disabled={saving}>
          <XCircle className="me-1" />
          Clear outdated
        </Button>
        {message && <div className="small text-danger mt-1" role="alert">{message}</div>}
      </div>
    );
  }

  if (!open) {
    return (
      <div className="mt-2">
        <Button variant="warning" size="sm" onClick={() => setOpen(true)}>
          <ExclamationTriangle className="me-1" />
          Mark outdated
        </Button>
      </div>
    );
  }

  const trimmed = note.trim();
  return (
    <Form
      className="mt-2"
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <Form.Group controlId={`outdated-note-${materialId}`}>
        <Form.Label className="small mb-1">Why is this outdated?</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          maxLength={MAX_NOTE}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="For example: the midterm format changed this year"
        />
        <Form.Text>
          {note.length}
          /
          {MAX_NOTE}
        </Form.Text>
      </Form.Group>
      <div className="d-flex gap-2 mt-2">
        <Button type="submit" size="sm" variant="warning" disabled={saving || trimmed === ''}>
          Save note
        </Button>
        <Button
          type="button"
          size="sm"
          variant="link"
          onClick={() => {
            setOpen(false);
            setNote('');
            setMessage('');
          }}
        >
          Cancel
        </Button>
      </div>
      {message && <div className="small text-danger mt-1" role="alert">{message}</div>}
    </Form>
  );
};

export default MarkOutdatedButton;
