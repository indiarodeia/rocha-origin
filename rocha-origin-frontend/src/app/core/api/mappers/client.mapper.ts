import { Client as UiClient } from '../../models/client.model';
import { PaymentType as UiPaymentType } from '../../models/types.model';
import { Client as ApiClient, SaveClientRequest } from '../models';

export interface ClientUpsertInput {
  companyName: string;
  vatNumber: string;
  phone: string;
  email: string;
  billingStreet?: string;
  billingDoorNumber?: string;
  billingPostalCode?: string;
  billingCity?: string;
  billingCountry?: string;
  paymentTypeId: number;
  notes?: string;
  isActive: boolean;
}

export function mapApiClientToUiClient(apiClient: ApiClient): UiClient {
  return {
    id: apiClient.id,
    companyName: apiClient.companyName,
    vatNumber: apiClient.vatNumber,
    phone: apiClient.phone,
    email: apiClient.email,
    isActive: apiClient.isActive,
    billingAddressId: apiClient.billingAddressId ?? undefined,
    billingStreet: apiClient.billingAddress?.street,
    billingDoorNumber: apiClient.billingAddress?.doorNumber,
    billingPostalCode: apiClient.billingAddress?.postalCode,
    billingCity: apiClient.billingAddress?.city,
    billingCountry: apiClient.billingAddress?.country,
    defaultPaymentTypeId: apiClient.paymentTypeId,
    defaultPaymentTypeLabel: apiClient.paymentType?.label ?? undefined,
    defaultPaymentType: mapApiPaymentTypeLabelToUiKey(apiClient.paymentType?.label),
    notes: apiClient.notes ?? undefined,
    createdAt: apiClient.createdAt,
    updatedAt: apiClient.updatedAt,
  };
}

export function mapClientToSaveClientRequest(client: ClientUpsertInput): SaveClientRequest {
  return {
    companyName: client.companyName.trim(),
    vatNumber: client.vatNumber.trim(),
    phone: client.phone.trim(),
    email: client.email.trim(),
    isActive: client.isActive,
    billingAddress: buildBillingAddress(client),
    notes: toNullableString(client.notes),
    paymentTypeId: client.paymentTypeId,
  };
}

function buildBillingAddress(client: ClientUpsertInput) {
  const street = toNullableString(client.billingStreet);
  const doorNumber = toNullableString(client.billingDoorNumber);
  const postalCode = toNullableString(client.billingPostalCode);
  const city = toNullableString(client.billingCity);
  const country = toNullableString(client.billingCountry);

  if (!street || !doorNumber || !postalCode || !city || !country) {
    return null;
  }

  return {
    street,
    doorNumber,
    postalCode,
    city,
    country,
    isActive: true,
  };
}

function toNullableString(value: string | null | undefined): string | null {
  const trimmed = (value ?? '').trim();
  return trimmed.length > 0 ? trimmed : null;
}

function mapApiPaymentTypeLabelToUiKey(label: string | undefined): UiPaymentType | undefined {
  if (!label) {
    return undefined;
  }

  const normalized = label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

  if (normalized.includes('pronto') || normalized.includes('imediat')) {
    return 'IMMEDIATE';
  }

  if (normalized.includes('credit')) {
    return 'CREDIT';
  }

  if (normalized.includes('conta') || normalized.includes('customer')) {
    return 'CUSTOMER';
  }

  return undefined;
}
