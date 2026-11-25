'use server';

import { hash } from 'bcrypt';
import { Role } from '@prisma/client';
import { ValidationError } from 'yup';
import { prisma } from './prisma';
import { auth } from './auth';
import { UploadMaterialSchema } from './validationSchemas';
import { redirect } from 'next/navigation';

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
      role: Role.USER,
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

/** What instructor actions tell the page: successful, or a message to show. */
export type InstructorActionResult = { ok: true } | { ok: false; message: string };

/**
 * Allows an admin to connect a user account to an Instructor
 * and change the account's role to INSTRUCTOR.
 */
export async function makeInstructor(
  userId: number,
  instructorId: number,
): Promise<InstructorActionResult> {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return { ok: false, message: 'Please sign in as an admin.' };
  }

  const admin = await prisma.user.findUnique({
    where: { email },
  });

  if (!admin || admin.role !== Role.ADMIN) {
    return {
      ok: false,
      message: 'Only admins can make an account an instructor.',
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return { ok: false, message: 'The selected user was not found.' };
  }

  const instructor = await prisma.instructor.findUnique({
    where: { id: instructorId },
  });

  if (!instructor) {
    return {
      ok: false,
      message: 'The selected instructor was not found.',
    };
  }

  if (instructor.userId && instructor.userId !== user.id) {
    return {
      ok: false,
      message: 'That instructor is already connected to another account.',
    };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        role: Role.INSTRUCTOR,
      },
    }),

    prisma.instructor.update({
      where: { id: instructor.id },
      data: {
        userId: user.id,
      },
    }),
  ]);

  return { ok: true };
}

/**
 * Checks whether the signed-in user can manage a material.
 * Admins can manage every material.
 * Instructors can manage materials only for offerings they teach.
 */
async function getMaterialManager(materialId: number) {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return null;
  }

  const material = await prisma.material.findUnique({
    where: { id: materialId },
    include: {
      offering: {
        include: {
          instructor: true,
        },
      },
    },
  });

  if (!material) {
    return null;
  }

  const isAdmin = user.role === Role.ADMIN;

  const teachesOffering =
    user.role === Role.INSTRUCTOR
    && material.offering.instructor.userId === user.id;

  if (!isAdmin && !teachesOffering) {
    return null;
  }

  return {
    user,
    material,
  };
}

/**
 * Marks a material as outdated.
 * Only an admin or the instructor for the material's offering can do this.
 */
export async function markMaterialOutdated(
  materialId: number,
  note: string,
): Promise<InstructorActionResult> {
  const manager = await getMaterialManager(materialId);

  if (!manager) {
    return {
      ok: false,
      message: 'You are not allowed to manage this material.',
    };
  }

  const trimmedNote = note.trim();

  if (!trimmedNote) {
    return {
      ok: false,
      message: 'Please enter a short explanation.',
    };
  }

  if (trimmedNote.length > 300) {
    return {
      ok: false,
      message: 'The explanation must be 300 characters or fewer.',
    };
  }

  await prisma.material.update({
    where: { id: manager.material.id },
    data: {
      outdatedNote: trimmedNote,
      outdatedBy: manager.user.id,
    },
  });

  return { ok: true };
}

/**
 * Removes the outdated label and note from a material.
 */
export async function clearMaterialOutdated(
  materialId: number,
): Promise<InstructorActionResult> {
  const manager = await getMaterialManager(materialId);

  if (!manager) {
    return {
      ok: false,
      message: 'You are not allowed to manage this material.',
    };
  }

  await prisma.material.update({
    where: { id: manager.material.id },
    data: {
      outdatedNote: null,
      outdatedBy: null,
    },
  });

  return { ok: true };
}

export async function toggleSavedCourse() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    redirect('/auth/signin');
  }
}
