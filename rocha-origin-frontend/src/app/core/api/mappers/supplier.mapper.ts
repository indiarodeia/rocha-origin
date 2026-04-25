import { Supplier as ApiSupplier, SaveSupplierRequest } from '../models';
import { Supplier as UiSupplier } from '../../models/supplier.model';

export interface SupplierUpsertInput {
  name: string;
  vatNumber?: string;
  vatRate?: number;
  explorationCode?: string;
  addressStreet?: string;
  addressDoorNumber?: string;
  addressPostalCode?: string;
  addressCity?: string;
  addressCountry?: string;
  phone?: string;
  email?: string;
  certifications?: string;
  isActive: boolean;
}

export function mapApiSupplierToUiSupplier(apiSupplier: ApiSupplier): UiSupplier {
  return {
    id: apiSupplier.id,
    name: apiSupplier.name,
    vatNumber: apiSupplier.vatNumber ?? undefined,
    vatRate: apiSupplier.vatRate ?? undefined,
    explorationCode: apiSupplier.explorationCode ?? undefined,
    addressStreet: apiSupplier.address?.street,
    addressPostalCode: apiSupplier.address?.postalCode,
    addressCity: apiSupplier.address?.city,
    phone: apiSupplier.phone ?? undefined,
    email: apiSupplier.email ?? undefined,
    certifications: apiSupplier.certifications ?? undefined,
    profilePicture: apiSupplier.profilePicture ?? undefined,
    profileJson: apiSupplier.profileJson ?? undefined,
    createdAt: apiSupplier.createdAt,
  };
}

export function mapSupplierToSaveRequest(input: SupplierUpsertInput): SaveSupplierRequest {
  return {
    name: input.name.trim(),
    vatNumber: toNullableString(input.vatNumber),
    vatRate: input.vatRate ?? null,
    explorationCode: toNullableString(input.explorationCode),
    address: buildAddress(input),
    phone: toNullableString(input.phone),
    email: toNullableString(input.email),
    certifications: toNullableString(input.certifications),
    isActive: input.isActive,
  };
}

function buildAddress(input: SupplierUpsertInput) {
  const street = toNullableString(input.addressStreet);
  const postalCode = toNullableString(input.addressPostalCode);
  const city = toNullableString(input.addressCity);

  if (!street || !postalCode || !city) {
    return null;
  }

  return {
    street,
    doorNumber: toNullableString(input.addressDoorNumber) ?? '',
    postalCode,
    city,
    country: toNullableString(input.addressCountry) ?? 'Portugal',
    isActive: true,
  };
}

function toNullableString(value: string | undefined | null): string | null {
  const trimmed = (value ?? '').trim();
  return trimmed.length > 0 ? trimmed : null;
}
