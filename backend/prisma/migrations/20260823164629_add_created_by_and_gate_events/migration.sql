-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdById" TEXT;

-- CreateTable
CREATE TABLE "_GateEvents" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_GateEvents_AB_unique" ON "_GateEvents"("A", "B");

-- CreateIndex
CREATE INDEX "_GateEvents_B_index" ON "_GateEvents"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GateEvents" ADD CONSTRAINT "_GateEvents_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GateEvents" ADD CONSTRAINT "_GateEvents_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
