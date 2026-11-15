import * as Yup from 'yup';

export const AddStuffSchema = Yup.object({
  name: Yup.string().required(),
  quantity: Yup.number().positive().required(),
  condition: Yup.string().oneOf(['excellent', 'good', 'fair', 'poor']).required(),
  owner: Yup.string().required(),
});

export const EditStuffSchema = Yup.object({
  id: Yup.number().required(),
  name: Yup.string().required(),
  quantity: Yup.number().positive().required(),
  condition: Yup.string().oneOf(['excellent', 'good', 'fair', 'poor']).required(),
  owner: Yup.string().required(),
});

export const UploadMaterialSchema = Yup.object({
  title: Yup.string().trim().max(100, 'Title must be 100 characters or less').required('Title is required'),
  course: Yup.string().required('Choose a course'),
  instructor: Yup.string().required('Choose an instructor'),
  semester: Yup.string().required('Choose a semester'),
  type: Yup.string().oneOf(['Notes', 'Study guide', 'Practice problems', 'Cheat sheet']).required('Choose a type'),
  link: Yup.string()
    .trim()
    .required('Link is required')
    .url('Enter a full link, for example https://drive.google.com/...')
    .matches(/^https:\/\//, 'The link must start with https://'),
  description: Yup.string().trim().max(500, 'Description must be 500 characters or less').default(''),
  ownWork: Yup.boolean()
    .oneOf([true], 'Please confirm this is your own work and not copied exam or textbook content')
    .required(),
});
