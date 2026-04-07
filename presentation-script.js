const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, PageBreak, TabStopType, TabStopPosition,
  LevelFormat,
} = require("docx");

// ── Colors ──────────────────────────────────────────────────────────
const BLUE    = "1B4F72";
const ACCENT  = "2E86C1";
const GRAY    = "555555";
const LIGHT   = "D6EAF8";
const WHITE   = "FFFFFF";
const BLACK   = "000000";

// ── Helpers ─────────────────────────────────────────────────────────
const speakerColors = { "Speaker 1": "1A5276", "Speaker 2": "7D3C98", "Speaker 3": "117A65" };
const speakerLabels = { "Speaker 1": "S1", "Speaker 2": "S2", "Speaker 3": "S3" };

function speakerLine(speaker, text, { bold = false, italic = false } = {}) {
  return new Paragraph({
    spacing: { before: 120, after: 60 },
    children: [
      new TextRun({ text: `[${speakerLabels[speaker]}] `, bold: true, font: "Arial", size: 21, color: speakerColors[speaker] }),
      new TextRun({ text, font: "Arial", size: 21, color: "333333", bold, italics: italic }),
    ],
  });
}

function stageCue(text) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    children: [
      new TextRun({ text: `  ${text}`, font: "Arial", size: 19, italics: true, color: "888888" }),
    ],
  });
}

function sectionHeader(title, time) {
  return new Paragraph({
    spacing: { before: 300, after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: ACCENT, space: 4 } },
    children: [
      new TextRun({ text: title, font: "Arial", size: 26, bold: true, color: BLUE }),
      new TextRun({ text: `    ${time}`, font: "Arial", size: 19, color: "999999", italics: true }),
    ],
  });
}

function note(text) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    indent: { left: 360 },
    children: [
      new TextRun({ text: `\u25B8 ${text}`, font: "Arial", size: 18, color: "777777", italics: true }),
    ],
  });
}

// ── Border config ───────────────────────────────────────────────────
const noBorder = { style: BorderStyle.NONE, size: 0, color: WHITE };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

