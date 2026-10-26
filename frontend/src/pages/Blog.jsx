import React from "react";
import { Link, useParams } from "react-router-dom";
import "./Contact.css";

const posts = [
  [
    "mens-casual-outfit-ideas",
    "Men's Casual Outfit Ideas for Every Day",
    "Men",
    "Build reliable looks around comfortable layers, clean sneakers and one detail that feels distinctly yours.",
  ],
  [
    "right-fit-mens-jeans",
    "How to Choose the Right Fit for Men's Jeans",
    "Men",
    "Rise, leg shape and fabric all change how jeans feel. Here is a practical way to compare them.",
  ],
  [
    "everyday-ethnic-styling",
    "Women's Ethnic Wear: A Guide to Everyday Styling",
    "Women",
    "Make kurtas, sarees and easy separates work harder with considered colour and simple accessories.",
  ],
  [
    "versatile-womens-wardrobe",
    "How to Build a Versatile Wardrobe for Women",
    "Women",
    "A smaller wardrobe can offer more outfits when every layer earns its place.",
  ],
  [
    "kids-comfort-fit-guide",
    "Kids' Clothing: Comfort, Fabric and Fit Guide",
    "Kids",
    "Soft fabrics, room to move and easy care matter as much as an outfit looking great.",
  ],
  [
    "shoes-for-your-outfit",
    "How to Choose the Right Shoes for Your Outfit",
    "Footwear",
    "The right shoe balances the occasion, silhouette and the way you actually move through the day.",
  ],
  [
    "accessories-that-complete-a-look",
    "Fashion Accessories That Complete Your Look",
    "Accessories",
    "Belts, watches, bags and jewellery are small choices with a surprisingly big effect.",
  ],
  [
    "seasonal-wardrobe-essentials",
    "Seasonal Fashion Trends and Wardrobe Essentials",
    "Style",
    "Use trends as inspiration, then anchor them with pieces that keep working after the season changes.",
  ],
].map(([slug, title, category, text], index) => ({
  slug,
  title,
  category,
  text,
  date: `${18 - index} Oct 2026`,
  image: `https://images.unsplash.com/photo-${["1490481651871-ab68de25d43d", "1483985988355-763728e1935b", "1515886657613-9f3515b0c78f", "1496747611176-843222e1e57c", "1503919545889-aef636e10ad4", "1542291026-7eec264c27ff", "1523779917675-b6ed3a42a561", "1445205170230-053b83016050"][index]}?auto=format&fit=crop&w=1000&q=85`,
}));

export default function Blog() {
  const { slug } = useParams();
  const post = posts.find((item) => item.slug === slug);
  if (post)
    return (
      <main className="section container content-page">
        <Link to="/blog" className="back-link">
          ← Back to journal
        </Link>
        <article className="article-detail">
          <img src={post.image} alt="" />
          <div className="article-detail-copy">
            <small>
              {post.category} · {post.date}
            </small>
            <h1>{post.title}</h1>
            <p>{post.text}</p>
            <h2>Start with what feels useful</h2>
            <p>
              Good style is less about following every new direction and more
              about noticing what makes you feel comfortable, confident and
              ready for the day. Choose a dependable base, add texture or
              colour, and leave room for one unexpected detail.
            </p>
            <h2>Make it yours</h2>
            <p>
              Try the idea with what you already own before adding something
              new. A thoughtful wardrobe grows slowly, keeps its promises and
              gives you more ways to express yourself without creating more
              noise.
            </p>
          </div>
        </article>
      </main>
    );
  return (
    <main className="section container content-page">
      <div className="content-hero compact">
        <div className="eyebrow">THE SHOPNOVA JOURNAL</div>
        <h1>
          Ideas for your <span>everyday.</span>
        </h1>
        <p>
          Style notes, thoughtful guides and little ways to make more of the
          moments you already have.
        </p>
      </div>
      <div className="article-grid">
        {posts.map((item) => (
          <article className="article-card" key={item.slug}>
            <img src={item.image} alt="" />
            <div className="article-copy">
              <small>
                {item.category} · {item.date}
              </small>
              <h2>{item.title}</h2>
              <p>{item.text}</p>
              <Link className="text-link" to={`/blog/${item.slug}`}>
                Read the story →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
