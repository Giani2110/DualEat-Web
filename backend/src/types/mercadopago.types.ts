// Interfaces TypeScript para Mercado Pago (usando snake_case)

export interface PreferenceItemRequest {
    id: string;
    title: string;
    description?: string;
    quantity: number;
    unit_price: number;
    currency_id: 'ARS' | 'BRL' | 'USD' | string;
}

export interface PreferencePayerRequest {
    name?: string;
    surname?: string;
    email?: string;
}

export interface PreferenceBackUrlsRequest {
    success?: string;
    failure?: string;
    pending?: string;
}

export interface PreferenceRequest {
    items: PreferenceItemRequest[];
    payer?: PreferencePayerRequest;
    back_urls?: PreferenceBackUrlsRequest;
    notification_url?: string;
    external_reference?: string;
    auto_return?: 'approved' | 'all';
}

export type LocalPlanType = 'LOCAL_MONTHLY' | 'LOCAL_ANNUAL';

export interface PlanDetails {
    frequency: number;
    frequency_type: 'months' | 'years';
    amount: number;
    reason: string;
    currency_id: string;
}