// ── Build Document ──────────────────────────────────────────────────
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
  },
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }],
    }],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1200, right: 1200, bottom: 1000, left: 1200 },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          spacing: { after: 0 },
          children: [
            new TextRun({ text: "RECLAIMR \u2014 FBLA Website Coding & Development", font: "Arial", size: 16, bold: true, color: ACCENT }),
            new TextRun({ text: "\tPresentation Script", font: "Arial", size: 16, color: "999999" }),
          ],
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: "DDDDDD", space: 4 } },
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Page ", font: "Arial", size: 16, color: "AAAAAA" }),
            new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: "AAAAAA" }),
          ],
        })],
      }),
    },
    children: [
      // ═══════════════════════════════════════════════════════════════
      // TITLE
      // ═══════════════════════════════════════════════════════════════
      new Paragraph({ spacing: { before: 200, after: 0 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "RECLAIMR", font: "Arial", size: 52, bold: true, color: BLUE })] }),
      new Paragraph({ spacing: { before: 0, after: 40 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "School Lost & Found Platform", font: "Arial", size: 28, color: ACCENT })] }),
      new Paragraph({ spacing: { before: 80, after: 0 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "FBLA Website Coding & Development \u2014 Presentation Script", font: "Arial", size: 20, color: GRAY })] }),
      new Paragraph({ spacing: { before: 40, after: 0 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Total Runtime: ~6:50  \u2022  3 Speakers", font: "Arial", size: 18, color: "999999" })] }),

      // Speaker legend
      new Paragraph({ spacing: { before: 200, after: 60 },
        children: [new TextRun({ text: "Speaker Key:", font: "Arial", size: 19, bold: true, color: GRAY })] }),
      new Table({
        width: { size: 9840, type: WidthType.DXA },
        columnWidths: [3280, 3280, 3280],
        rows: [new TableRow({
          children: [
            new TableCell({ borders: noBorders, width: { size: 3280, type: WidthType.DXA },
              children: [new Paragraph({ children: [
                new TextRun({ text: "\u25CF Speaker 1 (S1)", font: "Arial", size: 19, bold: true, color: speakerColors["Speaker 1"] }),
              ]})] }),
            new TableCell({ borders: noBorders, width: { size: 3280, type: WidthType.DXA },
              children: [new Paragraph({ children: [
                new TextRun({ text: "\u25CF Speaker 2 (S2)", font: "Arial", size: 19, bold: true, color: speakerColors["Speaker 2"] }),
              ]})] }),
            new TableCell({ borders: noBorders, width: { size: 3280, type: WidthType.DXA },
              children: [new Paragraph({ children: [
                new TextRun({ text: "\u25CF Speaker 3 (S3)", font: "Arial", size: 19, bold: true, color: speakerColors["Speaker 3"] }),
              ]})] }),
          ],
        })],
      }),

      // ═══════════════════════════════════════════════════════════════
      // 1. INTRODUCTION (0:00 – 0:25)
      // ═══════════════════════════════════════════════════════════════
      sectionHeader("1. Introduction", "0:00 \u2013 0:25"),
      stageCue("All three speakers standing. Website home page displayed."),

      speakerLine("Speaker 1", "Good morning/afternoon, judges. We\u2019re here to present Reclaimr \u2014 a fully functional lost-and-found platform built for our school, Monta Vista High."),
      speakerLine("Speaker 2", "Every year, hundreds of items go unclaimed in school lost-and-found bins. Reclaimr solves this by giving students a fast, intuitive way to report found items and search for their lost belongings \u2014 all in one place."),
      speakerLine("Speaker 3", "We built Reclaimr from scratch using Next.js, React, Supabase, and Tailwind CSS. Let\u2019s walk you through it."),

      // ═══════════════════════════════════════════════════════════════
      // 2. HOME PAGE (0:25 – 0:55)
      // ═══════════════════════════════════════════════════════════════
      sectionHeader("2. Home Page", "0:25 \u2013 0:55"),
      stageCue("Show home page. Scroll slowly through hero, stats, How It Works."),

      speakerLine("Speaker 1", "Here\u2019s our home page. The hero section features animated typing text that cycles through prompts like \u201CLost something?\u201D and \u201CMissing your keys?\u201D \u2014 immediately telling users what this site is for."),
      speakerLine("Speaker 1", "Below that, we have a live stats section pulling directly from our database \u2014 total items reported, items returned, and active listings. Then an interactive How It Works section that walks new users through the four-step process: report, review, search, and collect."),
      note("Keyboard shortcut: Tab through interactive elements to demonstrate accessibility."),

      // ═══════════════════════════════════════════════════════════════
      // 3. LOGIN + AUTH (0:55 – 1:10)
      // ═══════════════════════════════════════════════════════════════
      sectionHeader("3. Login \u2014 Google Authentication", "0:55 \u2013 1:10"),
      stageCue("Click Sign In. Show Google OAuth flow."),

      speakerLine("Speaker 2", "Students sign in with their Google account using NextAuth. This keeps authentication secure and frictionless \u2014 no passwords to remember. Their name and avatar appear in the navbar once logged in."),

      // ═══════════════════════════════════════════════════════════════
      // 4. REPORTING AN ITEM (1:10 – 2:10)
      // ═══════════════════════════════════════════════════════════════
      sectionHeader("4. Reporting a Found Item", "1:10 \u2013 2:10"),
      stageCue("Navigate to Report Found Item page. Upload an image."),

      speakerLine("Speaker 3", "This is where Reclaimr really stands out. When a student finds a lost item, they come here and upload a photo \u2014 either from their camera or device."),
      speakerLine("Speaker 3", "The moment the image is uploaded, our on-device AI kicks in. We\u2019re running a CLIP model from HuggingFace directly in the browser. It performs zero-shot image classification to automatically detect the item\u2019s category, color, size, and material."),
      stageCue("Point to the auto-filled category and auto-selected tags on screen."),
      speakerLine("Speaker 1", "So right here \u2014 the category was auto-set to \u201CWater Bottle,\u201D and the tags \u201CWhite,\u201D \u201CMetal,\u201D and \u201CMedium\u201D were all selected automatically by the AI. The user can adjust these, but in most cases the AI nails it."),
      speakerLine("Speaker 1", "The reporter also fills in the title, a brief description, where they found it, and the date. These details help the owner verify it\u2019s really their item when they come to claim it."),
      note("Mention: Tags are crucial \u2014 they power the search and filtering on the Browse page."),

      // ═══════════════════════════════════════════════════════════════
      // 5. LEADERBOARD (2:10 – 2:30)
      // ═══════════════════════════════════════════════════════════════
      sectionHeader("5. Leaderboard \u2014 Gamification", "2:10 \u2013 2:30"),
      stageCue("Navigate to Leaderboard page."),

      speakerLine("Speaker 2", "We gamified the system to encourage participation. Students earn 10 points for reporting a found item and 25 points when that item is successfully returned. The leaderboard ranks contributors and highlights your personal rank when you\u2019re logged in. It\u2019s a small incentive that makes a big difference in engagement."),

      // ═══════════════════════════════════════════════════════════════
      // 6. BROWSE PAGE (2:30 – 3:00)
      // ═══════════════════════════════════════════════════════════════
      sectionHeader("6. Browse Page", "2:30 \u2013 3:00"),
      stageCue("Navigate to Browse Items. Demonstrate search + filters."),

      speakerLine("Speaker 3", "The Browse page displays all approved found items in a responsive grid. Users can search by keyword, filter by category, and sort by newest, expiring soon, or alphabetical."),
      speakerLine("Speaker 3", "Each card shows the item photo, title, category, and location. Clicking a card opens the full detail page where you can submit a claim or ask a question."),

      // ═══════════════════════════════════════════════════════════════
      // 7. CLAIMING AN ITEM (3:00 – 3:30)
      // ═══════════════════════════════════════════════════════════════
      sectionHeader("7. Claiming an Item", "3:00 \u2013 3:30"),
      stageCue("Click into an item. Show claim form and inquiry form."),

      speakerLine("Speaker 1", "When a student finds their item, they can submit a claim request. They describe the item in their own words to prove ownership \u2014 things like specific scratches, stickers, or custom engravings. This claim goes to an admin for verification."),
      speakerLine("Speaker 1", "There\u2019s also an inquiry option. If they\u2019re not sure, they can message the admin with a question before committing to a claim."),

      // ═══════════════════════════════════════════════════════════════
      // 8. ADMIN DASHBOARD (3:30 – 4:15)
      // ═══════════════════════════════════════════════════════════════
      sectionHeader("8. Admin Dashboard", "3:30 \u2013 4:15"),
      stageCue("Log in as admin. Show dashboard."),

      speakerLine("Speaker 2", "Now let\u2019s switch to the admin side. Admins have a password-protected dashboard where they can manage everything."),
      stageCue("Show All Items tab."),
      speakerLine("Speaker 2", "The Items tab shows every reported item with its status \u2014 pending, approved, claimed, or archived. Admins must approve an item before it goes live on the Browse page. This ensures nothing inappropriate or duplicate gets published."),
      stageCue("Click Inquiries tab briefly."),
      speakerLine("Speaker 3", "The Inquiries tab shows messages from students asking about specific items. Admins can read and respond to these."),
      stageCue("Show a claim, reject it to demonstrate."),
      speakerLine("Speaker 3", "And in the Claims tab, admins review ownership claims. They can approve or reject each one based on the description provided. When approved, the item is marked as claimed and the reporter earns their bonus points."),

      // ═══════════════════════════════════════════════════════════════
      // 9. ABOUT PAGE (4:15 – 4:25)
      // ═══════════════════════════════════════════════════════════════
      sectionHeader("9. About Page", "4:15 \u2013 4:25"),
      stageCue("Quick scroll through About page."),

      speakerLine("Speaker 1", "Our About page covers the mission, the 30-day donation policy, how rewards work, and contact info. It has a sticky table of contents for easy navigation."),

      // ═══════════════════════════════════════════════════════════════
      // 10. SPECIAL FEATURE #1 — AI CHATBOT (4:25 – 5:05)
      // ═══════════════════════════════════════════════════════════════
      sectionHeader("10. Special Feature #1 \u2014 AI Chatbot", "4:25 \u2013 5:05"),
      stageCue("Click the chat bubble in bottom-right. Chatbot opens."),

      speakerLine("Speaker 2", "Our first special feature is the AI-powered Reclaimr Assistant. It\u2019s a chatbot available on every page of the site."),
      stageCue("Type: \u201CHow do I report an item?\u201D"),
      speakerLine("Speaker 2", "It can answer any question about the platform \u2014 how to report items, how claims work, what happens after 30 days."),
      stageCue("Type: \u201CI lost my headphones\u201D"),
      speakerLine("Speaker 2", "But here\u2019s the powerful part \u2014 it actually searches our live database. When a student says \u201CI lost my headphones,\u201D the bot uses a semantic synonym system that expands the search to also look for AirPods, earbuds, Beats, and other related terms. Then it shows matching items as interactive cards with a direct link to claim."),
      speakerLine("Speaker 3", "Under the hood, this uses the Groq API running Llama 3.3 at 70 billion parameters. The search terms are expanded through a synonym map we built covering every common lost-and-found category."),

      // ═══════════════════════════════════════════════════════════════
      // 11. SPECIAL FEATURE #2 — SMART MATCH ALERTS (5:05 – 5:45)
      // ═══════════════════════════════════════════════════════════════
      sectionHeader("11. Special Feature #2 \u2014 Smart Match Alerts", "5:05 \u2013 5:45"),
      stageCue("Navigate to the \u201CI Lost Something\u201D page."),

      speakerLine("Speaker 1", "Our second special feature closes the loop on the entire lost-and-found process. If a student loses something but it hasn\u2019t been found yet, they can fill out this form describing what they lost \u2014 the title, description, category, where and when they last had it."),
      speakerLine("Speaker 1", "Their lost item profile gets saved to our database. Every time a new found item is approved, the system automatically checks it against all saved lost item profiles. If there\u2019s a match, the student receives an email notification saying their item may have been found."),
      speakerLine("Speaker 3", "This means students don\u2019t have to keep checking the site every day. The system does the work for them. No other school lost-and-found platform has this."),

      // ═══════════════════════════════════════════════════════════════
      // 12. UI/UX DESIGN PRINCIPLES (5:45 – 6:05)
      // ═══════════════════════════════════════════════════════════════
      sectionHeader("12. UI/UX Design Principles", "5:45 \u2013 6:05"),

      speakerLine("Speaker 2", "Our design was guided by established UX principles. Jakob\u2019s Law \u2014 we used familiar patterns like top navigation, card-based layouts, and search bars so users feel at home immediately. We applied gamification psychology with the points and leaderboard to drive engagement."),
      speakerLine("Speaker 2", "We also paid close attention to contrast and motion. High-contrast text on dark backgrounds for readability, and purposeful animations like scroll reveals and aurora effects that enhance without distracting."),

      // ═══════════════════════════════════════════════════════════════
      // 13. CODE + ARCHITECTURE (6:05 – 6:35)
      // ═══════════════════════════════════════════════════════════════
      sectionHeader("13. Code & Architecture", "6:05 \u2013 6:35"),
      stageCue("Briefly show code editor with project structure."),

      speakerLine("Speaker 3", "On the technical side \u2014 the entire site is built with Next.js 16 using the App Router, React 19, TypeScript, and Tailwind CSS v4. Our backend is Supabase with PostgreSQL for the database and Row-Level Security for data protection."),
      speakerLine("Speaker 3", "Our codebase is cleanly organized \u2014 pages in the app directory, reusable components, shared utility libraries, and typed API routes. Every component is written in TypeScript with strict typing."),
      speakerLine("Speaker 1", "Accessibility was a priority throughout. We use semantic HTML, ARIA labels on all interactive elements, keyboard navigation support, and a skip-to-content link. Our color contrast ratios meet WCAG guidelines."),

      // ═══════════════════════════════════════════════════════════════
      // 14. BACKEND + SECURITY (6:35 – 6:45)
      // ═══════════════════════════════════════════════════════════════
      sectionHeader("14. Backend \u2014 Supabase", "6:35 \u2013 6:45"),

      speakerLine("Speaker 1", "For the backend, we chose Supabase. It provides a PostgreSQL database, built-in authentication, real-time capabilities, and file storage. All data is protected with Row-Level Security policies, and we use a service-role client on the server side to safely bypass RLS when needed for admin operations."),

      // ═══════════════════════════════════════════════════════════════
      // 15. CLOSE — ATTRIBUTIONS (6:45 – 6:55)
      // ═══════════════════════════════════════════════════════════════
      sectionHeader("15. Closing & Attributions", "6:45 \u2013 6:55"),

      speakerLine("Speaker 2", "To wrap up \u2014 Reclaimr is a complete, production-ready lost-and-found platform with AI-powered tagging, a smart chatbot, automated match alerts, gamification, and a full admin system."),
      speakerLine("Speaker 3", "All source code is original. Our attributions include Next.js, React, Supabase, Tailwind CSS, Framer Motion, HuggingFace Transformers, Groq, Lucide icons, and Google Cloud Vision. A full attributions page is available on the site."),
      speakerLine("Speaker 1", "Thank you, judges. We\u2019re happy to answer any questions."),

      // ═══════════════════════════════════════════════════════════════
      // Q&A PREP
      // ═══════════════════════════════════════════════════════════════
      new Paragraph({ children: [new PageBreak()] }),
      sectionHeader("Q&A Preparation Notes", "3 minutes"),
      new Paragraph({ spacing: { before: 120, after: 60 },
        children: [new TextRun({ text: "Anticipated questions and suggested answers:", font: "Arial", size: 20, italics: true, color: GRAY })] }),

      ...[
        { q: "Why did you choose Next.js over plain HTML/CSS?", a: "Next.js gives us server-side rendering for fast load times, file-based routing, API routes for backend logic, and React\u2019s component model for reusable UI. It\u2019s a production-grade framework used by companies like Netflix and Notion." },
        { q: "How does the AI image classification work?", a: "We use the CLIP model from HuggingFace running entirely in the browser via WebAssembly. It performs zero-shot classification \u2014 meaning it can identify objects it wasn\u2019t explicitly trained on by matching images to text descriptions. We run separate classification passes for category, color, size, and material." },
        { q: "What happens if the AI misclassifies an item?", a: "The AI suggestions are pre-filled but fully editable. Users can change the category and tags before submitting. It\u2019s a suggestion system, not a requirement." },
        { q: "How do you prevent abuse of the system?", a: "Multiple layers: Google authentication ensures real accounts, admin review is required before items go live, Google Vision API screens uploaded images for inappropriate content, and claims require a written description verified by an admin." },
        { q: "Is the site responsive?", a: "Yes, fully responsive. We used Tailwind\u2019s responsive utility classes and tested on mobile, tablet, and desktop. All layouts adapt using CSS Grid and Flexbox." },
        { q: "How did you divide the work among team members?", a: "We collaborated on architecture decisions together, then divided by area of expertise \u2014 frontend components and design, backend API routes and database, and AI integration and special features. We used Git for version control." },
        { q: "What was the hardest part of building this?", a: "Getting the on-device AI classification accurate. CLIP spreads probability across many labels, so we had to run separate classification passes for each tag category instead of one big pass. We also had to build the synonym expansion system for the chatbot search to understand that \u2018headphones\u2019 should match \u2018AirPods.\u2019" },
      ].flatMap(({ q, a }) => [
        new Paragraph({
          spacing: { before: 180, after: 40 },
          numbering: { reference: "bullets", level: 0 },
          children: [new TextRun({ text: q, font: "Arial", size: 20, bold: true, color: BLUE })],
        }),
        new Paragraph({
          spacing: { before: 0, after: 80 },
          indent: { left: 720 },
          children: [new TextRun({ text: a, font: "Arial", size: 20, color: "444444" })],
        }),
      ]),
    ],
  }],
});

// ── Generate ────────────────────────────────────────────────────────
Packer.toBuffer(doc).then((buffer) => {
  const outPath = process.argv[2] || "Reclaimr-Presentation-Script.docx";
  fs.writeFileSync(outPath, buffer);
  console.log(`Created: ${outPath}`);
});
