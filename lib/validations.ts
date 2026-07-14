import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const productSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().optional().nullable(),
  price: z.number().min(0),
  costPrice: z.number().min(0).optional().default(0),
  stock: z.number().int().min(0),
  lowStockThreshold: z.number().int().min(0).optional(),
  category: z.string().min(2),
  image: z.string().url().optional().nullable(),
  isFeatured: z.boolean().optional(),
});

export const promoSchema = z.object({
  code: z.string().min(3).max(30),
  discountType: z.enum(["PERCENTAGE", "FLAT"]),
  discountPercent: z.number().min(1).max(100).optional().nullable(),
  flatDiscountAmount: z.number().min(1).optional().nullable(),
  isActive: z.boolean().optional(),
  maxUses: z.number().int().min(1).optional().nullable(),
  minOrderValue: z.number().min(0).optional().nullable(),
  maxDiscountAmount: z.number().min(0).optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
});

export const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional().nullable(),
});

export const checkoutSchema = z.object({
  paymentMethod: z.enum(["COD", "RAZORPAY"]),
  promoCode: z.string().optional().nullable(),
  shippingDetails: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10),
    address: z.string().min(5),
    city: z.string().min(2),
    state: z.string().min(2),
    zip: z.string().min(4),
  }).optional(),
  items: z.array(z.object({
    id: z.string(),
    quantity: z.number().int().min(1)
  })).min(1, "Cart cannot be empty")
});
