export interface MovieQuote {
  quote: string;
  movie: string;
  actor?: string;
  translation: string;
  alcoholTag: string;
}

export const DRINKING_QUOTES: MovieQuote[] = [
  {
    quote: "Kaun kambhakt bardaasht karne ko peeta hai ... main toh peeta hoon ke bas saans le sakoon.",
    movie: "Devdas",
    actor: "Dilip Kumar / Shah Rukh Khan",
    translation: "Who drinks to tolerate life... I drink only so that I can breathe.",
    alcoholTag: "Old Monk"
  },
  {
    quote: "Babuji ne kaha gaon chhod do, sabne kaha Paro ko chhod do... tumne kaha sharab chhod do. Aaj tumne keh diya haveli chhod do...",
    movie: "Devdas",
    actor: "Shah Rukh Khan",
    translation: "Father said leave the village, everyone said leave Paro, you said leave alcohol. Today you said leave the mansion...",
    alcoholTag: "Royal Stag"
  },
  {
    quote: "Sharab peene se jigar kharab hota hai ... aur na peene se dil kharab hota hai!",
    movie: "Sharaabi",
    actor: "Amitabh Bachchan",
    translation: "Drinking damages the liver... but not drinking damages the heart!",
    alcoholTag: "Amrut"
  },
  {
    quote: "Jahaan mil baithe teen yaar - Aap, Main aur Bagpiper!",
    movie: "Bagpiper Classic",
    actor: "Jackie Shroff",
    translation: "Where three friends meet - You, Me, and Bagpiper!",
    alcoholTag: "Blenders Pride"
  },
  {
    quote: "Daru badnam kardi... par Bira ne toh pure India ko rangeen bana diya!",
    movie: "Modern Classic Vibes",
    translation: "Alcohol got a bad name... but Bira made all of India colorful!",
    alcoholTag: "Bira 91"
  },
  {
    quote: "Zindagi aur toofan ka naam hai sharab! Aur hum toofan ke khiladi hain.",
    movie: "Toofan",
    actor: "Amitabh Bachchan",
    translation: "Life and storm is the name of alcohol! And we are the players of the storm.",
    alcoholTag: "Kingfisher"
  },
  {
    quote: "Yeh Sula Wine hai babu bhaiya, isse peene ke baad manushya swarg ki sair karne lagta hai!",
    movie: "Hera Pheri Vibe",
    translation: "This is Sula Wine, brother. Drinking this makes a man feel like he is walking in heaven!",
    alcoholTag: "Sula Wines"
  },
  {
    quote: "Desi Daru ki ek boond, dosti ko bana deti hai fevikol se bhi majboot!",
    movie: "Desi Boyz Vibe",
    translation: "One drop of Desi Daru makes friendship stronger than Fevicol!",
    alcoholTag: "Desi Daru"
  },
  {
    quote: "Magic Moments ka ek shot... aur har pal ban jata hai rangeen aur haseen!",
    movie: "Party Starter Vibe",
    translation: "One shot of Magic Moments... and every moment becomes colorful and beautiful!",
    alcoholTag: "Magic Moments"
  }
];

export function getRandomQuote(): MovieQuote {
  const randomIndex = Math.floor(Math.random() * DRINKING_QUOTES.length);
  return DRINKING_QUOTES[randomIndex];
}

export function getQuoteForAlcohol(alcohol: string): MovieQuote | null {
  const match = DRINKING_QUOTES.find(q => q.alcoholTag.toLowerCase() === alcohol.toLowerCase());
  return match || getRandomQuote();
}
