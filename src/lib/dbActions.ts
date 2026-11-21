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
