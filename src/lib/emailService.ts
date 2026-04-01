/**
 * Email Service - Send match notifications via Gmail
 */

import nodemailer from "nodemailer";
import type { Database } from "@/lib/supabase/database.types";

type LostItem = Database["public"]["Tables"]["lost_items"]["Row"];
type FoundItem = Database["public"]["Tables"]["items"]["Row"];

interface MatchWithFoundItem {
  id: number;
  total_score: number;
  found_item_id: number;
  items: FoundItem;
}

// Gmail transporter configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.RECLAIMR_GMAIL_ADDRESS,
    pass: process.env.RECLAIMR_GMAIL_APP_PASSWORD,
  },
});

/**
 * Generate HTML email template for match notifications
 */
function generateMatchEmailHTML(
  lostItem: LostItem,
  matches: MatchWithFoundItem[]
): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  
  const matchesHTML = matches
    .map((match) => {
      const foundItem = match.items;
      const confidence = Math.round(match.total_score * 100);
      const imageSrc = foundItem.image_path
        ? `${baseUrl}${foundItem.image_path}`
        : `${baseUrl}/placeholder-image.png`;

      return `
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
          <div style="display: flex; gap: 16px; align-items: start;">
            <img 
              src="${imageSrc}" 
              alt="${foundItem.title}"
              style="width: 120px; height: 120px; object-fit: cover; border-radius: 8px; flex-shrink: 0;"
            />
            <div style="flex: 1;">
              <h3 style="margin: 0 0 8px 0; color: #111827; font-size: 18px; font-weight: 600;">
                ${foundItem.title}
              </h3>
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                ${foundItem.description}
              </p>
              <div style="display: flex; gap: 16px; font-size: 13px; color: #6b7280;">
                <span><strong>Location:</strong> ${foundItem.location_found}</span>
                <span><strong>Date:</strong> ${foundItem.date_found}</span>
              </div>
              <div style="margin-top: 8px; font-size: 13px; color: #6b7280;">
                <strong>Reported by:</strong> ${foundItem.reporter_name || "Anonymous"}
              </div>
              <div style="margin-top: 8px;">
                <span style="display: inline-block; background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                  ${confidence}% Match
                </span>
              </div>
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Potential Matches Found</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; background: white;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 32px 24px; text-align: center;">
          <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 700;">
            🔍 ReclaimR
          </h1>
          <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
            Potential matches found!
          </p>
        </div>

        <!-- Content -->
        <div style="padding: 32px 24px;">
          <!-- Lost Item Info -->
          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <h2 style="margin: 0 0 12px 0; color: #92400e; font-size: 16px; font-weight: 600;">
              📋 What you're looking for:
            </h2>
            <h3 style="margin: 0 0 8px 0; color: #111827; font-size: 18px; font-weight: 600;">
              ${lostItem.title}
            </h3>
            <p style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">
              ${lostItem.description}
            </p>
            <div style="font-size: 13px; color: #6b7280;">
              <strong>Reported:</strong> ${new Date(lostItem.created_at).toLocaleDateString()}
            </div>
          </div>

          <!-- Matches -->
          <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 20px; font-weight: 600;">
            Here are items that might be yours:
          </h2>
          
          ${matchesHTML}

          <!-- CTA Button -->
          <div style="text-align: center; margin-top: 32px;">
            <a 
              href="${baseUrl}/my-lost-items" 
              style="display: inline-block; background: #3b82f6; color: white; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;"
            >
              View All Matches →
            </a>
          </div>

          <!-- Footer Text -->
          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
            <p style="margin: 0 0 8px 0;">
              Think one of these is yours? Visit ReclaimR to claim your item!
            </p>
            <p style="margin: 0;">
              Questions? Reply to this email for help.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #9ca3af; font-size: 12px;">
            © ${new Date().getFullYear()} ReclaimR. All rights reserved.
          </p>
          <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 12px;">
            This is an automated notification from ReclaimR Lost & Found system.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Send match notification email to a lost item owner
 */
export async function sendMatchNotificationEmail(
  lostItem: LostItem,
  matches: MatchWithFoundItem[]
): Promise<boolean> {
  try {
    if (!process.env.RECLAIMR_GMAIL_ADDRESS || !process.env.RECLAIMR_GMAIL_APP_PASSWORD) {
      console.error("[emailService] Gmail credentials not configured");
      return false;
    }

    if (!lostItem.reporter_email) {
      console.error("[emailService] No recipient email found");
      return false;
    }

    if (matches.length === 0) {
      console.log("[emailService] No matches to send");
      return false;
    }

    const subject = `🔍 We found potential matches for your lost ${lostItem.title}!`;
    const html = generateMatchEmailHTML(lostItem, matches);

    console.log(`[emailService] Sending email to ${lostItem.reporter_email} for lost item ${lostItem.id}`);

    await transporter.sendMail({
      from: `"ReclaimR Lost & Found" <${process.env.RECLAIMR_GMAIL_ADDRESS}>`,
      to: lostItem.reporter_email,
      subject,
      html,
    });

    console.log(`[emailService] Email sent successfully to ${lostItem.reporter_email}`);
    return true;
  } catch (error) {
    console.error("[emailService] Error sending email:", error);
    return false;
  }
}

/**
 * Verify email service configuration
 */
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log("[emailService] Email configuration verified");
    return true;
  } catch (error) {
    console.error("[emailService] Email configuration error:", error);
    return false;
  }
}
