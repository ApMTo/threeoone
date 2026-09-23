-- Drop independent product sizes (stock is now per color + size)
DROP TABLE IF EXISTS "ProductSize";

-- Create color-linked size inventory
CREATE TABLE "ProductColorSize" (
    "id" TEXT NOT NULL,
    "colorId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductColorSize_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProductColorSize_colorId_label_key" ON "ProductColorSize"("colorId", "label");
CREATE INDEX "ProductColorSize_colorId_idx" ON "ProductColorSize"("colorId");

ALTER TABLE "ProductColorSize"
ADD CONSTRAINT "ProductColorSize_colorId_fkey"
FOREIGN KEY ("colorId") REFERENCES "ProductColor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Color quantity moves into per-size rows
ALTER TABLE "ProductColor" DROP COLUMN IF EXISTS "quantity";
