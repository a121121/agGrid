-- CreateTable
CREATE TABLE "Kit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "partNumber" TEXT NOT NULL,
    "noun" TEXT NOT NULL,
    "kitName" TEXT NOT NULL,
    "stateStatus" TEXT NOT NULL,
    "currentStatus" TEXT,
    "remarks" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "form48number" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "shopName" TEXT NOT NULL,
    "dieRequired" BOOLEAN NOT NULL,
    "dieNumber" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" DATETIME NOT NULL DEFAULT '9999-12-31 23:59:59',
    "originalKitId" INTEGER NOT NULL DEFAULT -1
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kitId" INTEGER NOT NULL,
    "userName" TEXT NOT NULL,
    "changedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL,
    "field" TEXT NOT NULL,
    "oldValue" TEXT NOT NULL,
    "newValue" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Kit_partNumber_idx" ON "Kit"("partNumber");

-- CreateIndex
CREATE INDEX "Kit_kitName_idx" ON "Kit"("kitName");

-- CreateIndex
CREATE INDEX "Kit_stateStatus_idx" ON "Kit"("stateStatus");

-- CreateIndex
CREATE INDEX "Kit_createdAt_idx" ON "Kit"("createdAt");

-- CreateIndex
CREATE INDEX "Kit_originalKitId_createdAt_idx" ON "Kit"("originalKitId", "createdAt");

-- CreateIndex
CREATE INDEX "Kit_originalKitId_version_idx" ON "Kit"("originalKitId", "version");

-- CreateIndex
CREATE INDEX "AuditLog_kitId_idx" ON "AuditLog"("kitId");

-- CreateIndex
CREATE INDEX "AuditLog_changedAt_idx" ON "AuditLog"("changedAt");

-- CreateIndex
CREATE INDEX "AuditLog_kitId_changedAt_idx" ON "AuditLog"("kitId", "changedAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
