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

// Search items in Supabase based on user message
async function searchItems(message: string) {
  const supabase = await createServiceClient();

  // Extract potential search terms
  const words = message.toLowerCase().split(/\s+/);

  // Build search - try title and description matching
  const searchTerms = words.filter(
    (w) =>
      w.length > 2 &&
      !["the", "a", "an", "my", "i", "is", "it", "was", "has", "have", "lost", "find", "found", "looking", "for", "where", "can", "you", "help", "me", "did", "anyone", "someone", "please", "think", "left", "somewhere", "around", "near"].includes(w)
  );

  if (searchTerms.length === 0) return [];

  // Search with OR across title and description for each term
  const searchQuery = searchTerms
    .map((term) => `title.ilike.%${term}%,description.ilike.%${term}%`)
    .join(",");

  const { data: items } = await supabase
    .from("items")
    .select("*")
    .eq("status", "approved")
    .or(searchQuery)
    .limit(5);

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
