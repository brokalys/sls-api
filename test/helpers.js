import { getRoles } from 'lib/permissions';

export function authenticateAs(customerId, server) {
  const initialContext = server.context({});

  jest.spyOn(server, 'context').mockImplementationOnce(() => ({
    ...initialContext,
    invokedFunctionArn: 'arn:aws::::',
    user: {
      apiKey: { customerId },
      hasRole: (role) => {
        return getRoles(customerId).includes(role);
      },
    },
  }));
}
