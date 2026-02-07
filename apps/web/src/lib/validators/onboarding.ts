import { z } from "zod/v4";

export const companyInfoSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  industry: z.string().min(1, "Please select an industry"),
  companySize: z.string().min(1, "Please select a company size"),
});

export const locationSchema = z.object({
  locationName: z.string().min(2, "Location name must be at least 2 characters"),
  address: z.string().optional(),
  city: z.string().min(1, "City is required"),
  timezone: z.string().min(1, "Please select a timezone"),
});

export const onboardingSchema = companyInfoSchema.merge(locationSchema);

export type CompanyInfoValues = z.infer<typeof companyInfoSchema>;
export type LocationValues = z.infer<typeof locationSchema>;
export type OnboardingValues = z.infer<typeof onboardingSchema>;
