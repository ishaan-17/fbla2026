import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

const today = new Date().toISOString().split("T")[0];

const sampleItems = [
  {
    title: "Steel Water Bottle",
    description: "Stainless steel water bottle with school logo sticker",
    category: "water_bottle",
    location_found: "Gym",
    date_found: today,
    image_path: "https://i.imgur.com/lFBmvfK.png",
    reporter_name: "John Doe",
    reporter_email: "john@school.edu",
    status: "approved",
    ai_tags: ["water bottle", "white", "stainless steel"],
  },
  {
    title: "Pink Backpack",
    description: "JanSport backpack with math textbook inside",
    category: "backpack",
    location_found: "Library",
    date_found: today,
    image_path: "https://i.imgur.com/FvXBGb2.png",
    reporter_name: "Staff",
    reporter_email: "staff@school.edu",
    status: "approved",
    ai_tags: ["backpack", "pink", "JanSport"],
  },
  {
    title: "Scientific Calculator",
    description: "TI-84 Plus calculator with initials 'MJ' on the back",
    category: "electronics",
    location_found: "Math Classroom 205",
    date_found: today,
    image_path: "https://i.imgur.com/swqqEV3.png",
    reporter_name: "Staff",
    reporter_email: "staff@school.edu",
    status: "approved",
    ai_tags: ["calculator", "electronics"],
  },
  {
    title: "Purple Hoodie",
    description: "Champion brand purple hoodie, size medium",
    category: "clothing",
    location_found: "Cafeteria",
    date_found: today,
    image_path: "https://i.imgur.com/pv9TfEb.png",
    reporter_name: "Staff",
    reporter_email: "staff@school.edu",
    status: "approved",
    ai_tags: ["hoodie", "purple", "Champion"],
  },
  {
    title: "AirPods Max",
    description: "Blue AirPods Max headphones",
    category: "headphones",
    location_found: "Student Center",
    date_found: today,
    image_path: "https://i.imgur.com/mBRZP8i.png",
    reporter_name: "Staff",
    reporter_email: "staff@school.edu",
    status: "approved",
    ai_tags: ["AirPods", "blue", "Apple"],
  },
];

const categories = [
  { name: "water_bottle", label: "Water Bottle" },
  { name: "pencil_case", label: "Pencil Case" },
  { name: "backpack", label: "Backpack" },
  { name: "clothing", label: "Clothing" },
  { name: "electronics", label: "Electronics" },
  { name: "keys", label: "Keys" },
  { name: "book", label: "Book" },
  { name: "lunchbox", label: "Lunchbox" },
  { name: "umbrella", label: "Umbrella" },
  { name: "sports_equipment", label: "Sports Equipment" },
  { name: "jewelry", label: "Jewelry" },
  { name: "glasses", label: "Glasses" },
  { name: "headphones", label: "Headphones" },
  { name: "other", label: "Other" },
];

export async function POST() {
  try {
    const supabase = await createServiceClient();

    // Check if items already exist
    const { count, error: countError } = await supabase
      .from("items")
      .select("*", { count: "exact", head: true });
    
    if (countError) {
      console.error("Error checking existing items:", countError);
    }
    
    if (count && count > 0) {
      return NextResponse.json({ 
        success: false, 
        message: `Database already has ${count} items. Skipping seed.` 
      });
    }

    // Seed categories first
    const { error: categoriesError } = await supabase
      .from("categories")
      .upsert(categories, { onConflict: "name" });

    if (categoriesError) {
      console.error("Error seeding categories:", categoriesError);
    }

    // Insert sample items
    const { error: itemsError } = await supabase
      .from("items")
      .insert(sampleItems);

    if (itemsError) {
      console.error("Error seeding items:", itemsError);
      return NextResponse.json({ 
        success: false, 
        error: itemsError.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully added ${sampleItems.length} items to the database!` 
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: "Send a POST request to seed the database with sample items" 
  });
}
