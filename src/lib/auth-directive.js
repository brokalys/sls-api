import {
  AuthenticationError,
  SchemaDirectiveVisitor,
} from 'apollo-server-lambda';
import { defaultFieldResolver } from 'graphql';

const ANY_ROLE = 'authorized';

class AuthDirective extends SchemaDirectiveVisitor {
  visitObject(type) {
    this.ensureFieldsWrapped(type);
    type._requiredAuthRole = this.args.requires || ANY_ROLE;
  }

  visitFieldDefinition(field, details) {
    this.ensureFieldsWrapped(details.objectType);
    field._requiredAuthRole = this.args.requires || ANY_ROLE;
  }

  ensureFieldsWrapped(objectType) {
    if (objectType._authFieldsWrapped) return;
    objectType._authFieldsWrapped = true;

    const fields = objectType.getFields();

    Object.keys(fields).forEach((fieldName) => {
      const field = fields[fieldName];
      const { resolve = defaultFieldResolver } = field;

      field.resolve = async function (...args) {
        const requiredRole =
          field._requiredAuthRole || objectType._requiredAuthRole;

        if (!requiredRole) {
          return resolve.apply(this, args);
        }

        const context = args[2];

        if (!context.user) {
          throw new AuthenticationError('Unauthenticated');
        }

        if (requiredRole === ANY_ROLE) {
          return resolve.apply(this, args);
        }

        if (!context.user.hasRole(requiredRole)) {
          throw new AuthenticationError(
            `You need following role: ${requiredRole}`,
          );
        }

        return resolve.apply(this, args);
      };
    });
  }
}

export default AuthDirective;
