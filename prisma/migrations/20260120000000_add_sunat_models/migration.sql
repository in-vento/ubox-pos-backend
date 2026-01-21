-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "localId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "tipoDoc" TEXT NOT NULL,
    "numDoc" TEXT NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "direccion" TEXT,
    "email" TEXT,
    "telefono" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sunat_documents" (
    "id" TEXT NOT NULL,
    "localId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "clientId" TEXT,
    "documentType" TEXT NOT NULL,
    "serie" TEXT NOT NULL,
    "correlativo" INTEGER NOT NULL,
    "fullNumber" TEXT NOT NULL,
    "fechaEmision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "moneda" TEXT NOT NULL DEFAULT 'PEN',
    "subtotal" DOUBLE PRECISION NOT NULL,
    "igv" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "provider" TEXT,
    "hash" TEXT,
    "pdfUrl" TEXT,
    "xmlUrl" TEXT,
    "cdrUrl" TEXT,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sunat_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sunat_document_items" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cantidad" DOUBLE PRECISION NOT NULL,
    "valorUnitario" DOUBLE PRECISION NOT NULL,
    "precioUnitario" DOUBLE PRECISION NOT NULL,
    "igv" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "sunat_document_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_sunat_configs" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "sunatEnabled" BOOLEAN NOT NULL DEFAULT false,
    "provider" TEXT NOT NULL DEFAULT 'mock',
    "ruc" TEXT,
    "razonSocial" TEXT,
    "nombreComercial" TEXT,
    "direccion" TEXT,
    "ubigeo" TEXT,
    "departamento" TEXT,
    "provincia" TEXT,
    "distrito" TEXT,
    "regimen" TEXT,
    "serieFactura" TEXT NOT NULL DEFAULT 'F001',
    "serieBoleta" TEXT NOT NULL DEFAULT 'B001',
    "correlativoFactura" INTEGER NOT NULL DEFAULT 0,
    "correlativoBoleta" INTEGER NOT NULL DEFAULT 0,
    "pseToken" TEXT,
    "pseUrl" TEXT,
    "pseRucUsuario" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_sunat_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clients_businessId_numDoc_key" ON "clients"("businessId", "numDoc");

-- CreateIndex
CREATE INDEX "sunat_documents_orderId_idx" ON "sunat_documents"("orderId");

-- CreateIndex
CREATE INDEX "sunat_documents_status_idx" ON "sunat_documents"("status");

-- CreateIndex
CREATE UNIQUE INDEX "sunat_documents_businessId_localId_key" ON "sunat_documents"("businessId", "localId");

-- CreateIndex
CREATE UNIQUE INDEX "company_sunat_configs_businessId_key" ON "company_sunat_configs"("businessId");

-- AddForeignKey
ALTER TABLE "sunat_documents" ADD CONSTRAINT "sunat_documents_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sunat_documents" ADD CONSTRAINT "sunat_documents_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sunat_document_items" ADD CONSTRAINT "sunat_document_items_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "sunat_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_sunat_configs" ADD CONSTRAINT "company_sunat_configs_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
