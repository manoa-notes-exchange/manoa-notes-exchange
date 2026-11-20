import { Role } from '@prisma/client';
import { hash } from 'bcrypt';
import { prisma } from '../src/lib/prisma';
import * as config from '../config/settings.development.json';

/**
 * Adds the demo accounts, courses, instructors and offerings from
 * config/settings.development.json. Run it with `npm run seed`.
 *
 * Safe to run more than once, on any database (#25):
 * - It only adds rows that are missing. Every upsert has `update: {}`,
 *   so an existing row is never changed. In particular, a demo account
 *   whose password was changed keeps its new password (#38).
 * - Each step waits for the one before it (`for ... of` with `await`),
 *   so offerings are only added after their course and instructor exist.
 */
async function main() {
  console.log('Seeding the database');

  for (const account of config.defaultAccounts) {
    const role = (account.role as Role) || Role.USER;
    console.log(`  User: ${account.email} (${role})`);
    await prisma.user.upsert({
      where: { email: account.email },
      update: {},
      create: {
        email: account.email,
        password: await hash(account.password, 10),
        role,
      },
    });
  }

  // Courses are found by their code, which is unique since #25.
  for (const course of config.defaultCourses) {
    console.log(`  Course: ${course.courseCode}`);
    await prisma.course.upsert({
      where: { courseCode: course.courseCode },
      update: {},
      create: {
        courseCode: course.courseCode,
        courseName: course.courseName,
        rating: course.rating,
      },
    });
  }

  // One offering = one course, one instructor, one semester (#25).
  // ICS 314 in Fall 2026 has two instructors on purpose, so pages get
  // tested with more than one instructor per semester (#33, #26).
  for (const offering of config.defaultOfferings) {
    console.log(`  Offering: ${offering.courseCode}, ${offering.semester}, ${offering.instructor}`);
    const course = await prisma.course.findUniqueOrThrow({
      where: { courseCode: offering.courseCode },
    });
    const instructor = await prisma.instructor.upsert({
      where: { name: offering.instructor },
      update: {},
      create: { name: offering.instructor },
    });
    await prisma.offering.upsert({
      where: {
        courseId_instructorId_semester: {
          courseId: course.id,
          instructorId: instructor.id,
          semester: offering.semester,
        },
      },
      update: {},
      create: {
        courseId: course.id,
        instructorId: instructor.id,
        semester: offering.semester,
      },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
