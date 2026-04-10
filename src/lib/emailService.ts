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
 * Resolve image path to a full absolute URL.
 * Handles: full https URLs (Supabase Storage), legacy relative paths, and empty/null values.
 */
function resolveImageUrl(imagePath: string | null, baseUrl: string): string {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  // Legacy relative path like "uploads/xxx.png"
  return `${baseUrl}/${imagePath.replace(/^\//, "")}`;
}

/**
 * Generate HTML email template for match notifications.
 */
function generateMatchEmailHTML(
  lostItem: LostItem,
  matches: MatchWithFoundItem[]
): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const matchCardsHTML = matches
    .map((match, index) => {
      const f = match.items;
      const confidence = Math.round(match.total_score * 100);
      const imageSrc = resolveImageUrl(f.image_path, baseUrl);
      const description = f.description
        ? f.description.length > 120
          ? f.description.substring(0, 120) + "..."
          : f.description
        : "No description provided";

      // Badge color: green for high confidence, amber for medium, slate for lower
      const badgeBg = confidence >= 70 ? "#16a34a" : confidence >= 45 ? "#d97706" : "#4f46e5";

      const imageCell = imageSrc
        ? `<td width="160" style="padding: 0; vertical-align: top;">
            <img src="${imageSrc}" alt="${f.title}" width="160" style="display: block; width: 160px; height: 180px; object-fit: cover; border-radius: 12px 0 0 12px;" />
          </td>`
        : `<td width="160" style="padding: 0; vertical-align: middle; background: #1e1b4b; border-radius: 12px 0 0 12px; text-align: center;">
            <div style="padding: 32px 16px;">
              <div style="font-size: 40px; line-height: 1; margin-bottom: 8px;">&#128230;</div>
              <p style="margin: 0; color: #818cf8; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">No photo</p>
            </div>
          </td>`;

      return `
        <!-- Match Card ${index + 1} -->
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 16px;">
          <tr>
            <td style="background: #0f1d31; border-radius: 12px; border: 1px solid #243b53; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.28);">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  ${imageCell}
                  <td style="padding: 20px 22px; vertical-align: top;">
                    <!-- Match badge -->
                    <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 10px;">
                      <tr>
                        <td style="background: ${badgeBg}; border-radius: 20px; padding: 3px 10px;">
                          <span style="color: #ffffff; font-size: 11px; font-weight: 700; letter-spacing: 0.5px;">${confidence}% MATCH</span>
                        </td>
                      </tr>
                    </table>
                    <!-- Title -->
                    <h3 style="margin: 0 0 6px 0; color: #eaf2ff; font-size: 16px; font-weight: 700; line-height: 1.3;">
                      ${f.title}
                    </h3>
                    <!-- Description -->
                    <p style="margin: 0 0 14px 0; color: #a6b4c7; font-size: 13px; line-height: 1.6;">
                      ${description}
                    </p>
                    <!-- Meta pills -->
                    <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px;">
                      <tr>
                        ${f.location_found ? `<td style="padding-right: 8px;">
                          <span style="display: inline-block; background: #1a2d4a; color: #c8dcf5; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 20px; white-space: nowrap; border: 1px solid #2d4d73;">&#128205; ${f.location_found}</span>
                        </td>` : ""}
                        ${f.reporter_name ? `<td>
                          <span style="display: inline-block; background: #1a2d4a; color: #c8dcf5; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 20px; white-space: nowrap; border: 1px solid #2d4d73;">&#128100; ${f.reporter_name}</span>
                        </td>` : ""}
                      </tr>
                    </table>
                    <!-- CTA -->
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background: #6ca7ff; border-radius: 8px;">
                          <a href="${baseUrl}/items/${f.id}" style="display: inline-block; color: #0b1728; text-decoration: none; padding: 9px 20px; font-size: 13px; font-weight: 700; letter-spacing: 0.2px;">
                            View Item &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>`;
    })
    .join("");

  const reportedDate = new Date(lostItem.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark light">
  <meta name="supported-color-schemes" content="dark light">
  <title>We found matches for your lost item &mdash; Reclaimr</title>
  <!--[if mso]><style>body,table,td,a{font-family:Arial,sans-serif!important}</style><![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #070f1f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">

  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #070f1f;">
    <tr>
      <td align="center" style="padding: 32px 16px 48px 16px;">

        <!-- Email wrapper -->
        <table cellpadding="0" cellspacing="0" border="0" width="620" style="max-width: 620px; width: 100%;">

          <!-- ── HEADER ── -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a5f 0%, #1a2d4a 50%, #12233b 100%); border-radius: 16px 16px 0 0; padding: 28px 36px; border: 1px solid #2d4d73; border-bottom: none;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td>
                    <span style="color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">Reclaimr</span>
                    <span style="display: inline-block; margin-left: 10px; background: rgba(255,255,255,0.12); color: #c9dbf5; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; letter-spacing: 0.3px; vertical-align: middle;">LOST &amp; FOUND</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── HERO ── -->
          <tr>
            <td style="background: #0b1728; padding: 40px 36px 32px 36px; border-left: 1px solid #2d4d73; border-right: 1px solid #2d4d73;">
              <!-- Icon -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="background: #1a2d4a; width: 56px; height: 56px; border-radius: 14px; text-align: center; vertical-align: middle; border: 1px solid #2d4d73;">
                    <span style="font-size: 28px; line-height: 56px;">&#128269;</span>
                  </td>
                </tr>
              </table>
              <!-- Headline -->
              <h1 style="margin: 0 0 12px 0; color: #eaf2ff; font-size: 28px; font-weight: 800; line-height: 1.25; letter-spacing: -0.5px;">
                Good news &mdash; we found<br/>potential matches!
              </h1>
              <p style="margin: 0; color: #a6b4c7; font-size: 15px; line-height: 1.7;">
                Hi ${lostItem.reporter_name ? lostItem.reporter_name.split(" ")[0] : "there"}, our system spotted <strong style="color: #8cc6ff;">${matches.length} item${matches.length !== 1 ? "s" : ""}</strong> in our database that may be yours. Take a look below.
              </p>
            </td>
          </tr>

          <!-- ── YOUR REPORT SUMMARY ── -->
          <tr>
            <td style="background: #0b1728; padding: 0 36px 32px 36px; border-left: 1px solid #2d4d73; border-right: 1px solid #2d4d73;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="background: #10233d; border: 1px solid #2d4d73; border-left: 4px solid #6ca7ff; border-radius: 10px; padding: 18px 20px;">
                    <p style="margin: 0 0 6px 0; color: #8cc6ff; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Your Report</p>
                    <p style="margin: 0 0 4px 0; color: #eaf2ff; font-size: 16px; font-weight: 700;">${lostItem.title}</p>
                    <p style="margin: 0 0 10px 0; color: #a6b4c7; font-size: 13px; line-height: 1.5;">${lostItem.description}</p>
                    <p style="margin: 0; color: #8fa4bf; font-size: 12px;">Reported on ${reportedDate}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── DIVIDER + MATCH COUNT ── -->
          <tr>
            <td style="background: #0b1728; padding: 0 36px 20px 36px; border-left: 1px solid #2d4d73; border-right: 1px solid #2d4d73;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="border-top: 1px solid #243b53; padding-top: 24px;">
                    <h2 style="margin: 0; color: #eaf2ff; font-size: 17px; font-weight: 700;">
                      ${matches.length} Potential Match${matches.length !== 1 ? "es" : ""} Found
                    </h2>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── MATCH CARDS ── -->
          <tr>
            <td style="background: #0b1728; padding: 0 36px 8px 36px; border-left: 1px solid #2d4d73; border-right: 1px solid #2d4d73;">
              ${matchCardsHTML}
            </td>
          </tr>

          <!-- ── BROWSE CTA ── -->
          <tr>
            <td style="background: #0e1f35; padding: 28px 36px 32px 36px; border: 1px solid #2d4d73; border-top: none; text-align: center;">
              <p style="margin: 0 0 18px 0; color: #a6b4c7; font-size: 13px; line-height: 1.6;">
                Not quite right? New items are added regularly &mdash; keep checking back.
              </p>
              <table cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td style="border: 2px solid #8cc6ff; border-radius: 10px;">
                    <a href="${baseUrl}/items" style="display: inline-block; color: #8cc6ff; text-decoration: none; padding: 12px 32px; font-size: 14px; font-weight: 700; letter-spacing: 0.2px;">
                      Browse All Items &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── FOOTER ── -->
          <tr>
            <td style="padding: 28px 36px; border-top: 1px solid #243b53; background: #0b1728; text-align: center; border-left: 1px solid #2d4d73; border-right: 1px solid #2d4d73; border-bottom: 1px solid #2d4d73; border-radius: 0 0 16px 16px;">
              <p style="margin: 0 0 10px 0; color: #eaf2ff; font-size: 14px; font-weight: 700;">Reclaimr</p>
              <p style="margin: 0 0 14px 0; color: #8fa4bf; font-size: 12px; line-height: 1.6;">
                You&rsquo;re receiving this because you filed a lost item report.<br/>
                This is an automated notification from your school&rsquo;s Lost &amp; Found system.
              </p>
              <table cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td style="padding: 0 10px;">
                    <a href="${baseUrl}" style="color: #8cc6ff; font-size: 12px; text-decoration: none;">Home</a>
                  </td>
                  <td style="color: #4d6784; font-size: 12px;">&bull;</td>
                  <td style="padding: 0 10px;">
                    <a href="${baseUrl}/items" style="color: #8cc6ff; font-size: 12px; text-decoration: none;">Browse Items</a>
                  </td>
                  <td style="color: #4d6784; font-size: 12px;">&bull;</td>
                  <td style="padding: 0 10px;">
                    <a href="${baseUrl}/report" style="color: #8cc6ff; font-size: 12px; text-decoration: none;">Report Item</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 16px 0 0 0; color: #5f7a97; font-size: 11px;">
                &copy; ${new Date().getFullYear()} Reclaimr. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
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
