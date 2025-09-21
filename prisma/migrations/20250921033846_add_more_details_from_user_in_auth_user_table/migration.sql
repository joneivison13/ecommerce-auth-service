/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `AuthUser` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phoneNumber]` on the table `AuthUser` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `AuthUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AuthUser" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "phoneNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "AuthUser_email_key" ON "AuthUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AuthUser_phoneNumber_key" ON "AuthUser"("phoneNumber");
