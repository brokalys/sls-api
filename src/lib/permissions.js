const CUSTOMER_SLS_CRAWLER = 'slsCrawler';
const CUSTOMER_SLS_DATA_EXTRACTION = 'slsDataExtraction';
const CUSTOMER_SLS_STATIC_API = 'slsStaticApi';
const CUSTOMER_MAP_APP = 'mapApp';
const CUSTOMER_CHROME_EXTENSION = 'chromeExtension';

export const PERMISSION_CREATE_PROPERTY = 'CreateProperty';
export const PERMISSION_READ_PROPERTY_DATA = 'ReadPropertyData';
export const PERMISSION_READ_PROPERTY_DATA_DETAILED =
  'ReadPropertyData:Detailed';
export const PERMISSION_READ_UNLIMITED_PROPERTY_DATA = 'ReadUnlimitedData';

export function getRoles(customerId) {
  switch (customerId) {
    case CUSTOMER_SLS_CRAWLER:
    case CUSTOMER_SLS_STATIC_API:
      return [
        PERMISSION_CREATE_PROPERTY,
        PERMISSION_READ_PROPERTY_DATA,
        PERMISSION_READ_PROPERTY_DATA_DETAILED,
        PERMISSION_READ_UNLIMITED_PROPERTY_DATA,
      ];

    case CUSTOMER_SLS_DATA_EXTRACTION:
      return [
        PERMISSION_READ_PROPERTY_DATA,
        PERMISSION_READ_PROPERTY_DATA_DETAILED,
        PERMISSION_READ_UNLIMITED_PROPERTY_DATA,
      ];

    case CUSTOMER_MAP_APP:
      return [PERMISSION_READ_PROPERTY_DATA];

    case CUSTOMER_CHROME_EXTENSION:
      return [PERMISSION_READ_PROPERTY_DATA];
  }

  return [];
}
