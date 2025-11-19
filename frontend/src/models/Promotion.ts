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

const daysOptions = DayOfWeekSchema.options;

const BasePromotionSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  active: z.boolean(),
  product: z.array(z.object({ id: z.number(), name: z.string() })).default([]),
  combo: z.array(z.object({ id: z.number(), name: z.string() })).default([]),
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

export const BuyGiveFreePromotionSchema = BasePromotionSchema.extend({
  type: z.literal("BUY_GIVE_FREE"),

  freeProducts: z.array(
    z.object({ id: z.number(), name: z.string() })
  ).default([]),

  freeCombos: z.array(
    z.object({ id: z.number(), name: z.string() })
  ).default([]),

  oneFreePerTrigger: z.boolean(),
});

export const PromotionSchema = z.discriminatedUnion("type", [
  BuyXPayYPromotionSchema,
  PercentagePromotionSchema,
  ThresholdPromotionSchema,
  BuyGiveFreePromotionSchema,
]);

export const PromotionListSchema = z.array(PromotionSchema)
export type Promotion = z.infer<typeof PromotionSchema>;

export type NormalizedPromotion = Promotion & {
  products : Record<number, string>;
  combos : Record<number, string>;
};

const BaseFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  productIds: z.array(z.number()).optional(),
  comboIds: z.array(z.number()).optional(),
  validDays: z.array(DayOfWeekSchema).optional(),
  active: z.boolean().optional(),
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

export const BuyGiveFreeFormSchema = BaseFormSchema.extend({
  type: z.literal("buygivefree"),

  freeProductIds: z.array(z.number()).optional(),
  freeComboIds: z.array(z.number()).optional(),

  oneFreePerTrigger: z.boolean().default(false),
});

export const PromotionFormSchema = z.object({
 name: z.string().min(1, "Name is required"),
 description: z.string().optional(),
 type: z.enum(["buyxpayy", "percentage", "threshold", "buygivefree"]),
 productIds: z.array(z.string()).optional(),
 comboIds: z.array(z.string()).optional(),
validDays: z.array(z.coerce.number())
  .transform((vals) => vals.map(i => daysOptions[i]))
  .optional(),
 buyQuantity: z.coerce.number().optional(),
 payQuantity: z.coerce.number().optional(),
 percentage: z.coerce.number().optional(),
 threshold: z.coerce.number().optional(),
 discountAmount: z.coerce.number().optional(),
 freeProductIds: z.array(z.number()).optional(),
 freeComboIds: z.array(z.number()).optional(),
 oneFreePerTrigger: z.boolean().optional(),
 active: z.boolean().optional(),
})
.superRefine((data, ctx) => {
 if (data.type === 'buyxpayy') {
   if (data.buyQuantity === undefined || data.buyQuantity < 1) {
     ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['buyQuantity'], message: 'Buy quantity is required and must be at least 1' });
   }
   if (data.payQuantity === undefined || data.payQuantity < 0) {
     ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['payQuantity'], message: 'Pay quantity is required' });
   }
 }
 if (data.type === 'percentage') {
   if (data.percentage === undefined || data.percentage < 1 || data.percentage > 100) {
     ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['percentage'], message: 'Percentage is required and must be between 1-100' });
   }
 }
 if (data.type === 'threshold') {
   if (data.threshold === undefined || data.threshold < 1) {
     ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['threshold'], message: 'Threshold is required and must be at least 1' });
   }
   if (data.discountAmount === undefined || data.discountAmount < 1) {
     ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['discountAmount'], message: 'Discount amount is required and must be at least 1' });
   }
 }
 if (data.type === "buygivefree") {
   if (!data.freeProductIds?.length && !data.freeComboIds?.length) {
     ctx.addIssue({
       code: z.ZodIssueCode.custom,
       path: ['freeProductIds'],
       message: 'Must specify at least one free product or free combo',
     });
   }
 }
});

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

const BuyGiveFreeUpdateSchema = BaseUpdateSchema.extend({
  type: z.literal("buygivefree"),

  freeProductIds: z.array(z.number()).optional(),
  freeComboIds: z.array(z.number()).optional(),

  oneFreePerTrigger: z.boolean().optional(),
});

export const PromotionUpdateSchema = z.discriminatedUnion("type", [
  BuyXPayYUpdateSchema,
  PercentageUpdateSchema,
  ThresholdUpdateSchema,
  BuyGiveFreeUpdateSchema,
]);

export type PromotionUpdateRequest = z.infer<typeof PromotionUpdateSchema>;

export function normalizePromotion(p: Promotion): NormalizedPromotion {
  return {
    ...p,
    products: p.product?.reduce((acc, pr) => {
      acc[pr.id] = pr.name;
      return acc;
    }, {} as Record<number, string>) ?? {},
    combos: p.combo?.reduce((acc, co) => {
      acc[co.id] = co.name;
      return acc;
    }, {} as Record<number, string>) ?? {},
  };
}
