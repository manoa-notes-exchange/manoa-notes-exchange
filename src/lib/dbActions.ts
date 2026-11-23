'use server';

import { hash } from 'bcrypt';
import { ValidationError } from 'yup';
import { prisma } from './prisma';
import { auth } from './auth';
import { UploadMaterialSchema } from './validationSchemas';

/**
 * Creates a new user in the database.
 * @param credentials, an object with the following properties: email, password.
 */
export async function createUser(credentials: { email: string; password: string }) {
  // console.log(`createUser data: ${JSON.stringify(credentials, null, 2)}`);
  const password = await hash(credentials.password, 10);
  await prisma.user.create({
    data: {
      email: credentials.email,
      password,
    },
  });
}

/**
 * Changes the password of an existing user in the database.
 * @param credentials, an object with the following properties: email, password.
 */
export async function changePassword(credentials: { email: string; password: string }) {
  // console.log(`changePassword data: ${JSON.stringify(credentials, null, 2)}`);
  const password = await hash(credentials.password, 10);
  await prisma.user.update({
    where: { email: credentials.email },
    data: {
      password,
    },
  });
}

/** What addMaterial tells the form: saved, or a message to show. */
export type AddMaterialResult = { ok: true } | { ok: false; message: string };

/**
 * Saves a shared link to course material (#26).
 * Everything is checked again here, because a request can reach a server action
 * without going through the form: sign-in, every field, the link's host, and the offering.
 * The uploader comes from the session, never from the form.
 */
export async function addMaterial(form: unknown): Promise<AddMaterialResult> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    return { ok: false, message: 'Please sign in to upload materials.' };
  }

  let material;
  try {
    // The same rules as the form, including the allowed-host check.
    material = await UploadMaterialSchema.validate(form, { stripUnknown: true });
  } catch (error) {
    if (error instanceof ValidationError) {
      return { ok: false, message: error.message };
    }
    throw error;
  }

  // The session's email is unique, so it identifies the uploader.
  const uploader = await prisma.user.findUnique({ where: { email } });
  if (!uploader) {
    return { ok: false, message: 'Please sign in to upload materials.' };
  }

  // The chosen offering must exist (#25). The database would refuse it anyway, but this gives a clear message.
  const offering = await prisma.offering.findUnique({ where: { id: material.offeringId } });
  if (!offering) {
    return { ok: false, message: 'That course, semester and instructor no longer exist. Please choose again.' };
  }

  await prisma.material.create({
    data: {
      title: material.title,
      type: material.type,
      link: material.link,
      description: material.description,
      offeringId: offering.id,
      uploaderId: uploader.id,
    },
  });
  return { ok: true };
}
/** What addOffering tells the Admin form: saved, or a message to show. */
export type AddOfferingResult = { ok: true } | { ok: false; message: string };

/**
 * Creates a new semester offering (#31), optionally creating a new Instructor first.
 * Checks the ADMIN role on the server so non-admins cannot bypass the page guard.
 */
export async function addOffering(input: {
  courseId: number;
  instructorId?: number;
  newInstructorName?: string;
  semester: string;
  year: string;
}): Promise<AddOfferingResult> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    return { ok: false, message: 'Please sign in as an admin.' };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.role !== 'ADMIN') {
    return { ok: false, message: 'Only admins can add semester offerings.' };
  }

  const course = await prisma.course.findUnique({ where: { id: input.courseId } });
  if (!course) {
    return { ok: false, message: 'Selected course was not found.' };
  }

  const trimmedSemester = input.semester.trim();
  const trimmedYear = input.year.trim();
  if (!trimmedSemester || !/^\d{4}$/.test(trimmedYear)) {
    return { ok: false, message: 'Please choose a semester and enter a valid 4-digit year (e.g., 2026).' };
  }
  const formattedSemester = `${trimmedSemester} ${trimmedYear}`;

  let resolvedInstructorId = input.instructorId;
  const trimmedNewInstructor = input.newInstructorName?.trim() ?? '';

  if (trimmedNewInstructor) {
    const existingInstructor = await prisma.instructor.findUnique({
      where: { name: trimmedNewInstructor },
    });
    if (existingInstructor) {
      resolvedInstructorId = existingInstructor.id;
    } else {
      const createdInstructor = await prisma.instructor.create({
        data: { name: trimmedNewInstructor },
      });
      resolvedInstructorId = createdInstructor.id;
    }
  }

  if (!resolvedInstructorId) {
    return { ok: false, message: 'Please select an instructor or enter a new instructor name.' };
  }

  const existingOffering = await prisma.offering.findUnique({
    where: {
      courseId_instructorId_semester: {
        courseId: course.id,
        instructorId: resolvedInstructorId,
        semester: formattedSemester,
      },
    },
  });

  if (existingOffering) {
    return {
      ok: false,
      message: `${course.courseCode} with that instructor for ${formattedSemester} already exists.`,
    };
  }

  await prisma.offering.create({
    data: {
      courseId: course.id,
      instructorId: resolvedInstructorId,
      semester: formattedSemester,
    },
  });

  return { ok: true };
}
