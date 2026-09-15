export const MAX_ADDRESS_LENGTH = 250;

export function buildFullAddress(form: { division: string; district: string; zip: string; street: string; house: string }): string {
  const districtPart = form.zip ? `${form.district}-${form.zip}` : form.district;
  return [form.house, form.street, districtPart, form.division].filter(Boolean).join(", ");
}

export function isAddressTooLong(address: string): boolean {
  return address.length > MAX_ADDRESS_LENGTH;
}
