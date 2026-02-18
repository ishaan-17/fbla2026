import db from "../src/lib/db";

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
    ai_tags: JSON.stringify(["water bottle", "white", "stainless steel"]),
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
    ai_tags: JSON.stringify(["backpack", "pink", "JanSport"]),
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
    ai_tags: JSON.stringify(["calculator", "electronics"]),
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
    ai_tags: JSON.stringify(["hoodie", "purple", "Champion"]),
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
    ai_tags: JSON.stringify(["AirPods", "blue", "Apple"]),
  },
];

function seedItems() {
  console.log("Seeding items into database...\n");

  const insertStmt = db.prepare(`
    INSERT INTO items (title, description, category, location_found, date_found, image_path, reporter_name, reporter_email, status, ai_tags)
    VALUES (@title, @description, @category, @location_found, @date_found, @image_path, @reporter_name, @reporter_email, @status, @ai_tags)
  `);

  const insertMany = db.transaction((items: typeof sampleItems) => {
    for (const item of items) {
      insertStmt.run(item);
      console.log(`  Added: ${item.title}`);
    }
  });

  insertMany(sampleItems);

  console.log(`\nSuccessfully added ${sampleItems.length} items to the database!`);
}

seedItems();
