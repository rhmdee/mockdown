import { faker } from '@faker-js/faker';
import { SemanticType, SchemaColumn } from '@mockdown/schema';

export function generateValueForColumn(column: SchemaColumn): any {
  switch (column.semanticType) {
    case SemanticType.UUID:
      return faker.string.uuid();
    case SemanticType.Email:
      return faker.internet.email();
    case SemanticType.FullName:
      return faker.person.fullName();
    case SemanticType.Date:
      return faker.date.recent().toISOString();
    case SemanticType.Phone:
      return faker.phone.number({ style: 'international' });
    case SemanticType.Numeric:
      return faker.number.int({ min: 1, max: 10000 });
    case SemanticType.Boolean:
      return faker.datatype.boolean();
    case SemanticType.String:
    default:
      return faker.lorem.word();
  }
}
