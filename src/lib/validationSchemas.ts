import * as Yup from 'yup';
import { ALLOWED_SITES_TEXT, isAllowedLink } from './allowedHosts';

/**
 * Rules for the Upload form (#26). The form checks them as you type, and the
 * addMaterial server action checks them again, since the browser's checks can be skipped.
 */
export const UploadMaterialSchema = Yup.object({
  title: Yup.string().trim().max(100, 'Title must be 100 characters or less').required('Title is required'),
  // Course and semester narrow the choices on the form; the offering is what gets saved.
  course: Yup.string().required('Choose a course'),
  semester: Yup.string().required('Choose a semester'),
  // The Instructor menu's value is the offering's id: one course, semester and instructor (#25).
  offeringId: Yup.number()
    .typeError('Choose an instructor')
    .integer()
    .positive('Choose an instructor')
    .required('Choose an instructor'),
  type: Yup.string()
    .oneOf(['Notes', 'Study guide', 'Practice problems', 'Cheat sheet'], 'Choose a type from the list')
    .required('Choose a type'),
  link: Yup.string()
    .trim()
    .required('Link is required')
    .url('Enter a full link, for example https://drive.google.com/...')
    .matches(/^https:\/\//, 'The link must start with https://')
    .test('allowed-host', `Links must be from ${ALLOWED_SITES_TEXT}`, (value) => !value || isAllowedLink(value)),
  description: Yup.string().trim().max(500, 'Description must be 500 characters or less').default(''),
  ownWork: Yup.boolean()
    .oneOf([true], 'Please confirm this is your own work and not copied exam or textbook content')
    .required(),
});
