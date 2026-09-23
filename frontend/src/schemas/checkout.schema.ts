import { z } from "zod";

export const checkoutFormSchema = z.object({
  email: z.string().email("Enter a valid email"),
  emailNews: z.boolean(),
  country: z.string().min(2, "Country is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  company: z.string().optional(),
  line1: z.string().min(1, "Address is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "ZIP code is required"),
  phone: z.string().min(5, "Phone is required"),
  textNews: z.boolean(),
  discountCode: z.string().optional(),
});

export type CheckoutFormInput = z.infer<typeof checkoutFormSchema>;

export function toShippingAddressPayload(values: CheckoutFormInput) {
  return {
    fullName: `${values.firstName.trim()} ${values.lastName.trim()}`.trim(),
    phone: values.phone.trim(),
    company: values.company?.trim() || undefined,
    line1: values.line1.trim(),
    line2: values.line2?.trim() || undefined,
    city: values.city.trim(),
    state: values.state.trim() || undefined,
    postalCode: values.postalCode.trim(),
    country: values.country.trim(),
  };
}

/** @deprecated Prefer checkoutFormSchema for the storefront checkout UI */
export const shippingAddressSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().min(5, "Phone is required"),
  line1: z.string().min(1, "Address is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
});

export const checkoutSchema = z.object({
  shippingAddress: shippingAddressSchema,
  shippingMethodId: z.string().min(1, "Select a shipping method"),
  notes: z.string().max(500).optional(),
});

export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
