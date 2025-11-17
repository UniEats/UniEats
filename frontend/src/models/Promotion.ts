import { z } from "zod";

export const DayOfWeekSchema = z.enum([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]);

const BasePromotionSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  active: z.boolean(),
  product: z.array(z.object({ id: z.number() })).default([]),
  combo: z.array(z.object({ id: z.number() })).default([]),
  validDays: z.array(DayOfWeekSchema),
});

export const BuyXPayYPromotionSchema = BasePromotionSchema.extend({
  type: z.literal("BUYX_PAYY"),
  buyQuantity: z.number(),
  payQuantity: z.number(),
});

export const PercentagePromotionSchema = BasePromotionSchema.extend({
  type: z.literal("PERCENTAGE"),
  percentage: z.number(),
});

export const ThresholdPromotionSchema = BasePromotionSchema.extend({
  type: z.literal("THRESHOLD"),
  threshold: z.number(),
  discountAmount: z.number(),
});

export const PromotionSchema = z.discriminatedUnion("type", [
  BuyXPayYPromotionSchema,
  PercentagePromotionSchema,
  ThresholdPromotionSchema,
]);

export const PromotionListSchema = z.array(PromotionSchema)

export type Promotion = z.infer<typeof PromotionSchema>;
export type NormalizedPromotion = Promotion & {
  productIds: number[];
  comboIds: number[];
};

const BaseFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  productIds: z.array(z.number()).optional(),
  comboIds: z.array(z.number()).optional(),
  validDays: z.array(DayOfWeekSchema).optional(),
});

export const BuyXPayYFormSchema = BaseFormSchema.extend({
  type: z.literal("buyxpayy"),
  buyQuantity: z.number().min(1, "Buy quantity must be at least 1"),
  payQuantity: z.number().min(0, "Pay quantity must be non-negative"),
});

export const PercentageFormSchema = BaseFormSchema.extend({
  type: z.literal("percentage"),
  percentage: z.number().min(1, "Percentage must be at least 1").max(100, "Percentage cannot exceed 100"),
});

export const ThresholdFormSchema = BaseFormSchema.extend({
  type: z.literal("threshold"),
  threshold: z.number().min(1, "Threshold must be at least 1"),
  discountAmount: z.number().min(1, "Discount must be at least 1"),
});

export const PromotionFormSchema = z.discriminatedUnion("type", [
  BuyXPayYFormSchema,
  PercentageFormSchema,
  ThresholdFormSchema,
]);

export type PromotionFormValues = z.infer<typeof PromotionFormSchema>;

export type PromotionCreateRequest = PromotionFormValues;

const BaseUpdateSchema = BaseFormSchema.partial();

const BuyXPayYUpdateSchema = BaseUpdateSchema.extend({
  type: z.literal("buyxpayy"),
  buyQuantity: z.number().min(1).optional(),
  payQuantity: z.number().min(0).optional(),
});

const PercentageUpdateSchema = BaseUpdateSchema.extend({
  type: z.literal("percentage"),
  percentage: z.number().min(1).max(100).optional(),
});

const ThresholdUpdateSchema = BaseUpdateSchema.extend({
  type: z.literal("threshold"),
  threshold: z.number().min(1).optional(),
  discountAmount: z.number().min(1).optional(),
});

export const PromotionUpdateSchema = z.discriminatedUnion("type", [
  BuyXPayYUpdateSchema,
  PercentageUpdateSchema,
  ThresholdUpdateSchema,
]);

export type PromotionUpdateRequest = z.infer<typeof PromotionUpdateSchema>;

export function normalizePromotion(p: Promotion): NormalizedPromotion {
  return {
    ...p,
    productIds: p.product?.map(pr => pr.id) ?? [],
    comboIds: p.combo?.map(co => co.id) ?? [],
  };
}
