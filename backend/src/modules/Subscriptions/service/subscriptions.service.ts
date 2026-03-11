import { MercadoPagoConfig, Payment, Preference, MerchantOrder } from 'mercadopago';
import { prisma } from "../../../prisma/prisma";
import { PreferenceRequest, PlanDetails, LocalPlanType } from '../../../types/mercadopago.types';
import { SubscriptionPlan, SubscriptionStateMP } from '@prisma/client';

// 1. Inicializar el cliente de Mercado Pago
const config = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || '',
});

const preferenceClient = new Preference(config);
const merchantOrderClient = new MerchantOrder(config);

// Definición de precios (usar montos razonables para pruebas reales)
const MONTHLY_PRICE = 1; // 100 ARS
const ANNUAL_PRICE = 8;  // 800 ARS

// ----------------------------------------------------
// Lógica para obtener detalles del plan
// ----------------------------------------------------
const getPlanDetails = (planType: LocalPlanType): PlanDetails => {
    const currency = 'ARS';

    switch (planType) {
        case 'LOCAL_MONTHLY':
            return {
                frequency: 1,
                frequency_type: 'months',
                amount: MONTHLY_PRICE,
                reason: 'Suscripción Mensual de DualEat para Locales',
                currency_id: currency
            };
        case 'LOCAL_ANNUAL':
            return {
                frequency: 1,
                frequency_type: 'years',
                amount: ANNUAL_PRICE,
                reason: 'Suscripción Anual de DualEat (Pago Total)',
                currency_id: currency
            };
        default:
            throw new Error(`Plan de suscripción no válido: ${planType}`);
    }
}

// ----------------------------------------------------
// Servicio para crear la preferencia de pago (Checkout)
// ----------------------------------------------------
export async function createLocalPreferenceCheckout(userId: string, localId: string, plan: LocalPlanType, payerEmail: string) {
    const planDetails = getPlanDetails(plan);

    const successUrl = `${process.env.CLIENT_URL}/business/payments/success`;
    const failureUrl = `${process.env.CLIENT_URL}/business/payments/failure`;
    const pendingUrl = `${process.env.CLIENT_URL}/business/payments/pending`;
    // USAR la URL tal cual está en env. Debe ser pública (ngrok o dominio)
    const notificationUrl = process.env.NOTIFY_URL!;

    const externalReference = `DUALEAT-TRUE_USER-${userId}_LOCAL-${localId}_PLAN-${plan}_TS-${Date.now()}`;

    let installmentLogic = {};
    if (plan === 'LOCAL_ANNUAL') {
        installmentLogic = {
            installments: 12,
            excluded_payment_types: [{ id: "ticket" }, { id: "atm" }],
        };
    }

    const request: PreferenceRequest = {
        items: [
            {
                id: plan,
                title: planDetails.reason,
                quantity: 1,
                unit_price: planDetails.amount,
                currency_id: planDetails.currency_id,
            }
        ],
        external_reference: externalReference,
        back_urls: {
            success: successUrl,
            failure: failureUrl,
            pending: pendingUrl,
        },
        ...installmentLogic,
        notification_url: notificationUrl,
        payer: {
            email: payerEmail,
        },
    };

    try {
        const response = await preferenceClient.create({ body: request });

        // Determinar si estamos con token de prueba o real
        const isTestToken = Boolean(process.env.MP_ACCESS_TOKEN && process.env.MP_ACCESS_TOKEN.startsWith('TEST-'));

        // Si token de test y existe sandbox_init_point -> usar sandbox_init_point
        if (isTestToken && response.sandbox_init_point) {
            return response.sandbox_init_point;
        }

        // En modo real usar init_point si está disponible
        if (response.init_point) {
            return response.init_point;
        }

        // Fallback: si estamos en test y no hay sandbox init point pero hay init_point, devolver init_point
        if (response.sandbox_init_point) {
            return response.sandbox_init_point;
        }

        throw new Error('No se pudo generar la URL de checkout de Mercado Pago. ID: ' + response.id);
    } catch (error: any) {
        throw new Error(`Error en la API de Mercado Pago: ${error?.message || error}`);
    }
}

