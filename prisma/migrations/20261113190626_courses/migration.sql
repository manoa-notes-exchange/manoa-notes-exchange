-- CreateTable
CREATE TABLE "Course" (
    "id" SERIAL NOT NULL,
    "courseCode" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "rating" DECIMAL(65,30) NOT NULL DEFAULT 5.0,
    "instructor" TEXT[],
    "semester" TEXT[],

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);
