import prisma from "@/lib/prisma";

/**
 * Basic Database-backed Rate Limiter
 * Useful for Vercel Hobby environments where in-memory maps reset too often and Redis isn't configured.
 */
export async function checkRateLimit(identifier: string, limit: number, windowMinutes: number): Promise<{ success: boolean; remaining: number }> {
  try {
    const now = new Date();

    // Find existing rate limit record
    let record = await prisma.rateLimit.findUnique({
      where: { identifier },
    });

    if (!record) {
      // First time tracking this identifier
      const resetAt = new Date(now.getTime() + windowMinutes * 60000);
      await prisma.rateLimit.create({
        data: {
          identifier,
          count: 1,
          resetAt,
        },
      });
      return { success: true, remaining: limit - 1 };
    }

    if (now > record.resetAt) {
      // Window expired, reset count
      const resetAt = new Date(now.getTime() + windowMinutes * 60000);
      await prisma.rateLimit.update({
        where: { id: record.id },
        data: {
          count: 1,
          resetAt,
        },
      });
      return { success: true, remaining: limit - 1 };
    }

    if (record.count >= limit) {
      // Rate limit exceeded
      return { success: false, remaining: 0 };
    }

    // Increment count
    await prisma.rateLimit.update({
      where: { id: record.id },
      data: {
        count: { increment: 1 },
      },
    });

    return { success: true, remaining: limit - record.count - 1 };

  } catch (error) {
    console.error("Rate Limiter Error:", error);
    // Fail open if database rate limiting fails (to not block legit users during DB issues)
    return { success: true, remaining: 1 };
  }
}
