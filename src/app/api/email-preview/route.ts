/**
 * Email Preview Route — visit /api/email-preview in your browser.
 * DEV ONLY. Remove before deploying to production.
 */

import { NextResponse } from "next/server";

function resolveImageUrl(imagePath: string | null, baseUrl: string): string {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  return `${baseUrl}/${imagePath.replace(/^\//, "")}`;
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const lostItem = {
    title: "Blue Steel Water Bottle",
    description: "Matte finish, silver cap, 750ml capacity. Slight scratch on the bottom edge.",
    reporter_name: "Alex Johnson",
    created_at: "2026-03-20T08:00:00Z",
  };

  const matches = [
    {
      total_score: 0.94,
      items: {
        id: 1,
        title: "Ocean Blue Hydro Vessel",
        description: "Found in the main hallway near the gym entrance. Matching color and volume profile with minor surface wear.",
        location_found: "Gym Hallway",
        reporter_name: "Coach Williams",
        image_path: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop",
      },
    },
    {
      total_score: 0.61,
      items: {
        id: 2,
        title: "Steel Flask - Navy",
        description: "Found in the library study room. Similar shape and material, though slightly darker hue than described.",
        location_found: "Library, Room 2B",
        reporter_name: "Ms. Patel",
        image_path: "https://images.unsplash.com/photo-1523362628745-0c100fc988a6?w=400&h=400&fit=crop",
      },
    },
    {
      total_score: 0.38,
      items: {
        id: 3,
        title: "Insulated Sport Bottle",
        description: "Turned in at the front office. Matching brand but appears to have a different lid style.",
        location_found: "Front Office",
        reporter_name: null,
        image_path: null,
      },
    },
  ];

  const matchCardsHTML = matches
    .map((match, index) => {
      const f = match.items;
      const confidence = Math.round(match.total_score * 100);
      const imageSrc = resolveImageUrl(f.image_path, baseUrl);
      const description =
        f.description.length > 120 ? f.description.substring(0, 120) + "..." : f.description;

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
            <td style="background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  ${imageCell}
                  <td style="padding: 20px 22px; vertical-align: top;">
                    <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 10px;">
                      <tr>
                        <td style="background: ${badgeBg}; border-radius: 20px; padding: 3px 10px;">
                          <span style="color: #ffffff; font-size: 11px; font-weight: 700; letter-spacing: 0.5px;">${confidence}% MATCH</span>
                        </td>
                      </tr>
                    </table>
                    <h3 style="margin: 0 0 6px 0; color: #0f172a; font-size: 16px; font-weight: 700; line-height: 1.3;">${f.title}</h3>
                    <p style="margin: 0 0 14px 0; color: #64748b; font-size: 13px; line-height: 1.6;">${description}</p>
                    <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px;">
                      <tr>
                        ${f.location_found ? `<td style="padding-right: 8px;">
                          <span style="display: inline-block; background: #f1f5f9; color: #475569; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 20px; white-space: nowrap;">&#128205; ${f.location_found}</span>
                        </td>` : ""}
                        ${f.reporter_name ? `<td>
                          <span style="display: inline-block; background: #f1f5f9; color: #475569; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 20px; white-space: nowrap;">&#128100; ${f.reporter_name}</span>
                        </td>` : ""}
                      </tr>
                    </table>
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background: #4f46e5; border-radius: 8px;">
                          <a href="${baseUrl}/items/${f.id}" style="display: inline-block; color: #ffffff; text-decoration: none; padding: 9px 20px; font-size: 13px; font-weight: 700; letter-spacing: 0.2px;">
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

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>We found matches for your lost item &mdash; Reclaimr</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-text-size-adjust: 100%;">

  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 32px 16px 48px 16px;">
        <table cellpadding="0" cellspacing="0" border="0" width="620" style="max-width: 620px; width: 100%;">

          <!-- HEADER -->
          <tr>
            <td style="background: linear-gradient(135deg, #312e81 0%, #4f46e5 50%, #7c3aed 100%); border-radius: 16px 16px 0 0; padding: 28px 36px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td>
                    <span style="color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">Reclaimr</span>
                    <span style="display: inline-block; margin-left: 10px; background: rgba(255,255,255,0.15); color: #c7d2fe; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; letter-spacing: 0.3px; vertical-align: middle;">LOST &amp; FOUND</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- HERO -->
          <tr>
            <td style="background: #ffffff; padding: 40px 36px 32px 36px; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">
              <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="background: #ede9fe; width: 56px; height: 56px; border-radius: 14px; text-align: center; vertical-align: middle;">
                    <span style="font-size: 28px; line-height: 56px;">&#128269;</span>
                  </td>
                </tr>
              </table>
              <h1 style="margin: 0 0 12px 0; color: #0f172a; font-size: 28px; font-weight: 800; line-height: 1.25; letter-spacing: -0.5px;">
                Good news &mdash; we found<br/>potential matches!
              </h1>
              <p style="margin: 0; color: #64748b; font-size: 15px; line-height: 1.7;">
                Hi ${lostItem.reporter_name.split(" ")[0]}, our system spotted <strong style="color: #4f46e5;">${matches.length} items</strong> in our database that may be yours. Take a look below.
              </p>
            </td>
          </tr>

          <!-- YOUR REPORT -->
          <tr>
            <td style="background: #ffffff; padding: 0 36px 32px 36px; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="background: #fafafa; border: 1px solid #e2e8f0; border-left: 4px solid #4f46e5; border-radius: 10px; padding: 18px 20px;">
                    <p style="margin: 0 0 6px 0; color: #6366f1; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Your Report</p>
                    <p style="margin: 0 0 4px 0; color: #0f172a; font-size: 16px; font-weight: 700;">${lostItem.title}</p>
                    <p style="margin: 0 0 10px 0; color: #64748b; font-size: 13px; line-height: 1.5;">${lostItem.description}</p>
                    <p style="margin: 0; color: #94a3b8; font-size: 12px;">Reported on ${reportedDate}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- MATCH COUNT -->
          <tr>
            <td style="background: #ffffff; padding: 0 36px 20px 36px; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="border-top: 1px solid #f1f5f9; padding-top: 24px;">
                    <h2 style="margin: 0; color: #0f172a; font-size: 17px; font-weight: 700;">${matches.length} Potential Matches Found</h2>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- MATCH CARDS -->
          <tr>
            <td style="background: #ffffff; padding: 0 36px 8px 36px; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">
              ${matchCardsHTML}
            </td>
          </tr>

          <!-- BROWSE CTA -->
          <tr>
            <td style="background: #f8fafc; padding: 28px 36px 32px 36px; border: 1px solid #e2e8f0; border-top: none; text-align: center;">
              <p style="margin: 0 0 18px 0; color: #64748b; font-size: 13px; line-height: 1.6;">
                Not quite right? New items are added regularly &mdash; keep checking back.
              </p>
              <table cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td style="border: 2px solid #4f46e5; border-radius: 10px;">
                    <a href="${baseUrl}/items" style="display: inline-block; color: #4f46e5; text-decoration: none; padding: 12px 32px; font-size: 14px; font-weight: 700; letter-spacing: 0.2px;">
                      Browse All Items &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding: 28px 36px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #0f172a; font-size: 14px; font-weight: 700;">Reclaimr</p>
              <p style="margin: 0 0 14px 0; color: #94a3b8; font-size: 12px; line-height: 1.6;">
                You&rsquo;re receiving this because you filed a lost item report.<br/>
                This is an automated notification from your school&rsquo;s Lost &amp; Found system.
              </p>
              <table cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td style="padding: 0 10px;"><a href="${baseUrl}" style="color: #94a3b8; font-size: 12px; text-decoration: none;">Home</a></td>
                  <td style="color: #cbd5e1; font-size: 12px;">&bull;</td>
                  <td style="padding: 0 10px;"><a href="${baseUrl}/items" style="color: #94a3b8; font-size: 12px; text-decoration: none;">Browse Items</a></td>
                  <td style="color: #cbd5e1; font-size: 12px;">&bull;</td>
                  <td style="padding: 0 10px;"><a href="${baseUrl}/report" style="color: #94a3b8; font-size: 12px; text-decoration: none;">Report Item</a></td>
                </tr>
              </table>
              <p style="margin: 16px 0 0 0; color: #cbd5e1; font-size: 11px;">
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

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  });
}
