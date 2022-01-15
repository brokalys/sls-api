import { Customer } from 'lib/auth';
import { getRoles } from 'lib/permissions';

export function authenticateAs(customerId, server) {
  const initialContext = server.context({});

  jest.spyOn(server, 'context').mockImplementationOnce(() => ({
    ...initialContext,
    invokedFunctionArn: 'arn:aws::::',
    user: new Customer({ customerId }, getRoles(customerId)),
  }));
}
