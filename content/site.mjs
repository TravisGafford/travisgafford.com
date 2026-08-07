/* ============================================================================
   SITE CONTENT
   ----------------------------------------------------------------------------
   This is the file to edit when you want to change wording on the site.
   Everything here is plain text between quotes. Change the text, save, done.

   Two rules:
     1. Keep the quotes and the commas where they are.
     2. If your text contains an apostrophe, that's fine, just don't use a
        double quote (") inside double quotes.
   ========================================================================== */

export const site = {
  // --- Core identity -------------------------------------------------------
  url: "https://www.travisgafford.com",
  name: "Travis Gafford",
  jobTitle: "Content Creator, Host, and Industry Consultant",
  tagline: "Fifteen years in competitive gaming as an interviewer, producer, and consultant.",
  location: "Los Angeles, California",
  email: "travis@travisgafford.com",

  // Short suffix for the homepage browser title. Google cuts titles off at
  // roughly 60 characters, and the full job title pushed it over.
  titleSuffix: "Creator, Host, and Industry Consultant",

  // The search-result snippet. Google shows about 155 characters, so this is
  // deliberately kept under that. Anything longer gets truncated mid-sentence.
  metaDescription:
    "Travis Gafford is a creator, host, and consultant with fifteen years in competitive gaming, Magic: The Gathering, and Riftbound. Formerly Yahoo! Esports.",

  // The longer version, used only in structured data. Machines reading the page
  // have no length limit, so this is where the fuller picture goes.
  longDescription:
    "Travis Gafford is a content creator, host, and consultant with fifteen years in competitive gaming and trading card games. He was the lead broadcaster at CBS Interactive and the face of Yahoo! Esports before going independent in 2017. He created and hosted Hotline League, co-hosted the Spotify Original podcast Rift Reaction, and now makes content around Magic: The Gathering and Riftbound while consulting for brands and tournament organizers moving into gaming and TCG.",

  // --- Social profiles -----------------------------------------------------
  // These matter more than they look: they are what tells Google and AI systems
  // that all of these accounts are the same person. Remove any you don't use.
  socials: [
    { label: "YouTube",  url: "https://www.youtube.com/@TravisGafford" },
    { label: "Twitch",   url: "https://www.twitch.tv/travisgafford" },
    { label: "Twitter",  url: "https://x.com/travisgafford" },
    { label: "Instagram",url: "https://www.instagram.com/travisgafford_" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/travisgafford" },
    { label: "Bluesky",  url: "https://bsky.app/profile/travisgafford.bsky.social" },
    { label: "TikTok",   url: "https://tiktok.com/@travisgafford" },
  ],

  // --- Link-in-bio page ----------------------------------------------------
  // This is what /links/ shows. It replaces Linktree: same job, your domain,
  // no ads, no tracking, and it points people at the rest of your site.
  // Reorder freely. The page renders them top to bottom in this order.
  links: {
    intro: "Everything in one place.",

    // Used only for the structured data on /links/. The visible card is the
    // ordinary list item below, labelled "Packs Referral Link".
    promo: {
      show: true,
      partner: "Packs.com",
      url: "https://packs.com/r/travis",
      code: "TRAVIS",
      benefit: "5% bonus",
    },

    items: [
      { label: "League Esports YouTube", url: "https://youtube.com/@TravisGafford" },
      { label: "Riftbound YouTube", url: "https://www.youtube.com/@RiftboundTGI" },
      { label: "Twitch", url: "https://twitch.tv/travisgafford" },
      { label: "Discord", url: "https://discord.gg/Travis" },
      { label: "Twitter", url: "https://twitter.com/travisgafford" },
      { label: "Instagram", url: "https://instagram.com/travisgafford_" },
      // "Referral Link" in the title is the FTC disclosure, so no extra label
      // is needed. sponsored:true adds rel="sponsored" for search engines.
      { label: "Packs Referral Link", url: "https://packs.com/r/travis",
        note: "Affiliate code TRAVIS for a 5% bonus", sponsored: true },
      { label: "Work With Me", url: "/consulting/",
        note: "Consulting, sponsorship, and hosting" },
    ],
  },

  // --- Reach ---------------------------------------------------------------
  // NOTE: these came from your pitch deck, which had "update stats" in the
  // speaker notes. Confirm each one before you go live, or set show:false to
  // hide the whole block.
  reach: {
    show: true,
    stats: [
      { value: "205K", label: "YouTube subscribers" },
      { value: "150K", label: "Twitter followers" },
      { value: "85K",  label: "Twitch followers" },
      { value: "18K",  label: "Instagram followers" },
    ],
  },

  // --- Home page bio -------------------------------------------------------
  // You can use *asterisks* around words to italicize them.
  bio: [
    "I have spent fifteen years in gaming and esports. I started as the lead broadcaster at CBS Interactive, became the face of Yahoo! Esports, and in 2017 went independent under the satirically named *Travis Gafford Industries*.",
    "Most of that run took place in League of Legends: encompassing thousands of interviews, and *Hotline League*, the call-in show I hosted for eight seasons. I stepped back from covering the game full time in 2025. But I have not stopped creating content, and I have not left esports. I still host, still interview, and still take on the projects that interest me.",
    "Alongside that, I have spent the last few years moonlighting in trading card games. I create content around *Magic: The Gathering* and *Riftbound*, the League of Legends TCG, and I run a monthly event for folks in both the digital and cardboard games industries.",
    "The third piece is consulting. Brands and tournament organizers moving into gaming or TCG hire me to figure out influencer, event, and content strategy. That work draws on the same relationships and instincts I have been building since 2011.",
  ],

  // --- What I do (home page cards) ----------------------------------------
  services: [
    {
      title: "Creating",
      body: "Interviews, shows, and event coverage across YouTube, Twitch, and social. Rooted in gaming and esports, and lately in Magic: The Gathering and Riftbound.",
    },
    {
      title: "Hosting",
      body: "Live events, stage panels, and moderated conversations, built on a decade and a half and several thousand interviews with players, executives, and creators.",
    },
    {
      title: "Producing",
      body: "End-to-end production of live shows and tournaments, from concept and creative through sourcing crew and selling sponsorship.",
    },
    {
      title: "Consulting",
      body: "Influencer marketing, event partnerships, and content strategy for brands and organizations moving into gaming or TCG.",
    },
  ],

  // --- Brands worked with --------------------------------------------------
  brands: [
    "Wizards of the Coast",
    "Riot Games",
    "Amazon",
    "Spotify",
    "Mastercard",
    "Alienware",
    "NZXT",
    "OnePlus",
    "Chipotle",
    "Grubhub",
    "Jack in the Box",
    "FlyQuest",
    "Laughing Dragon",
    "Packs.com",
    "CBS Interactive",
    "Yahoo! Esports",
  ],

  // --- Selected work (Work page) ------------------------------------------
  work: [
    {
      title: "Packs.com",
      role: "Consultant",
      partner: "Packs.com",
      year: "2026 — present",
      image: "packs-launch",
      imageAlt: "Travis Gafford at the Packs.com launch party at MagicCon",
      body: "Packs lets you open digital packs of trading cards and have the physical cards shipped to you. I came on in March to work the parts of that business that run on relationships: creator partnerships across *Magic: The Gathering*, Pokémon, and *Riftbound*, and connections to the vendors and suppliers who source the cards themselves. I have also helped design some of the Magic and Riftbound packs on the site, and put together their launch party at MagicCon.",
      results: [
        "Creator partnerships across Magic, Pokémon, and Riftbound",
        "Vendor and supplier connections for card sourcing",
        "Pack design for Magic and Riftbound",
        "Launch party at MagicCon",
      ],
    },
    {
      title: "Riftbound",
      role: "Creator, Consultant, Business Development",
      partner: "Riot Games and Laughing Dragon",
      year: "2025 — present",
      image: "travis-riftbound",
      body: "Riot's League of Legends trading card game sits exactly where my two audiences overlap, so I have worked it from both sides. I make content for players coming to it from League, and I consult for tournament organizer Laughing Dragon on the partnership side.",
      results: [
        "Content for an audience arriving from League, not from card games",
        "Consulted for Laughing Dragon, securing multiple Riot partnerships",
      ],
    },
    {
      title: "Duel Land",
      role: "Concept, Production, Host",
      partner: "FlyQuest",
      year: "2025",
      image: "travis-duelland",
      body: "FlyQuest came to me wanting something that had not been done: a tournament that put esports and trading card games on the same stage. I worked it end to end, from the concept through booking the talent, sourcing production and creative, and helping bring an endemic sponsor on board.",
      results: [
        "16 high-profile TCG and streaming influencers",
        "14 hours of live broadcast",
        "Facilitated endemic sponsorship with SpaceCow Media",
      ],
    },
    {
      title: "Hotline League Worlds Tour",
      role: "Host, Producer",
      partner: "Chipotle and Grubhub",
      year: "2022",
      image: "travis-worldstour",
      body: "Took the show on the road during the League of Legends World Championship, with a run of live audience shows across five venues in three cities, built as branded programming for Chipotle and Grubhub.",
      results: [
        "5 venues across 3 cities",
        "Original branded programming, concept through delivery",
      ],
    },
    {
      title: "Lord of the Rings Set Launch",
      role: "Creator Partner",
      partner: "Wizards of the Coast",
      year: "2023",
      video: "lotr-wotc.mp4",
      poster: "lotr-poster",
      videoAlt: "Travis Gafford in a campaign spot for The Lord of the Rings: Tales of Middle-earth, a Magic: The Gathering set",
      body: "Worked directly with the Wizards of the Coast marketing team on the release of Tales of Middle-earth, producing content around the set launch for an audience that largely came to Magic through gaming and esports rather than through card games.",
      results: [
        "Direct collaboration with WotC marketing",
        "Continued work across later sets",
      ],
    },
    {
      title: "Rift Reaction",
      role: "Host",
      partner: "Spotify Studios and Riot Games",
      year: "2021 — 2023",
      image: "rift-reaction",
      imageAlt: "Rift Reaction, a Spotify Original podcast hosted by Travis Gafford",
      fit: "contain",
      body: "A Spotify Original from Spotify Studios, commissioned under Spotify and Riot's multiyear partnership. I co-hosted with LCS analyst Emily Rand. Each week we gave our read on what had just happened in League esports, from roster moves and rule changes to how a tournament had actually been run, with listener polls and Q&A built into every episode. Spotify ordered two 40-episode seasons.",
      results: [
        "Commissioned for two 40-episode seasons",
        "Spotify Original, exclusive to the platform",
        "4.9 average listener rating on Spotify",
      ],
    },
    {
      title: "Alienware Partnership",
      role: "Talent, Producer",
      partner: "Alienware",
      year: "2017 — 2024",
      image: "travis-alienware",
      body: "A comprehensive partnership spanning everything I made, integrated across my full slate of content rather than bolted onto individual videos. Alienware also sponsored my international esports coverage, which is what made traveling to events abroad possible year after year.",
      results: [
        "5 consecutive annual renewals",
        "Integrated across my entire content slate",
        "Sponsorship of international esports coverage",
      ],
    },
    {
      title: "Hotline League",
      role: "Creator, Host",
      partner: "Independent",
      year: "2017 — 2025",
      image: "travis-hlstage",
      body: "The call-in show that became a fixture of League of Legends esports. Fans phoned in to argue about the game, alongside guests from across the professional scene. It ran for eight seasons before I brought it to a close in 2025.",
      results: [
        "Eight seasons on air",
        "Featured sponsorships from Alienware, Grubhub, Mastercard, and more",
        "Guests from across the professional League scene",
      ],
    },
    {
      title: "TGI Magic Nights",
      role: "Founder, Host",
      partner: "Travis Gafford Industries",
      year: "2023 — present",
      image: "travis-card",
      body: "A monthly *Magic: The Gathering* event for content creators and industry leaders across gaming and esports, hosted at esports team facilities. Deliberately new-player friendly, with a large share of attendees playing Magic for the first time, and prerelease events at every set launch.",
      results: [
        "Monthly cadence since 2023",
        "Attendees drawn from across gaming, not just Magic",
        "Prerelease events at every set launch",
      ],
    },
    {
      title: "Panels and Stage Hosting",
      role: "Host, Moderator",
      partner: "Dragonsteel and Riot Games",
      year: "2025",
      youtube: "L99MPldPacM",
      poster: "dragonsteel-panel",
      videoAlt: "Adaptation, a panel hosted by Travis Gafford with Christian Linke, co-creator of Arcane, and Brandon Sanderson at Dragonsteel Nexus 2025",
      body: "Moderating conversations on stage at industry and fan events. At Dragonsteel Nexus 2025 I hosted *Adaptation*, a conversation between Brandon Sanderson and Christian Linke, co-creator of Arcane. A novelist and a showrunner comparing notes on turning one medium into another. In 2026 I hosted the showmatch Riot ran for the launch of League Classic. Fifteen years of interviewing means I am comfortable steering a panel that is going badly and getting out of the way of one that is going well.",
      results: [
        "Dragonsteel Nexus 2025, Salt Lake City",
        "Brandon Sanderson and Arcane co-creator Christian Linke",
        "Host of Riot's League Classic launch showmatch",
      ],
    },
  ],

  // --- Consulting page block ----------------------------------------------
  consulting: {
    intro:
      "Fifteen years of building an audience in gaming taught me what actually moves people in it, and what only looks like it does. I have produced marketing assets, run branded streams, and advised on partnerships for companies working in both gaming and trading card games. I work directly, not through an agency.",
    areas: [
      {
        title: "Influencer Marketing",
        items: [
          "Influencer marketing strategy",
          "Marketing content concepts",
          "Identifying the right creator partners",
          "Negotiating directly with agencies and influencers",
        ],
      },
      {
        title: "Event Marketing",
        items: [
          "Identifying event partners",
          "Negotiating event partnership agreements",
          "Building standalone brand experiences where partner conflicts exist",
        ],
      },
      {
        title: "Content Marketing",
        items: [
          "Content strategy matched to brand voice",
          "Sourcing production partners",
          "Content release strategy and oversight",
        ],
      },
    ],
    proof: [
      "Ongoing work with Packs.com on creator partnerships, supplier relationships, and product",
      "Consulted for tournament organizer Laughing Dragon, securing multiple Riot partnerships for Riftbound",
      "Produced the Hotline League Worlds Tour and Duel Land, from concept and creative through crew, venue, and sponsorship",
      "Led creator campaigns across Magic, Pokémon, and Riftbound",
      "Hosted influencer after-parties at major TCG events",
    ],
  },

  // --- Contact page --------------------------------------------------------
  contact: {
    intro:
      "The fastest way to reach me is email. I read everything that comes in, and I answer anything that is not a mass send.",
    reasons: [
      { title: "Sponsorship and brand partnerships", body: "Integrations, custom content, event and product support." },
      { title: "Consulting", body: "Influencer, event, and content marketing strategy. Hourly and project engagements." },
      { title: "Press and appearances", body: "Interviews, panels, hosting, and commentary." },
    ],
  },
};

// Navigation. The order here is the order it appears in the header.
export const nav = [
  { label: "Home",     href: "/" },
  { label: "Work",     href: "/work/" },
  { label: "Consulting", href: "/consulting/" },
  { label: "Blog",     href: "/blog/" },
  { label: "Contact",  href: "/contact/" },
];
