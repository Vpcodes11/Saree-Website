export type JournalArticle = {
  slug: string;
  title: string;
  eyebrow: string;
  image: string;
  position?: string;
  excerpt: string;
  readTime: string;
  imageAlt: string;
  introduction: string;
  sections: { title: string; paragraphs: string[] }[];
};

export const journalArticles: JournalArticle[] = [
  {
    slug: "a-drape-of-your-own",
    title: "A drape of your own",
    eyebrow: "The art of wearing",
    image: "/images/contemporary.jpg",
    position: "center 30%",
    excerpt: "A little instinct, a little practice. Making six yards feel entirely like you.",
    readTime: "4 minute read",
    imageAlt: "An expressive contemporary saree silhouette",
    introduction: "A saree takes its shape from the person wearing it. The cloth offers a beginning; your posture, pace and small choices complete the picture. There is room for familiarity, and just as much room to find your own way.",
    sections: [
      { title: "Begin with how you want to feel", paragraphs: ["Before choosing a pleat or a blouse, consider the day ahead. Will you be sitting through a long dinner, walking between celebrations, or making an entrance and staying awhile? A drape that lets you move easily will often look more natural than one you have to keep adjusting.", "Try the saree with the shoes and underlayers you intend to wear. Check the hem while standing, then sit down and take a few steps. These ordinary movements tell you more than a still photograph can."] },
      { title: "Let the pallu set the tone", paragraphs: ["A loose pallu gives the fabric space to move. A neatly gathered one brings the shoulder into focus. Neither choice is more correct; the difference is in the feeling. Look at the border and the weight of the cloth, then decide how much of each you want to show.", "If you use pins, handle them gently and avoid pulling against a delicate weave. Keep their placement comfortable, and check that the drape stays secure without strain."] },
      { title: "Leave a little room for yourself", paragraphs: ["A treasured pair of earrings, a familiar blouse, a flower or nothing at all: the finishing detail need not be elaborate. Let one element lead, and give the others enough quiet to be seen.", "There is no single drape that belongs to everyone. Regional and personal traditions offer many ways to wear a saree. If you are learning a particular style, seek out someone who knows it well, and practise at an unhurried moment. Ease arrives through repetition."] },
    ],
  },
  {
    slug: "the-wedding-guest-edit",
    title: "The wedding guest edit",
    eyebrow: "Notes on occasion",
    image: "/images/festive.jpg",
    position: "center 28%",
    excerpt: "From a sunlit ceremony to an evening gathering, dress for the mood of the moment.",
    readTime: "4 minute read",
    imageAlt: "A festive saree styled for a celebration",
    introduction: "A wedding invitation is also an invitation into someone else’s world. The setting, the hour and the hosts’ wishes offer useful clues. Start there, and choose something you can enjoy wearing through every conversation and photograph.",
    sections: [
      { title: "Read the room, and the invitation", paragraphs: ["Follow any dress guidance the hosts share. Customs and preferences vary between families and ceremonies, so ask if a colour or level of formality feels uncertain. Thoughtfulness is a better guide than a universal rule.", "For a daytime gathering, think about how colour will look in natural light and how the fabric feels in the expected weather. For an evening celebration, a deeper tone or a more defined border can give the silhouette presence without adding many accessories."] },
      { title: "Build around one detail", paragraphs: ["Choose the element you love most: a luminous colour, an intricate edge, a softly textured cloth. Let it guide the blouse and jewellery. When every detail competes for attention, the whole can feel less personal.", "A saree you already own can take on a different mood with another blouse or a changed drape. Try combinations before assuming the occasion needs something new."] },
      { title: "Make comfort part of the occasion", paragraphs: ["Allow time for a full try-on. Walk, sit and check the drape with your chosen footwear. If the celebration has several settings, consider whether the same arrangement will feel comfortable in each.", "The best guest outfit leaves you free to be present. A considered silhouette, a secure drape and a detail that feels like you are a generous place to begin."] },
    ],
  },
  {
    slug: "cloth-worth-keeping",
    title: "Cloth worth keeping",
    eyebrow: "A considered wardrobe",
    image: "/images/editorial-silk.webp",
    position: "center",
    excerpt: "Small habits that make room for the pieces you return to, season after season.",
    readTime: "3 minute read",
    imageAlt: "Illustrative close-up of folded, softly textured silk cloth",
    introduction: "A thoughtful wardrobe is built as much by attention as by addition. Getting to know the cloth you own, and treating it according to its particular needs, can make dressing feel less hurried and more personal.",
    sections: [
      { title: "Read the care label first", paragraphs: ["Sarees differ in fibre, dye, finish and embellishment. A method suited to one piece may damage another. Follow the garment’s care instructions, and ask its maker or a qualified cleaner when the composition or finish is unclear.", "Do not assume that every silk or cotton can be washed in the same way. If a piece is labelled for professional cleaning, share any details you know about the fabric and decoration with the cleaner."] },
      { title: "Give cloth a quiet place", paragraphs: ["Make sure a garment is clean and fully dry before storing it. Choose a dry space away from direct sunlight, and avoid crowding pieces so tightly that delicate details are pressed against one another.", "For a special saree, check its care guidance for the recommended way to fold, wrap or hang it. Heavy embellishment and fine weaves may need different support. Inspect stored pieces from time to time rather than leaving them untouched for years."] },
      { title: "Wear what you already love", paragraphs: ["Keep a small record of combinations that worked: the blouse, the jewellery, the drape. A photograph can help you rediscover an outfit when another occasion arrives.", "Notice which pieces you reach for most, and let that knowledge guide future choices. The aim is not a perfect number of garments. It is a wardrobe in which the cloth has a place in your life."] },
    ],
  },
];
