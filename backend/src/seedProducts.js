import "dotenv/config";
import mongoose from "mongoose";
import Product from "./models/Product.js";
import Category from "./models/Category.js";

export const categoryInventory = {
  Men: ["T-Shirts", "Shirts", "Jeans", "Trousers", "Jackets", "Hoodies", "Shorts", "Ethnic Wear", "Footwear", "Watches"],
  Women: ["Tops", "Dresses", "Kurtis", "Sarees", "Jeans", "Trousers", "Skirts", "Jackets", "Handbags", "Footwear"],
  Kids: ["Boys Clothing", "Girls Clothing", "T-Shirts", "Dresses", "Jeans and Trousers", "Ethnic Wear", "Shoes", "Sandals", "School Accessories", "Kids Accessories"],
  Accessories: ["Watches", "Bags and Backpacks", "Wallets", "Belts", "Sunglasses", "Jewellery", "Caps and Hats", "Fashion Accessories"],
};

const categoryImages = {
  Men: "1529370840578-5f7d6c8c0b99",
  Women: "1496747611176-843222e1e57c",
  Kids: "1503919545889-aef636e10ad4",
  Accessories: "1523275335684-37898b6baf30",
};

const productStyles = ["Essential", "Everyday", "Signature", "Classic", "Modern", "Premium", "Studio", "Weekend", "Heritage", "Edit"];
const slugify = value => String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const wearable = category => ["Men", "Women", "Kids"].includes(category);

export const demoProducts = Object.entries(categoryInventory).flatMap(([category, subcategories]) =>
  subcategories.flatMap((subcategory, subcategoryIndex) =>
    productStyles.map((style, styleIndex) => {
      const slug = `demo-${slugify(category)}-${slugify(subcategory)}-${slugify(style)}`;
      const image = `https://images.unsplash.com/photo-${categoryImages[category]}?auto=format&fit=crop&w=900&q=85&ixid=${slug}`;
      const price = 599 + ((subcategoryIndex * 173 + styleIndex * 211 + category.length * 29) % 3600);
      const sizes = wearable(category) ? (category === "Kids" ? ["2-3Y", "4-5Y", "6-7Y"] : ["S", "M", "L", "XL"]) : [];
      const colors = ["Black", "Ivory", "Blue"];
      const variants = sizes.length
        ? sizes.flatMap((size, sizeIndex) => colors.map((color, colorIndex) => ({
          sku: `${slugify(category).slice(0, 4).toUpperCase()}-${slugify(subcategory).slice(0, 5).toUpperCase()}-${sizeIndex + 1}${colorIndex + 1}`,
          size,
          color,
          price: price + sizeIndex * 25 + colorIndex * 10,
          stock: 8 + ((sizeIndex + colorIndex + styleIndex) % 12),
          isActive: true,
        })))
        : colors.map((color, colorIndex) => ({
          sku: `${slugify(category).slice(0, 4).toUpperCase()}-${slugify(subcategory).slice(0, 5).toUpperCase()}-${colorIndex + 1}`,
          size: "",
          color,
          price: price + colorIndex * 10,
          stock: 8 + ((colorIndex + styleIndex) % 12),
          isActive: true,
        }));
      return {
        sku: `SN-${slugify(category).slice(0, 7).toUpperCase()}-${slugify(subcategory).slice(0, 9).toUpperCase()}-${String(styleIndex + 1).padStart(2, "0")}`,
        name: `${style} ${subcategory}`,
        slug,
        brand: styleIndex % 2 ? "Nova Edit" : "ShopNova",
        category,
        subcategory,
        description: `The ${style.toLowerCase()} ${subcategory.toLowerCase()} is designed for comfortable, confident everyday use, with practical details and a considered finish.`,
        price,
        originalPrice: Math.round(price * 1.25),
        image,
        images: [image],
        sizes,
        colors,
        enableSizes: sizes.length > 0,
        enableColors: true,
        variants,
        stock: variants.reduce((total, variant) => total + variant.stock, 0),
        featured: styleIndex < 2,
        bestseller: styleIndex % 3 === 0,
        newArrival: styleIndex > 6,
        rating: 4.2 + (styleIndex % 7) / 10,
        reviewCount: 8 + styleIndex * 4,
        tags: [slugify(category), slugify(subcategory), slugify(style)],
        material: "Premium blended material",
        care: "Follow the care label for best results.",
      };
    }),
  ),
);

export async function seedCatalog() {
  for (const [name, subcategories] of Object.entries(categoryInventory)) {
    await Category.updateOne(
      { name },
      { $set: { name, slug: slugify(name), subcategories: subcategories.map(item => ({ name: item, slug: slugify(item) })) } },
      { upsert: true },
    );
  }

  const validCategories = Object.keys(categoryInventory);
  await Product.updateMany({ category: { $nin: validCategories } }, { $set: { isActive: false } });
  for (const [category, subcategories] of Object.entries(categoryInventory)) {
    await Product.updateMany(
      { category, subcategory: { $nin: subcategories } },
      { $set: { isActive: false } },
    );
  }
  for (const product of demoProducts) {
    await Product.updateOne({ sku: product.sku }, { $setOnInsert: product }, { upsert: true });
  }
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/"))) {
  if (!process.env.MONGO_URI) throw new Error("Set MONGO_URI in backend/.env before seeding.");
  await mongoose.connect(process.env.MONGO_URI);
  await seedCatalog();
  console.log(`Ensured ${demoProducts.length} repeatable demo products across the approved catalogue.`);
  await mongoose.disconnect();
}
