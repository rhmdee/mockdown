import { faker } from '@faker-js/faker';
import { SemanticType, type SchemaColumn } from '@mockdown/schema';

export function generateValueForColumn(column: SchemaColumn): any {
  // If enumValues is provided (e.g. from Prisma enum or schema definition)
  if (column.enumValues && column.enumValues.length > 0) {
    return faker.helpers.arrayElement(column.enumValues);
  }

  switch (column.semanticType) {
    case SemanticType.UUID:
      return faker.string.uuid();
    case SemanticType.Email:
      return faker.internet.email().toLowerCase();
    case SemanticType.FullName:
      return faker.person.fullName();
    case SemanticType.Date:
      return faker.date.recent({ days: 30 }).toISOString();
    case SemanticType.Phone:
      return faker.phone.number({ style: 'international' });
    case SemanticType.PasswordHash:
      // Realistic bcrypt hash format ($2a$12$...)
      return `$2a$12$${faker.string.alphanumeric(53)}`;
    case SemanticType.Role:
      return faker.helpers.arrayElement(['OWNER', 'ADMIN', 'MEMBER']);
    case SemanticType.Status:
      return faker.helpers.arrayElement(['ACTIVE', 'IN_PROGRESS', 'COMPLETED', 'PENDING']);
    case SemanticType.Slug:
      return faker.helpers.slugify(faker.company.name().toLowerCase().replace(/[^a-z0-9 ]/g, ''));
    case SemanticType.Company:
      return faker.company.name();
    case SemanticType.Title:
      return faker.company.catchPhrase();
    case SemanticType.Description:
      return faker.commerce.productDescription();
    case SemanticType.Currency:
      return Number(faker.commerce.price({ min: 100, max: 25000, dec: 2 }));
    case SemanticType.InvoiceCode:
      return `INV-${new Date().getFullYear()}-${faker.string.numeric({ length: 4 })}`;
    case SemanticType.Enum:
      return column.enumValues && column.enumValues.length > 0
        ? faker.helpers.arrayElement(column.enumValues)
        : faker.helpers.arrayElement(['ACTIVE', 'INACTIVE']);
    case SemanticType.Numeric:
      return faker.number.int({ min: 1, max: 1000 });
    case SemanticType.Boolean:
      return faker.datatype.boolean();
    case SemanticType.String:
    default:
      return faker.lorem.words({ min: 1, max: 3 });
  }
}
