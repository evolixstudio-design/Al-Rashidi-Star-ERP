import { expect, it } from 'vitest';
import { normalizeKuwaitPhone } from '../../frontend/src/utils/whatsappMessages';

it.each([
  ['9988 7766', '96599887766'], ['+965 99887766', '96599887766'], ['00965 99887766', '96599887766'],
  ['+91 90000 00000', '919000000000'], ['0091 90000 00000', '919000000000'], ['+977 9800000000', '9779800000000'],
  ['', ''], ['123', ''], ['call 99887766', ''], ['1234567890123456', ''],
])('normalizes %s without changing an international country code', (input, expected) => {
  expect(normalizeKuwaitPhone(input)).toBe(expected);
});
