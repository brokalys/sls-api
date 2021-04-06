export const CUSTOMER_SLS_CRAWLER = 'slsCrawler';
export const CUSTOMER_SLS_DATA_EXTRACTION = 'slsDataExtraction';
export const CUSTOMER_SLS_STATIC_API = 'slsStaticApi';
export const CUSTOMER_MAP_APP = 'mapApp';

export const PERMISSION_CREATE_PROPERTY = 'create-property';
export const PERMISSION_GET_DETAILED_PROPERTY_DATA =
  'get-detailed-property-data';
export const PERMISSION_GET_BASIC_PROPERTY_DATA = 'get-basic-property-data';

export function hasPermission(customerId, permission) {
  switch (customerId) {
    case CUSTOMER_SLS_CRAWLER:
    case CUSTOMER_SLS_STATIC_API:
      return [
        PERMISSION_CREATE_PROPERTY,
        PERMISSION_GET_DETAILED_PROPERTY_DATA,
      ].includes(permission);

    case CUSTOMER_SLS_DATA_EXTRACTION:
      return [PERMISSION_GET_DETAILED_PROPERTY_DATA].includes(permission);

    case CUSTOMER_MAP_APP:
      return [PERMISSION_GET_BASIC_PROPERTY_DATA].includes(permission);
  }

  return false;
}
