import { getDb } from "../db";
import { users, passwordResetTokens } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const PASSWORD_RESET_TOKEN_EXPIRATION_HOURS = 1;

export async function generatePasswordResetToken(userId: number): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Invalidate any existing tokens for this user
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_EXPIRATION_HOURS * 60 * 60 * 1000);

  await db.insert(passwordResetTokens).values({
    userId,
    token,
    expiresAt,
  });

  return token;
}

export async function validatePasswordResetToken(token: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [resetToken] = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.token, token))
    .limit(1);

  if (!resetToken) {
    return { valid: false, userId: null, error: "Invalid or expired token" };
  }

  if (new Date(resetToken.expiresAt).getTime() < Date.now()) {
    // Token expired, delete it
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.id, resetToken.id));
    return { valid: false, userId: null, error: "Token expired" };
  }

  return { valid: true, userId: resetToken.userId, error: null };
}

export async function deletePasswordResetToken(token: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token));
}

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  // In a real application, you would integrate with an email service here (e.g., Nodemailer, SendGrid, Mailgun).
  // For now, we'll just log the email to the console in development.

  if (process.env.NODE_ENV === "development") {
    console.log(`\n--- Password Reset Email ---`);
    console.log(`To: ${email}`);
    console.log(`Subject: Password Reset Request for AusflugFinder`);
    console.log(`Please click on the following link to reset your password:`);
    console.log(resetLink);
    console.log(`This link will expire in ${PASSWORD_RESET_TOKEN_EXPIRATION_HOURS} hour(s).`);
    console.log(`-----------------------------\n`);
  } else {
    // TODO: Implement actual email sending in production
    // Example using a placeholder function (replace with actual service integration)
    // await sendEmailService.send({
    //   to: email,
    //   subject: 'Password Reset Request for AusflugFinder',
    //   html: `<p>Please click on the following link to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p><p>This link will expire in ${PASSWORD_RESET_TOKEN_EXPIRATION_HOURS} hour(s).</p>`,
    // });
    console.warn(`Email sending not implemented for production. Reset link for ${email}: ${resetLink}`);
  }
}
