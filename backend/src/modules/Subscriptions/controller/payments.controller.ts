import { Request, Response } from 'express';
import { createLocalPreferenceCheckout, getPaymentInfo, processPaymentApproval, getLocalSubscription, updateLocalSubscriptionAutoRenew, getMerchantOrderInfo } from '../service/subscriptions.service';
import { LocalPlanType } from '../../../types/mercadopago.types';

// ----------------------------------------------------
// Manejador del Checkout (POST /local-checkout)
// ----------------------------------------------------
export async function handleLocalSubscriptionCheckout(req: Request, res: Response) {
    const {
        userId,
        payerEmail,
        localId,
        plan
    } = req.body;

    if (!userId || !localId || !plan || !payerEmail) {
        return res.status(400).json({
            message: 'Faltan datos requeridos: userId, localId, plan, o payerEmail.'
        });
    }

    if (plan !== 'LOCAL_MONTHLY' && plan !== 'LOCAL_ANNUAL') {
        return res.status(400).json({ message: 'El plan seleccionado no es válido.' });
    }

    try {
        const checkoutUrl = await createLocalPreferenceCheckout(userId, localId, plan as LocalPlanType, payerEmail);

        return res.status(200).json({
            success: true,
            checkoutUrl,
            message: 'URL de checkout generada con éxito.'
        });
    } catch (error) {
        console.error('Error al procesar la solicitud de suscripción:', error);
        const errorMessage = (error as Error).message || 'Error interno al comunicarse con Mercado Pago.';
        return res.status(500).json({
            message: errorMessage
        });
    }
}

// ----------------------------------------------------
// Manejador de Webhook (POST /payments/mercadopago/notification)
// ----------------------------------------------------
export async function handlePaymentNotification(req: Request, res: Response) {
    const topicFromQuery = req.query.topic || req.query.type;
    const topicFromBody = req.body?.topic || req.body?.type;
    const topic = topicFromQuery || topicFromBody;

    console.log('WEBHOOK RECIBIDO. Contenido completo:', JSON.stringify({
        query: req.query,
        body: req.body
    }, null, 2));

    if (!topic) {
        console.log('⚠️ Webhook recibido sin topic/type - ignorando');
        return res.sendStatus(200);
    }

    const notificationTopic = topic.toString();

    try {
        // CASO 1: Notificación de MERCHANT_ORDER
        if (notificationTopic === 'merchant_order') {
            const merchantOrderId = req.query.id?.toString() || req.body?.data?.id || req.body?.id;

            if (!merchantOrderId) {
                console.log('⚠️ merchant_order sin ID');
                return res.sendStatus(200);
            }

            console.log(`📦 Procesando Merchant Order ID: ${merchantOrderId}`);

            // Reintentar obtener merchant order con delays
            const merchantOrderInfo = await getMerchantOrderInfo(merchantOrderId, 5, 3000);

            if (!merchantOrderInfo) {
                console.log(`[SYNC FAIL] No se pudo obtener merchant_order ${merchantOrderId}`);
                return res.sendStatus(200);
            }

            console.log(`Merchant Order - Status: ${merchantOrderInfo.order_status}, Payments:`, merchantOrderInfo.payments);

            // Si el merchant order aún no tiene pagos, esperar
            if (!merchantOrderInfo.payments || merchantOrderInfo.payments.length === 0) {
                console.log(`⏳ Merchant order ${merchantOrderId} aún sin pagos. MP reenviará cuando se procese.`);
                return res.sendStatus(200);
            }

            // Verificar si hay pagos aprobados en la orden
            const approvedPayment = merchantOrderInfo.payments?.find((p: any) => p.status === 'approved');

            if (approvedPayment?.id && merchantOrderInfo.external_reference) {
                const paymentIdStr = approvedPayment.id.toString();
                console.log('✅ Pago aprobado encontrado en merchant_order:', paymentIdStr);
                await processPaymentApproval(merchantOrderInfo.external_reference, paymentIdStr);
                console.log(`✅ Suscripción activada para ref: ${merchantOrderInfo.external_reference}`);
            } else {
                console.log(`⏳ Merchant order con pagos pero ninguno aprobado aún. Estado: ${merchantOrderInfo.order_status}`);
            }

            return res.sendStatus(200);
        }

        // CASO 2: Notificación de PAYMENT (flujo original)
        if (notificationTopic === 'payment') {
            const paymentId = req.body?.data?.id || req.query['data.id'] || req.query.id?.toString();

            if (!paymentId) {
                console.log('⚠️ payment sin ID');
                return res.sendStatus(200);
            }

            console.log(`💳 Procesando Payment ID: ${paymentId}`);

            // En sandbox, aumentamos reintentos porque la sincronización es lenta
            const paymentInfo = await getPaymentInfo(paymentId.toString(), 15, 3000);

            if (!paymentInfo) {
                console.log(`⏳ Pago ${paymentId} aún no disponible. MP reenviará webhook de merchant_order.`);
                return res.sendStatus(200);
            }

            console.log(`MP Info: Estado ${paymentInfo.status}, ID: ${paymentId}`);

            if (paymentInfo.status === 'approved' && paymentInfo.external_reference) {
                console.log('✅ ESTADO APROBADO. Ejecutando lógica de DB...');
                await processPaymentApproval(paymentInfo.external_reference as string, paymentId.toString());
                console.log(`✅ Pago aprobado y suscripción activada para ref: ${paymentInfo.external_reference}`);
            } else {
                console.log(`🚫 Pago no aprobado. Estado: ${paymentInfo.status}. ID: ${paymentId}. DB no actualizada.`);
            }

            return res.sendStatus(200);
        }

        console.log(`ℹ️ Topic no manejado: ${notificationTopic}`);
        return res.sendStatus(200);

    } catch (error) {
        console.error(`🚨 Error fatal al procesar el Webhook de MP:`, error);
        return res.sendStatus(500);
    }
}

