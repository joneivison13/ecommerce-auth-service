-- CreateTable
CREATE TABLE "AuthUser" (
    "id" TEXT NOT NULL,
    "cognitoSub" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "userConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuthUser_cognitoSub_key" ON "AuthUser"("cognitoSub");

-- CreateIndex
CREATE UNIQUE INDEX "AuthUser_username_key" ON "AuthUser"("username");
