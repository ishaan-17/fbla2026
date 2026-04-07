import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createServiceClient } from "@/lib/supabase/server";
import { getCategoryLabel } from "@/lib/categories";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ── System Prompt ────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are Reclaimr Assistant — the AI helper for Reclaimr, a lost & found platform at Monta Vista High School.

RULES (follow strictly):
1. Be concise. 1-3 sentences max. No essays, no bullet lists, no filler.
2. Only mention found items if the SYSTEM has provided a MATCHING ITEMS section below. If there is no MATCHING ITEMS section, do NOT mention any items or say "I found items." You do not have access to the database yourself.
3. When items ARE provided by the system, say something brief like "I found [N] item(s) that might be yours — take a look!" The UI automatically renders item cards below your message, so do NOT describe or list the items yourself.
4. If the user is asking a general question (how points work, how to report, what happens after 30 days, etc.), just answer the question directly. Do not search for items.
5. Never invent or hallucinate items. You can ONLY reference items explicitly given to you in the MATCHING ITEMS section.
6. Never repeat information the user already knows.
7. If the user says thanks or something conversational, respond naturally in 1 sentence.

PLATFORM KNOWLEDGE:
- Students report found items with photos; AI auto-categorizes them.
- Points: +10 for reporting a found item, +25 when it's returned to the owner.
- There's a community leaderboard ranking top contributors.
- Items unclaimed after 30 days are donated to God's Promise Charity.
- Students sign in with Google to track reports and points.
- Admins review found items before they go public.
- To report: go to Report page, upload a photo, fill details, submit.
- To search: go to Browse Items, filter by keyword/category/tags.
- To claim: click an item, submit a claim describing proof of ownership.
- Lost item reports: users can submit what they lost and get notified when a match is found.

LINKING TO PAGES:
When it's helpful, link the user to the right page using markdown links. ONLY use these exact paths:
- [Report an Item](/report) — for reporting found or lost items
- [Browse Items](/items) — for searching/browsing all found items
- [Leaderboard](/leaderboard) — for viewing top contributors
- [About](/about) — for learning about the platform
Do NOT link to pages that don't exist. Use links naturally within your response when they're relevant (e.g. "You can report it on the [Report page](/report)!"). Don't force links into every message.

TONE: Friendly, brief, and helpful. Losing stuff is stressful — be warm but don't overdo it.`;

// ── Intent detection ─────────────────────────────────────────────────
// Determine if the user is describing a lost item (should trigger search)
// vs asking a general question or making conversation (should NOT search).

const LOST_ITEM_SIGNALS = [
  /i\s+lost/i,
  /i\s+can'?t\s+find/i,
  /have\s+you\s+seen/i,
  /anyone\s+(found|seen|turned?\s+in)/i,
  /missing\s+(my|a)\b/i,
  /looking\s+for\s+(my|a)\b/i,
  /left\s+(my|a)\b/i,
  /lost\s+(my|a)\b/i,
  /where\s+is\s+my\b/i,
  /find\s+my\b/i,
  /misplaced/i,
];

function isLostItemQuery(message: string): boolean {
  return LOST_ITEM_SIGNALS.some((pattern) => pattern.test(message));
}

// ── Stopwords & Synonyms ─────────────────────────────────────────────

const STOPWORDS = new Set([
  "the", "a", "an", "my", "i", "is", "it", "its", "was", "has", "have", "had",
  "lost", "find", "found", "looking", "for", "where", "can", "you", "help",
  "me", "did", "anyone", "someone", "please", "think", "left", "somewhere",
  "around", "near", "any", "are", "there", "been", "being", "this", "that",
  "with", "from", "about", "what", "which", "who", "how", "all", "also",
  "but", "not", "just", "like", "very", "would", "could", "should", "dont",
  "does", "doing", "some", "them", "they", "their", "will", "your", "our",
  "cant", "im", "ive", "seen", "something", "thing", "stuff", "hey", "hi",
  "hello", "thanks", "thank", "okay", "ok", "yes", "no", "maybe",
]);

