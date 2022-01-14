import { createTestClient } from 'apollo-server-testing';
import { server } from 'handler';
import Bugsnag from 'lib/bugsnag';

jest.mock('lib/bugsnag');

const mockInput = {
  type: 'bug-report',
  message: 'Hello World!',
  email: 'demo@example.com',
};

const { mutate } = createTestClient(server);

const MUTATION = `
mutation ChromeExtension_SubmitFeedback(
    $type: String!
    $message: String!
    $email: String
  ) {
    submitFeedback(
      type: $type
      message: $message
      email: $email
    )
  }
`;

describe('Mutation: submitFeedback', () => {
  test('successfully submits the feedback to Bugsnag', async () => {
    const response = await mutate({
      mutation: MUTATION,
      variables: {
        ...mockInput,
      },
    });

    expect(response).toMatchSnapshot();
    expect(Bugsnag.notify).toHaveBeenCalled();
  });
});
