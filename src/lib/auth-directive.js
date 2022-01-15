import { AuthenticationError } from 'apollo-server-lambda';
import { defaultFieldResolver } from 'graphql';
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';

const ANY_ROLE = 'authorized';

export default function authDirectiveTransformer(schema, directiveName) {
  function applyDirective(fieldConfig) {
    const [authDirective] =
      getDirective(schema, fieldConfig, directiveName) || [];

    if (!authDirective) {
      return fieldConfig;
    }

    const { resolve = defaultFieldResolver } = fieldConfig;

    fieldConfig.resolve = async function (source, args, context, info) {
      const requiredRole = authDirective.requires || ANY_ROLE;

      if (!requiredRole) {
        return resolve(source, args, context, info);
      }

      if (!context.user) {
        throw new AuthenticationError('Unauthenticated');
      }

      if (requiredRole === ANY_ROLE) {
        return resolve(source, args, context, info);
      }

      if (!context.user.hasRole(requiredRole)) {
        throw new AuthenticationError(
          `You need following role: ${requiredRole}`,
        );
      }

      return resolve(source, args, context, info);
    };
  }

  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: applyDirective,
    [MapperKind.FIELD_DEFINITION]: applyDirective,
  });
}
