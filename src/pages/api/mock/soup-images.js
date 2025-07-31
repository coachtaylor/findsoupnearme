// src/pages/api/mock/soup-images.js
export default function handler(req, res) {
    // Array of reliable, publicly accessible soup images
    const soupImages = [
      'https://images.unsplash.com/photo-1547592166-23ac45744acd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80', // Ramen
      'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80', // Tomato soup
      'https://images.unsplash.com/photo-1613844237701-8f3664fc2eff?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80', // Pumpkin soup
      'https://images.unsplash.com/photo-1607116667981-ff148a4e754d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80', // Mushroom soup
      'https://images.unsplash.com/photo-1616501268209-edfff098fdd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80', // Ramen closeup
      'https://images.unsplash.com/photo-1604152135912-04a022e23696?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80'  // Chicken soup
    ];
  
    // Get the index from the query or use a random one
    const { index } = req.query;
    const imageIndex = index ? parseInt(index) % soupImages.length : Math.floor(Math.random() * soupImages.length);
    
    // Return an image URL
    return res.status(200).json({ imageUrl: soupImages[imageIndex] });
  }