import rateLimit from "express-rate-limit";

// Strict limit on auth endpoints to deter brute force / credential stuffing.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,                  // 10 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Try again in a few minutes." },
});

// Limit on payment creation to prevent card-testing abuse.
export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many payment attempts. Please contact support." },
});

// Generic looser limit for read endpoints to mitigate scraping/DoS.
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
