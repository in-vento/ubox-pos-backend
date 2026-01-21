/**
 * SUNAT Document Sync Controller
 * 
 * Handles synchronization of SUNAT documents from desktop to cloud backend.
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const syncSunatDocument = async (req: Request, res: Response) => {
    try {
        const businessId = req.headers['x-business-id'] as string;
        const { localId, action, data } = req.body;

        if (!businessId) {
            return res.status(400).json({ error: 'Business ID is required' });
        }

        console.log(`[SunatDocumentSync] ${action} for business ${businessId}, localId: ${localId}`);

        if (action === 'CREATE' || action === 'UPDATE') {
            // Upsert SUNAT document
            const sunatDocument = await prisma.sunatDocument.upsert({
                where: {
                    businessId_localId: {
                        businessId,
                        localId
                    }
                },
                update: {
                    documentType: data.documentType,
                    serie: data.serie,
                    correlativo: data.correlativo,
                    fullNumber: data.fullNumber,
                    fechaEmision: new Date(data.fechaEmision),
                    moneda: data.moneda,
                    subtotal: data.subtotal,
                    igv: data.igv,
                    total: data.total,
                    status: data.status,
                    provider: data.provider,
                    hash: data.hash,
                    pdfUrl: data.pdfUrl,
                    xmlUrl: data.xmlUrl,
                    cdrUrl: data.cdrUrl,
                    errorMessage: data.errorMessage,
                    retryCount: data.retryCount,
                    updatedAt: new Date()
                },
                create: {
                    localId,
                    businessId,
                    orderId: data.orderId, // This should be the cloud order ID, not local
                    clientId: data.clientId, // This should be the cloud client ID, not local
                    documentType: data.documentType,
                    serie: data.serie,
                    correlativo: data.correlativo,
                    fullNumber: data.fullNumber,
                    fechaEmision: new Date(data.fechaEmision),
                    moneda: data.moneda,
                    subtotal: data.subtotal,
                    igv: data.igv,
                    total: data.total,
                    status: data.status,
                    provider: data.provider,
                    hash: data.hash,
                    pdfUrl: data.pdfUrl,
                    xmlUrl: data.xmlUrl,
                    cdrUrl: data.cdrUrl,
                    errorMessage: data.errorMessage,
                    retryCount: data.retryCount || 0
                }
            });

            // Sync document items if provided
            if (data.items && data.items.length > 0) {
                // Delete existing items
                await prisma.sunatDocumentItem.deleteMany({
                    where: { documentId: sunatDocument.id }
                });

                // Create new items
                await prisma.sunatDocumentItem.createMany({
                    data: data.items.map((item: any) => ({
                        documentId: sunatDocument.id,
                        descripcion: item.descripcion,
                        cantidad: item.cantidad,
                        valorUnitario: item.valorUnitario,
                        precioUnitario: item.precioUnitario,
                        igv: item.igv,
                        total: item.total
                    }))
                });
            }

            return res.json({ success: true, id: sunatDocument.id });

        } else if (action === 'DELETE') {
            await prisma.sunatDocument.deleteMany({
                where: {
                    businessId,
                    localId
                }
            });

            return res.json({ success: true });
        }

        return res.status(400).json({ error: 'Invalid action' });

    } catch (error: any) {
        console.error('[SunatDocumentSync] Error:', error);
        return res.status(500).json({ error: error.message });
    }
};

export const getSunatDocuments = async (req: Request, res: Response) => {
    try {
        const businessId = req.headers['x-business-id'] as string;

        if (!businessId) {
            return res.status(400).json({ error: 'Business ID is required' });
        }

        const documents = await prisma.sunatDocument.findMany({
            where: { businessId },
            include: {
                items: true,
                client: true
            },
            orderBy: { createdAt: 'desc' },
            take: 100
        });

        return res.json({ success: true, data: documents });

    } catch (error: any) {
        console.error('[SunatDocumentSync] Error:', error);
        return res.status(500).json({ error: error.message });
    }
};
