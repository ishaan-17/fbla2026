import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createServiceClient } from "@/lib/supabase/server";
import { getCategoryLabel } from "@/lib/categories";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// System prompt that gives the bot context about Reclaimr
const SYSTEM_PROMPT = `You are Reclaimr Assistant, a helpful chatbot for the Reclaimr school lost & found platform at Monta Vista High School. You help students find their lost items and answer questions about the platform.

ABOUT RECLAIMR:
- Reclaimr is a web platform where students can report found items and search for lost belongings
- Found items are uploaded with photos, and AI automatically categorizes them (category, color, size, material)
- Students earn points for reporting items: +10 for reporting, +25 when an item is successfully returned
- There's a leaderboard showing top contributors
- Items unclaimed after 30 days are donated to local charities (God's Promise Charity)
- Students can sign in with Google to track their reports and points
- Admins review and approve reported items before they go live

HOW TO USE THE SITE:
- To report a found item: Go to "Report Found Item", upload a photo, fill in details, and submit
- To find your lost item: Go to "Browse Items" and search by keyword, category, or tags
- To claim an item: Click on an item and submit a claim with a description proving ownership
- To see the leaderboard: Visit the Leaderboard page

YOUR BEHAVIOR:
- Be friendly, concise, and helpful
- When a user describes a lost item, search the database and suggest matching items
- If you find matching items, format them nicely with title, category, location, and a link
- If no items match, encourage them to check back later or report it
- Answer general questions about the platform, its features, and policies
- Keep responses SHORT (2-4 sentences max unless listing items)
- Use a warm, supportive tone — losing stuff is stressful!
- NEVER make up items that don't exist in the database results provided to you`;

// Stopwords to ignore when searching
const STOPWORDS = new Set([
  "the", "a", "an", "my", "i", "is", "it", "its", "was", "has", "have", "had",
  "lost", "find", "found", "looking", "for", "where", "can", "you", "help",
  "me", "did", "anyone", "someone", "please", "think", "left", "somewhere",
  "around", "near", "any", "are", "there", "been", "being", "this", "that",
  "with", "from", "about", "what", "which", "who", "how", "all", "also",
  "but", "not", "just", "like", "very", "would", "could", "should", "dont",
  "does", "doing", "some", "them", "they", "their", "will", "your", "our",
]);

// Semantic synonym groups — if a user says any word in a group,
// we also search for all the other words in that group.
// This is what makes "headphones" find "AirPods Max".
const SYNONYM_GROUPS: string[][] = [
  // Audio
  ["headphones", "earbuds", "earphones", "airpods", "beats", "headset", "buds", "audio", "airpod"],
  // Water bottles / drinkware
  ["waterbottle", "water", "bottle", "hydroflask", "flask", "thermos", "tumbler", "cup", "mug", "yeti", "nalgene", "stanley"],
  // Bags
  ["backpack", "bag", "bookbag", "tote", "purse", "satchel", "messenger", "duffel", "pack"],
  // Clothing
  ["hoodie", "jacket", "sweatshirt", "sweater", "coat", "clothing", "shirt", "vest", "fleece", "pullover", "windbreaker"],
  // Electronics
  ["phone", "iphone", "android", "samsung", "cellphone", "mobile", "smartphone"],
  ["laptop", "macbook", "chromebook", "computer", "notebook"],
  ["charger", "cable", "cord", "adapter", "usb", "lightning"],
  ["tablet", "ipad"],
  // Keys
  ["keys", "key", "keychain", "keyring", "lanyard", "fob", "carkey"],
  // Eyewear
  ["glasses", "sunglasses", "spectacles", "eyeglasses", "shades", "frames"],
  // Writing / school supplies
  ["pencil", "pen", "pencilcase", "marker", "highlighter", "eraser"],
  ["book", "notebook", "textbook", "binder", "folder", "planner", "journal"],
  // Lunch
  ["lunchbox", "lunch", "container", "tupperware", "bento", "foodcontainer"],
  // Sports
  ["ball", "racket", "helmet", "glove", "bat", "equipment", "cleats", "shin", "guard"],
  // Jewelry / accessories
  ["jewelry", "ring", "necklace", "bracelet", "earring", "watch", "chain", "pendant"],
  // Umbrella
  ["umbrella", "parasol"],
];

// Build a fast lookup: word → all related search terms
const SYNONYM_MAP = new Map<string, Set<string>>();
for (const group of SYNONYM_GROUPS) {
  for (const word of group) {
    if (!SYNONYM_MAP.has(word)) {
      SYNONYM_MAP.set(word, new Set());
    }
    for (const related of group) {
      SYNONYM_MAP.get(word)!.add(related);
    }
  }
}

// Expand a word into itself + all synonyms + compound splits
function expandTerm(word: string): string[] {
  const results = new Set([word]);

  // Add synonyms
  const synonyms = SYNONYM_MAP.get(word);
  if (synonyms) {
    for (const s of synonyms) {
      results.add(s);
    }
  }

  return [...results];
}

// Search items in Supabase based on user message
async function searchItems(message: string) {
  const supabase = await createServiceClient();

  // Clean and extract search terms
  const words = message
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));

  // Expand each word with synonyms (headphones → airpods, earbuds, etc.)
  const expandedTerms = words.flatMap(expandTerm);
  const searchTerms = [...new Set(expandedTerms)].filter((t) => t.length > 1);

  console.log("[Chat Search] Message:", message);
  console.log("[Chat Search] Search terms:", searchTerms);

  if (searchTerms.length === 0) {
    // If no search terms, return all recent approved items as context
    const { data: recentItems, error } = await supabase
      .from("items")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(5);

    console.log("[Chat Search] No terms, returning recent items:", recentItems?.length, error);
    return recentItems || [];
  }

  // Search with OR across title, description, and category for each term
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

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    // Get the latest user message to search for items
    const latestUserMessage = [...messages]
      .reverse()
      .find((m: { role: string }) => m.role === "user");

    let itemContext = "";
    if (latestUserMessage) {
      const matchingItems = await searchItems(latestUserMessage.content);
      if (matchingItems.length > 0) {
        itemContext = `\n\nMATCHING ITEMS FOUND IN DATABASE (share these with the user):\n${matchingItems
          .map(
            (item, i) =>
              `${i + 1}. "${item.title}" — ${getCategoryLabel(item.category)} | Found at: ${item.location_found} | Date: ${item.date_found} | Tags: ${Array.isArray(item.ai_tags) ? item.ai_tags.join(", ") : item.ai_tags || "none"} | Link: /items/${item.id}`
          )
          .join("\n")}`;
      } else {
        itemContext =
          "\n\nNo matching items were found in the database for this query. Let the user know and suggest they check back later or broaden their search.";
      }
    }

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
      temperature: 0.7,
      max_tokens: 500,
      stream: false,
    });

    const reply =
      chatCompletion.choices[0]?.message?.content ||
      "Sorry, I couldn't process that. Try again!";

    return NextResponse.json({ message: reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