// ----------------------------------------------------
// Servicios para el Webhook
// ----------------------------------------------------

/**
 * Obtiene información de un pago desde Mercado Pago con reintentos
 */
export async function getPaymentInfo(paymentId: string, retries = 15, delayMs = 3000) {
    const paymentClient = new Payment(config);

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`[MP API] Intento ${attempt}/${retries} de obtener pago ${paymentId}`);
            const paymentInfo = await paymentClient.get({ id: paymentId });
            console.log(`[MP API] ✅ Pago ${paymentId} obtenido exitosamente - Estado: ${paymentInfo.status}`);
            return paymentInfo;
        } catch (error: any) {
            if (attempt === 1 || attempt === retries) {
                console.error(`[MP API] ❌ Error en intento ${attempt}/${retries}:`, {
                    message: error?.message,
                    status: error?.status,
                    code: error?.cause?.[0]?.code
                });
            }

            if (error?.message && error.message.includes('Payment not found')) {
                if (attempt < retries) {
                    if (attempt === 1) {
                        console.warn(`[MP API] ⏳ Pago ${paymentId} no sincronizado aún. Reintentando...`);
                    }
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                    continue;
                } else {
                    console.warn(`[MP API] ⚠️ Pago ${paymentId} no encontrado después de ${retries} intentos (${(retries * delayMs) / 1000}s).`);
                    return null;
                }
            }

            if (error?.status === 401 || error?.status === 403) {
                console.error(`[MP API] 🔒 Error de autenticación/autorización. Verifica tu Access Token.`);
                throw new Error(`Error de autenticación con Mercado Pago: ${error.message}`);
            }

            if (attempt < retries) {
                await new Promise(resolve => setTimeout(resolve, delayMs));
                continue;
            }

            throw new Error(`Error al obtener la información del pago desde MP: ${error?.message || error}`);
        }
    }

    return null;
}

/**
 * Obtiene información de una orden de mercado desde Mercado Pago con reintentos
 */
export async function getMerchantOrderInfo(merchantOrderId: string, retries = 5, delayMs = 3000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`[MP API] Intento ${attempt}/${retries} de obtener merchant_order ${merchantOrderId}`);
            const orderInfo = await merchantOrderClient.get({ merchantOrderId });
            console.log(`[MP API] ✅ Merchant Order ${merchantOrderId} obtenido exitosamente`);
            return orderInfo;
        } catch (error: any) {
            if (error?.message && (error.message.includes('not found') || error.message.includes('404'))) {
                if (attempt < retries) {
                    console.warn(`[MP API] ⏳ Merchant Order ${merchantOrderId} no encontrado. Reintentando en ${delayMs}ms... (${attempt}/${retries})`);
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                    continue;
                } else {
                    console.warn(`[MP API] ⚠️ Merchant Order ${merchantOrderId} no encontrado después de ${retries} intentos.`);
                    return null;
                }
            }
            throw new Error(`Error al obtener la información de merchant_order desde MP: ${error?.message || error}`);
        }
    }

    return null;
}

/**
 * Procesa un pago aprobado, crea/actualiza el registro de suscripción en la DB.
 */