const SYNONYM_GROUPS: string[][] = [
  ["headphones", "earbuds", "earphones", "airpods", "beats", "headset", "buds", "audio", "airpod"],
  ["waterbottle", "water", "bottle", "hydroflask", "flask", "thermos", "tumbler", "cup", "mug", "yeti", "nalgene", "stanley"],
  ["backpack", "bag", "bookbag", "tote", "purse", "satchel", "messenger", "duffel", "pack"],
  ["hoodie", "jacket", "sweatshirt", "sweater", "coat", "clothing", "shirt", "vest", "fleece", "pullover", "windbreaker"],
  ["phone", "iphone", "android", "samsung", "cellphone", "mobile", "smartphone"],
  ["laptop", "macbook", "chromebook", "computer", "notebook"],
  ["charger", "cable", "cord", "adapter", "usb", "lightning"],
  ["tablet", "ipad"],
  ["keys", "key", "keychain", "keyring", "lanyard", "fob", "carkey"],
  ["glasses", "sunglasses", "spectacles", "eyeglasses", "shades", "frames"],
  ["pencil", "pen", "pencilcase", "marker", "highlighter", "eraser"],
  ["book", "notebook", "textbook", "binder", "folder", "planner", "journal"],
  ["lunchbox", "lunch", "container", "tupperware", "bento", "foodcontainer"],
  ["ball", "racket", "helmet", "glove", "bat", "equipment", "cleats", "shin", "guard"],
  ["jewelry", "ring", "necklace", "bracelet", "earring", "watch", "chain", "pendant"],
  ["umbrella", "parasol"],
];

const SYNONYM_MAP = new Map<string, Set<string>>();
for (const group of SYNONYM_GROUPS) {
  for (const word of group) {
    if (!SYNONYM_MAP.has(word)) SYNONYM_MAP.set(word, new Set());
    for (const related of group) SYNONYM_MAP.get(word)!.add(related);
  }
}

function expandTerm(word: string): string[] {
  const results = new Set([word]);
  const synonyms = SYNONYM_MAP.get(word);
  if (synonyms) for (const s of synonyms) results.add(s);
  return [...results];
}

// ── Database search ──────────────────────────────────────────────────

async function searchItems(message: string) {
  const supabase = await createServiceClient();

  const words = message
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));

  const expandedTerms = words.flatMap(expandTerm);
  const searchTerms = [...new Set(expandedTerms)].filter((t) => t.length > 1);

  console.log("[Chat Search] Message:", message);
  console.log("[Chat Search] Search terms:", searchTerms);

  // If we couldn't extract any meaningful search terms, return nothing.
  // Don't return random recent items — that causes false matches.
  if (searchTerms.length === 0) {
    console.log("[Chat Search] No meaningful search terms found, skipping search");
    return [];
  }

  const searchQuery = searchTerms
    .map(
      (term) =>
        `title.ilike.%${term}%,description.ilike.%${term}%,category.ilike.%${term}%,location_found.ilike.%${term}%`
    )
    .join(",");

  const { data: items, error } = await supabase
    .from("items")
    .select("*")
    .eq("status", "approved")
    .or(searchQuery)
    .limit(5);

  console.log("[Chat Search] Query results:", items?.length, "Error:", error);

  return items || [];
}

// ── POST handler ─────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    const latestUserMessage = [...messages]
      .reverse()
      .find((m: { role: string }) => m.role === "user");

    let itemContext = "";
    let matchedItems: {
      id: number;
      title: string;
      category: string;
      categoryLabel: string;
      location_found: string;
      date_found: string;
      tags: string;
      image_url?: string;
    }[] = [];

    // Only search the database if the user is actually describing a lost item
    const shouldSearch =
      latestUserMessage && isLostItemQuery(latestUserMessage.content);

    if (shouldSearch) {
      const matchingItems = await searchItems(latestUserMessage.content);
      if (matchingItems.length > 0) {
        matchedItems = matchingItems.map((item) => ({
          id: item.id,
          title: item.title,
          category: item.category,
          categoryLabel: getCategoryLabel(item.category),
          location_found: item.location_found,
          date_found: item.date_found,
          tags: Array.isArray(item.ai_tags)
            ? item.ai_tags.join(", ")
            : String(item.ai_tags || ""),
          image_url: item.image_path || undefined,
        }));

        itemContext = `\n\nMATCHING ITEMS FOUND IN DATABASE:\n${matchingItems
          .map(
            (item, i) =>
              `${i + 1}. "${item.title}" — ${getCategoryLabel(item.category)} | Found at: ${item.location_found} | Date: ${item.date_found}`
          )
          .join("\n")}\n\nThe UI will automatically render item cards below your message. Just write a brief intro like "I found X item(s) that might match — take a look!" Do NOT list the items yourself.`;
      } else {
        itemContext =
          "\n\nThe user is looking for a lost item, but no matching items were found in the database. Let them know kindly and suggest they check back later, try different search terms, or browse all items on the Browse page.";
      }
    }
    // If not a lost item query, don't add any item context — just let the LLM answer naturally.

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT + itemContext,
        },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.4,
      max_tokens: 300,
      stream: false,
    });

    const reply =
      chatCompletion.choices[0]?.message?.content ||
      "Sorry, I couldn't process that. Try again!";

    return NextResponse.json({
      message: reply,
      items: matchedItems.length > 0 ? matchedItems : undefined,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
