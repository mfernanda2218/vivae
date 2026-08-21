ALTER TABLE "Ticket" ADD COLUMN "qrToken" TEXT;

CREATE UNIQUE INDEX "Ticket_qrToken_key" ON "Ticket"("qrToken");