export async function processPaymentApproval(externalRef: string, paymentId: string) {

    // 1. Parseo robusto de la Referencia Externa
    const dataMap: { [key: string]: string } = {};

    const regex = /(DUALEAT|USER|LOCAL|PLAN|TS)-([A-Za-z0-9_]+)(?=_|$)/g;
    let match;

    while ((match = regex.exec(externalRef)) !== null) {
        dataMap[match[1]] = match[2];
    }

    const userId = dataMap['USER'];
    const localId = dataMap['LOCAL'];
    const plan = dataMap['PLAN'] as SubscriptionPlan;

    // 2. Verificación de integridad de los datos
    if (!userId || !localId || !plan || dataMap['DUALEAT'] !== 'TRUE') {
        console.error(`1. REFERENCIA EXTERNA BRUTA: ${externalRef}`);
        console.error(`2. DATA MAP EXTRAÍDO (FALLA):`, dataMap);
        throw new Error(`Formato de referencia externa incompleto o no válido: ${externalRef}`);
    }

    const existingSubscription = await prisma.subscription.findFirst({
        where: {
            user_id: userId,
            local_id: localId,
            subscription_type: 'LOCAL',
        },
        orderBy: { created_at: 'desc' }
    });

    // ⛔ GESTIÓN DE PAGO DUPLICADO/ACTIVO
    if (existingSubscription && existingSubscription.status === SubscriptionStateMP.active) {
        console.log(`⚠️ Suscripción local para ${localId} ya está activa. Ignorando webhook de pago duplicado.`);
        return null;
    }

    const localPlanType = plan as LocalPlanType;
    const planDetails = getPlanDetails(localPlanType);

    // 3. Determinar las fechas y AUTO_RENEW PREDETERMINADO
    const startDate = new Date();
    const nextPaymentDate = new Date(startDate);
    let auto_renew = false;

    if (plan === SubscriptionPlan.LOCAL_MONTHLY) {
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
        auto_renew = true;
    }
    else if (plan === SubscriptionPlan.LOCAL_ANNUAL) {
        nextPaymentDate.setFullYear(nextPaymentDate.getFullYear() + 1);
        auto_renew = false;
    }

    // 4. Crear/Actualizar la Suscripción (Upsert)
    const subscription = await prisma.subscription.upsert({
        where: {
            user_id_local_id_subscription_type: {
                user_id: userId,
                local_id: localId,
                subscription_type: 'LOCAL',
            }
        },
        update: {
            mp_preapproval_id: paymentId,
            plan: plan,
            amount: planDetails.amount,
            status: SubscriptionStateMP.active,
            start_date: startDate,
            next_payment_date: nextPaymentDate,
            end_date: nextPaymentDate,
            auto_renew: auto_renew,
            updated_at: new Date(),
        },
        create: {
            user_id: userId,
            local_id: localId,
            mp_preapproval_id: paymentId,
            subscription_type: 'LOCAL',
            plan: plan,
            amount: planDetails.amount,
            status: SubscriptionStateMP.active,
            start_date: startDate,
            next_payment_date: nextPaymentDate,
            end_date: nextPaymentDate,
            auto_renew: auto_renew,
        }
    });

    // 5. Actualizar el estado de suscripción del usuario a 'active'
    await prisma.user.update({
        where: { id: userId },
        data: { subscription_status: 'active' }
    });

    console.log(`✅ Suscripción creada/actualizada exitosamente:`, subscription);

    return subscription;
}

/**
 * Obtiene la suscripción activa (o la más reciente) de un local por su ID.
 */
export async function getLocalSubscription(localId: string) {
    if (!localId) {
        throw new Error("Local ID es requerido para obtener la suscripción.");
    }

    const subscription = await prisma.subscription.findFirst({
        where: {
            local_id: localId,
            subscription_type: 'LOCAL',
        },
        orderBy: {
            created_at: 'desc'
        }
    });

    return subscription;
}

/**
 * Cambia el estado de auto_renew para una suscripción.
 */
export async function updateLocalSubscriptionAutoRenew(localId: string, autoRenew: boolean) {
    if (!localId) {
        throw new Error("Local ID es requerido para actualizar la suscripción.");
    }

    const subscription = await prisma.subscription.findFirst({
        where: {
            local_id: localId,
            subscription_type: 'LOCAL',
        },
        orderBy: {
            created_at: 'desc'
        }
    });

    if (!subscription) {
        throw new Error("Suscripción no encontrada para este local.");
    }

    const updatedSubscription = await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
            auto_renew: autoRenew,
            updated_at: new Date(),
        }
    });

    return updatedSubscription;
}