// ----------------------------------------------------
// Manejador de Redirección (GET /payments/mercadopago/verify)
// ----------------------------------------------------
export async function verifyPayment(req: Request, res: Response) {
    const { payment_id, collection_status } = req.query;

    if (collection_status === 'approved') {
        return res.redirect(`${process.env.CLIENT_URL}/business/dashboard?status=success&payment_id=${payment_id}`);
    } else if (collection_status === 'pending') {
        return res.redirect(`${process.env.CLIENT_URL}/business/dashboard?status=pending&payment_id=${payment_id}`);
    } else {
        return res.redirect(`${process.env.CLIENT_URL}/business/dashboard?status=failure`);
    }
}

// ----------------------------------------------------
// Manejador para obtener la suscripción (GET /local/:localId)
// ----------------------------------------------------
export async function handleGetLocalSubscription(req: Request, res: Response) {
    const { localId } = req.params;

    if (!localId) {
        return res.status(400).json({ message: 'Local ID es requerido.' });
    }

    try {
        const subscription = await getLocalSubscription(localId);

        if (!subscription) {
            return res.status(200).json(null);
        }

        return res.status(200).json(subscription);
    } catch (error) {
        console.error('Error al obtener la suscripción:', error);
        return res.status(500).json({ message: 'Error interno al obtener la suscripción.' });
    }
}

// ----------------------------------------------------
// Manejador para actualizar auto_renew (PUT /local/toggle-renew)
// ----------------------------------------------------
export async function handleToggleAutoRenew(req: Request, res: Response) {
    const { localId, autoRenew } = req.body;

    if (!localId || typeof autoRenew !== 'boolean') {    
        return res.status(400).json({ message: 'Local ID y autoRenew (boolean) son requeridos.' });
    }

    try {
        const updatedSubscription = await updateLocalSubscriptionAutoRenew(localId, autoRenew);

        return res.status(200).json(updatedSubscription);
    } catch (error: any) {
        console.error('Error al actualizar auto-renew:', error);
        return res.status(500).json({ message: error.message });   
    }
}
