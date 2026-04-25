import { Establishment as UiEstablishment } from '../../models/establishment.model';
import { SaveEstablishmentRequest, Establishment as ApiEstablishment } from '../models';
import { buildRouteUiId } from './route.mapper';

export interface EstablishmentUpsertInput {
  clientId: string;
  name: string;
  deliveryStreet?: string;
  deliveryDoorNumber?: string;
  deliveryPostalCode?: string;
  deliveryCity?: string;
  deliveryCountry?: string;
  routeId?: string;
  localContactPhone?: string;
  isActive: boolean;
}

export function mapApiEstablishmentToUiEstablishment(apiEstablishment: ApiEstablishment): UiEstablishment {
  return {
    id: apiEstablishment.id,
    clientId: apiEstablishment.clientId,
    clientName: apiEstablishment.client?.companyName,
    name: apiEstablishment.name,
    isActive: apiEstablishment.isActive,
    deliveryAddressId: apiEstablishment.deliveryAddressId ?? undefined,
    deliveryStreet: apiEstablishment.deliveryAddress?.street ?? '',
    deliveryDoorNumber: apiEstablishment.deliveryAddress?.doorNumber,
    deliveryPostalCode: apiEstablishment.deliveryAddress?.postalCode ?? '',
    deliveryCity: apiEstablishment.deliveryAddress?.city ?? '',
    deliveryCountry: apiEstablishment.deliveryAddress?.country,
    routeId: apiEstablishment.route?.name ? buildRouteUiId(apiEstablishment.route.name) : undefined,
    apiRouteId: apiEstablishment.routeId ?? undefined,
    routeName: apiEstablishment.route?.name ?? undefined,
    localContactPhone: apiEstablishment.localContactPhone ?? undefined,
    createdAt: apiEstablishment.createdAt,
    updatedAt: apiEstablishment.updatedAt,
    menuItems: apiEstablishment.establishmentMenuItems?.map((item) => ({
      id: item.id,
      establishmentId: item.establishmentId,
      name: item.name,
      description: item.description ?? undefined,
      isActive: item.isActive,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    })),
  };
}

export function mapEstablishmentToSaveRequest(
  establishment: EstablishmentUpsertInput,
): SaveEstablishmentRequest {
  return {
    clientId: establishment.clientId,
    name: establishment.name.trim(),
    isActive: establishment.isActive,
    deliveryAddress: buildDeliveryAddress(establishment),
    routeId: toNullableString(establishment.routeId),
    localContactPhone: toNullableString(establishment.localContactPhone),
  };
}

function buildDeliveryAddress(establishment: EstablishmentUpsertInput) {
  const street = toNullableString(establishment.deliveryStreet);
  const doorNumber = toNullableString(establishment.deliveryDoorNumber);
  const postalCode = toNullableString(establishment.deliveryPostalCode);
  const city = toNullableString(establishment.deliveryCity);
  const country = toNullableString(establishment.deliveryCountry);

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
