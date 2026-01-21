/**
 * Client Sync Controller
 * 
 * Handles synchronization of clients from desktop to cloud backend.
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const syncClient = async (req: Request, res: Response) => {
    try {
        const businessId = req.headers['x-business-id'] as string;
        const { localId, action, data } = req.body;

        if (!businessId) {
            return res.status(400).json({ error: 'Business ID is required' });
        }

        console.log(`[ClientSync] ${action} for business ${businessId}, localId: ${localId}`);

        if (action === 'CREATE' || action === 'UPDATE') {
            const client = await prisma.client.upsert({
                where: {
                    businessId_numDoc: {
                        businessId,
                        numDoc: data.numDoc
                    }
                },
                update: {
                    tipoDoc: data.tipoDoc,
                    razonSocial: data.razonSocial,
                    direccion: data.direccion,
                    email: data.email,
                    telefono: data.telefono,
                    updatedAt: new Date()
                },
                create: {
                    localId,
                    businessId,
                    tipoDoc: data.tipoDoc,
                    numDoc: data.numDoc,
                    razonSocial: data.razonSocial,
                    direccion: data.direccion,
                    email: data.email,
                    telefono: data.telefono
                }
            });

            return res.json({ success: true, id: client.id });

        } else if (action === 'DELETE') {
            await prisma.client.deleteMany({
                where: {
                    businessId,
                    localId
                }
            });

            return res.json({ success: true });
        }

        return res.status(400).json({ error: 'Invalid action' });

    } catch (error: any) {
        console.error('[ClientSync] Error:', error);
        return res.status(500).json({ error: error.message });
    }
};

export const getClients = async (req: Request, res: Response) => {
    try {
        const businessId = req.headers['x-business-id'] as string;

        if (!businessId) {
            return res.status(400).json({ error: 'Business ID is required' });
        }

        const clients = await prisma.client.findMany({
            where: { businessId },
            orderBy: { createdAt: 'desc' },
            take: 100
        });

        return res.json({ success: true, data: clients });

    } catch (error: any) {
        console.error('[ClientSync] Error:', error);
        return res.status(500).json({ error: error.message });
    }
};
