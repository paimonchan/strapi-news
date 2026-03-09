// scripts/import-data.js
/**
 * Data Import Script for NewsWire Application
 * Creates comprehensive mock data for news articles, categories, and sources
 * 30+ articles across 6 categories with realistic content, authors, and images
 */

require("dotenv").config();

const STRAPI_BASE = "http://localhost:1337";
const STRAPI_URL = `${STRAPI_BASE}/api`;

// Admin credentials — set via env vars or fall back to defaults
const ADMIN_EMAIL = process.env.STRAPI_ADMIN_EMAIL || "admin@newswire.local";
const ADMIN_PASSWORD = process.env.STRAPI_ADMIN_PASSWORD || "Admin1234!";

let adminToken = null;

/**
 * Authenticate with Strapi admin API to get a JWT token.
 * Falls back to API token from STRAPI_API_TOKEN env var if admin login fails.
 */
async function authenticate() {
    // Try API token from env first
    if (process.env.STRAPI_API_TOKEN) {
        console.log("🔑 Using API token from STRAPI_API_TOKEN env var");
        adminToken = process.env.STRAPI_API_TOKEN;
        return;
    }

    // Try admin login
    try {
        console.log(`🔑 Logging in as admin (${ADMIN_EMAIL})...`);
        const response = await fetch(`${STRAPI_BASE}/admin/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
            }),
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error?.message || JSON.stringify(result));
        }
        adminToken = result.data.token;
        console.log("✓ Admin authentication successful\n");
    } catch (error) {
        console.error("✗ Admin login failed:", error.message);
        console.error("\nTo fix this, either:");
        console.error("  1. Set STRAPI_API_TOKEN env var with a valid API token");
        console.error("  2. Set STRAPI_ADMIN_EMAIL and STRAPI_ADMIN_PASSWORD env vars");
        console.error(`  3. Create an admin account with email: ${ADMIN_EMAIL} and password: ${ADMIN_PASSWORD}`);
        process.exit(1);
    }
}

async function createEntry(endpoint, data) {
    try {
        const response = await fetch(`${STRAPI_URL}/${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${adminToken}`,
            },
            body: JSON.stringify({ data }),
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(
                `Failed to create ${endpoint} entry: ${JSON.stringify(result)}`
            );
        }
        console.log(`✓ Created ${endpoint}: ${result.data.id}`);
        return result.data;
    } catch (error) {
        console.error(`✗ Error creating ${endpoint} entry:`, error.message);
        throw error;
    }
}

/**
 * Generate a date string N days ago from today, with a random hour.
 */
function daysAgo(days) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    d.setHours(Math.floor(Math.random() * 14) + 7); // 7am-9pm
    d.setMinutes(Math.floor(Math.random() * 60));
    return d.toISOString();
}

async function runImport() {
    console.log("🚀 Starting data import for NewsWire...\n");

    try {
        // ====================================================================
        // 0. Authenticate
        // ====================================================================
        await authenticate();

        // ====================================================================
        // 1. Create Sources
        // ====================================================================
        console.log("📰 Creating news sources...");
        const sourcesData = [
            {
                name: "TechCrunch",
                url: "https://techcrunch.com",
                description: "Technology news and startup insights",
            },
            {
                name: "CNN",
                url: "https://www.cnn.com",
                description: "Cable News Network",
            },
            {
                name: "BBC News",
                url: "https://www.bbc.com/news",
                description: "British Broadcasting Corporation News",
            },
            {
                name: "The New York Times",
                url: "https://www.nytimes.com",
                description: "American daily newspaper",
            },
            {
                name: "The Guardian",
                url: "https://www.theguardian.com",
                description: "Independent news organization",
            },
            {
                name: "Reuters",
                url: "https://www.reuters.com",
                description: "International news agency",
            },
        ];

        const createdSources = {};
        for (const source of sourcesData) {
            const createdSource = await createEntry("sources", source);
            createdSources[source.name] = createdSource;
        }
        console.log("");

        // ====================================================================
        // 2. Create Categories
        // ====================================================================
        console.log("📁 Creating categories...");
        const categoriesData = [
            { name: "Technology" },
            { name: "Business" },
            { name: "Sports" },
            { name: "Entertainment" },
            { name: "Health" },
            { name: "Science" },
        ];

        const createdCategories = {};
        for (const category of categoriesData) {
            const createdCategory = await createEntry("categories", category);
            createdCategories[category.name] = createdCategory;
        }
        console.log("");

        // ====================================================================
        // 3. Create News Articles (30+ articles with full content)
        // ====================================================================
        console.log("📰 Creating news articles...");
        const newsData = [
            // ── TECHNOLOGY (6 articles) ──────────────────────────────────
            {
                title: "OpenAI Releases GPT-5 with Multimodal Capabilities",
                summary: "Latest AI model showcases unprecedented understanding of images, video, and text, setting a new benchmark for artificial intelligence.",
                content: "OpenAI has officially unveiled GPT-5, its most advanced language model to date, featuring native multimodal capabilities that allow it to process and generate text, images, audio, and video within a single unified architecture.\n\nThe new model demonstrates significant improvements in reasoning, with benchmark scores surpassing previous generations by over 40% on complex problem-solving tasks. Notably, GPT-5 can analyze video content in real-time, describe scenes with remarkable accuracy, and even generate short video clips from text descriptions.\n\nIndustry analysts predict the model will have far-reaching implications for sectors ranging from healthcare diagnostics to creative content production. Early partners including Microsoft, Salesforce, and several healthcare startups have already begun integrating the technology into their platforms.\n\n\"This represents a fundamental shift in how AI systems understand and interact with the world,\" said OpenAI's CEO during the launch event. The model will be available through a phased rollout starting next month, with enterprise customers gaining access first.",
                url: "https://techcrunch.com/openai-gpt5-release",
                image: "https://picsum.photos/seed/ai-gpt5/800/450",
                author: "Sarah Chen",
                publishedAt: daysAgo(1),
                source: "TechCrunch",
                category: "Technology",
            },
            {
                title: "Apple Announces Next Generation M4 Ultra Chip",
                summary: "New chip brings significant performance improvements for MacBook Pro lineup with dedicated AI processing cores.",
                content: "Apple today revealed the M4 Ultra, the latest addition to its custom silicon lineup, delivering what the company calls the biggest generational leap in Mac performance history.\n\nThe M4 Ultra features a 32-core CPU, 80-core GPU, and a dedicated 40-core Neural Engine capable of processing 38 trillion operations per second. Built on TSMC's advanced 3nm process, the chip integrates 92 billion transistors into a single unified memory architecture supporting up to 256GB of RAM.\n\nBenchmark results shared during the keynote showed the M4 Ultra outperforming the previous M3 Ultra by 60% in multi-threaded workloads and 45% in GPU-intensive tasks. The chip also includes hardware-accelerated ray tracing and mesh shading for professional 3D applications.\n\nThe new MacBook Pro models featuring the M4 Ultra will start at $3,499 and ship within two weeks. Apple also announced that Final Cut Pro and Logic Pro have been fully optimized for the new architecture, with real-time 8K video editing now possible without proxy workflows.",
                url: "https://techcrunch.com/apple-m4-ultra-announcement",
                image: "https://picsum.photos/seed/apple-m4/800/450",
                author: "Marcus Johnson",
                publishedAt: daysAgo(3),
                source: "TechCrunch",
                category: "Technology",
            },
            {
                title: "Meta Launches Advanced VR Headset with Neural Interface",
                summary: "Revolutionary technology allows users to control virtual environments with neural signals, eliminating the need for hand controllers.",
                content: "Meta has unveiled its next-generation virtual reality headset, the Quest Pro 2, featuring a groundbreaking neural interface band that reads electrical signals from the wearer's wrist to enable controller-free interaction with virtual environments.\n\nThe technology, developed over five years by Meta's Reality Labs division, uses electromyography sensors to detect subtle nerve signals before they even reach the fingers. This allows users to type, gesture, and manipulate virtual objects with natural hand movements and minimal physical effort.\n\nIn a live demonstration, Meta CEO Mark Zuckerberg showed the headset being used for complex tasks including virtual sculpting, document editing, and multiplayer gaming — all without touching a single physical controller. The headset itself weighs just 380 grams, a 35% reduction from its predecessor.\n\n\"We believe this is the input method that will finally make VR feel as natural as the real world,\" Zuckerberg said. The Quest Pro 2 is priced at $999 and will be available for pre-order starting March 15, with shipping beginning in April.",
                url: "https://theguardian.com/tech/meta-vr-neural",
                image: "https://picsum.photos/seed/meta-vr/800/450",
                author: "Emma Richardson",
                publishedAt: daysAgo(5),
                source: "The Guardian",
                category: "Technology",
            },
            {
                title: "Quantum Computing Reaches Major Error Correction Milestone",
                summary: "Google achieves quantum advantage with new error correction breakthrough that could accelerate practical quantum applications.",
                content: "Google's quantum computing division has announced a breakthrough in quantum error correction that brings practical, large-scale quantum computing significantly closer to reality.\n\nThe team demonstrated a logical qubit with an error rate below the critical threshold needed for useful computation — a milestone researchers have pursued for over two decades. Using their latest Willow processor with 105 physical qubits, they achieved a logical error rate of just 0.001%, a hundredfold improvement over previous results.\n\nThis achievement means that adding more qubits now actually reduces errors rather than increasing them, overcoming what had been the fundamental obstacle to scaling quantum computers. The implications are profound for fields like drug discovery, materials science, cryptography, and optimization problems.\n\n\"We've crossed a critical threshold,\" said the project lead. \"For the first time, we can confidently say that building a useful, fault-tolerant quantum computer is an engineering challenge, not a physics one.\" Google plans to build a 1,000-logical-qubit system by 2028.",
                url: "https://bbc.com/news/quantum-computing-milestone",
                image: "https://picsum.photos/seed/quantum/800/450",
                author: "Dr. James Liu",
                publishedAt: daysAgo(7),
                source: "BBC News",
                category: "Technology",
            },
            {
                title: "Cybersecurity Firms Report Record Number of AI-Powered Attacks",
                summary: "Data shows alarming rise in sophisticated AI-driven cyberattacks targeting enterprise infrastructure and supply chains.",
                content: "A consortium of leading cybersecurity firms has published a joint report revealing that AI-powered cyberattacks increased by 300% in the past year, with enterprise systems and supply chains being the primary targets.\n\nThe report, compiled by CrowdStrike, Palo Alto Networks, and Mandiant, documents how threat actors are using generative AI to craft highly convincing phishing campaigns, automate vulnerability discovery, and create polymorphic malware that evades traditional detection systems.\n\nParticularly concerning is the rise of \"AI agents\" used in attacks — autonomous systems that can probe networks, adapt their strategies based on defensive responses, and persist for weeks without human intervention. Several Fortune 500 companies reported breaches attributed to these advanced persistent threats.\n\n\"The asymmetry between attackers and defenders has never been greater,\" said the CrowdStrike CEO. The report recommends organizations adopt AI-powered defensive tools, implement zero-trust architectures, and conduct regular red team exercises simulating AI-driven attacks. Government agencies in the US and EU are expected to issue updated cybersecurity guidelines in response.",
                url: "https://nytimes.com/tech/cybersecurity-ai-attacks",
                image: "https://picsum.photos/seed/cybersec/800/450",
                author: "Rachel Dominguez",
                publishedAt: daysAgo(10),
                source: "The New York Times",
                category: "Technology",
            },
            {
                title: "Electric Vehicle Charging Network Doubles Across Europe",
                summary: "EU investment program accelerates deployment of fast-charging stations along major highways and urban centers.",
                content: "The European Union's ambitious EV infrastructure program has reached a major milestone, with the total number of public fast-charging stations across the continent surpassing 500,000 — double the figure from just 18 months ago.\n\nThe expansion has been driven by €4.2 billion in combined public and private investment, with charging networks now covering 95% of major highway routes in the EU. Ultra-fast chargers capable of adding 300km of range in just 15 minutes now account for 40% of all new installations.\n\nThe buildout has had a measurable impact on EV adoption rates. Registration data shows battery electric vehicles now represent 38% of all new car sales in Europe, up from 24% the previous year. Range anxiety, long cited as the primary barrier to adoption, has dropped significantly in consumer surveys.\n\n\"We're approaching the tipping point where charging an EV becomes as convenient as refueling a petrol car,\" said the EU Energy Commissioner. The next phase of the program targets rural areas and apartment complexes, where charging access has lagged behind.",
                url: "https://reuters.com/tech/ev-charging-europe",
                image: "https://picsum.photos/seed/ev-charge/800/450",
                author: "Klaus Weber",
                publishedAt: daysAgo(12),
                source: "Reuters",
                category: "Technology",
            },

            // ── BUSINESS (6 articles) ────────────────────────────────────
            {
                title: "Global Stock Markets Reach Record Highs Amid AI Boom",
                summary: "Bull market continues as investor confidence strengthens across technology and healthcare sectors.",
                content: "Global equity markets hit all-time highs this week, fueled by continued enthusiasm around artificial intelligence investments and stronger-than-expected corporate earnings across multiple sectors.\n\nThe S&P 500 crossed the 6,500 mark for the first time, while the NASDAQ Composite gained 4.2% in a single trading session. European indices followed suit, with the STOXX 600 reaching its own record. Asian markets, led by Japan's Nikkei 225, also posted significant gains.\n\nTechnology companies remain the primary driver, with the \"Magnificent Seven\" tech stocks accounting for roughly 35% of the S&P 500's total market capitalization. However, analysts note that the rally has broadened considerably, with healthcare, industrials, and financial sectors all contributing meaningful gains.\n\n\"What started as a narrow AI-driven rally has evolved into a broad-based bull market,\" said a Goldman Sachs chief strategist. \"Corporate balance sheets are healthy, consumer spending remains resilient, and inflation is trending toward central bank targets.\" Economists caution, however, that elevated valuations leave markets vulnerable to disappointment if earnings growth fails to meet expectations.",
                url: "https://reuters.com/business/global-markets-record",
                image: "https://picsum.photos/seed/stocks/800/450",
                author: "David Park",
                publishedAt: daysAgo(1),
                source: "Reuters",
                category: "Business",
            },
            {
                title: "Major Tech Company Acquires AI Startup for $12 Billion",
                summary: "Strategic acquisition aims to strengthen cloud computing and enterprise AI capabilities in competitive market.",
                content: "In one of the largest technology acquisitions of the year, a major cloud computing company has agreed to acquire an AI infrastructure startup for approximately $12 billion in a cash-and-stock deal.\n\nThe target company, which develops specialized chips and software for training large AI models, has seen its revenue grow tenfold in the past two years as demand for AI computing infrastructure has exploded. The acquisition is expected to give the buyer a significant advantage in the increasingly competitive cloud AI market.\n\nThe deal includes the startup's team of 800 engineers, many of whom are recognized experts in machine learning optimization and hardware design. The acquiring company plans to integrate the startup's technology into its cloud platform, potentially offering customers AI training speeds up to five times faster than current solutions.\n\nRegulatory approval is expected within six months, though antitrust watchdogs in both the US and EU have signaled they will scrutinize the deal closely. \"In the current environment, any large tech acquisition faces heightened regulatory attention,\" noted a securities lawyer familiar with the process.",
                url: "https://nytimes.com/business/tech-acquisition-ai",
                image: "https://picsum.photos/seed/acquisition/800/450",
                author: "Michael Torres",
                publishedAt: daysAgo(4),
                source: "The New York Times",
                category: "Business",
            },
            {
                title: "Oil Prices Drop 15% as OPEC Increases Production Targets",
                summary: "Market reacts sharply to surprise decision by major oil-producing nations to boost output amid weakening demand.",
                content: "Crude oil prices fell sharply on Wednesday after OPEC+ announced an unexpected increase in production quotas, sending Brent crude below $60 per barrel for the first time in over two years.\n\nThe cartel agreed to raise output by 1.5 million barrels per day starting next quarter, citing the need to defend market share against rising US shale production and growing adoption of electric vehicles. The decision caught markets off guard, as most analysts had expected production cuts to continue.\n\nThe price drop rippled across global energy markets. Energy stocks on major exchanges fell between 5% and 12%, while renewable energy companies saw their shares rise on expectations that cheaper oil would accelerate the energy transition narrative in policy circles.\n\nConsumers are likely to see relief at the pump within weeks. Gasoline futures dropped 8% in after-hours trading, and analysts project retail prices could fall by 20-30 cents per gallon by the end of the month. However, economists warn that sustained low oil prices could trigger production cutbacks in higher-cost regions like the North Sea and Canadian oil sands.",
                url: "https://reuters.com/business/oil-prices-opec",
                image: "https://picsum.photos/seed/oil-prices/800/450",
                author: "Fatima Al-Rashid",
                publishedAt: daysAgo(6),
                source: "Reuters",
                category: "Business",
            },
            {
                title: "Cryptocurrency Regulation Framework Takes Shape in US",
                summary: "Bipartisan bill establishes clear rules for digital assets, providing long-sought regulatory clarity for the industry.",
                content: "The US Senate passed landmark cryptocurrency legislation with bipartisan support, establishing a comprehensive regulatory framework for digital assets that the industry has sought for years.\n\nThe bill creates distinct categories for digital assets — payment tokens, security tokens, and utility tokens — each with tailored regulatory requirements. It designates the CFTC as the primary regulator for decentralized cryptocurrencies like Bitcoin, while the SEC retains authority over tokens that function as securities.\n\nKey provisions include mandatory reserve requirements for stablecoin issuers, registration requirements for cryptocurrency exchanges, and consumer protection rules including custody standards and disclosure requirements. The bill also establishes a framework for decentralized finance (DeFi) protocols, though critics argue these rules may be difficult to enforce.\n\nBitcoin rose 12% on the news, briefly touching $95,000, as market participants interpreted the legislation as legitimizing the asset class. Major cryptocurrency companies including Coinbase and Circle issued statements welcoming the regulatory clarity. The bill now moves to the House, where a companion bill is expected to pass within weeks.",
                url: "https://cnn.com/business/crypto-regulation",
                image: "https://picsum.photos/seed/crypto-reg/800/450",
                author: "Jason Park",
                publishedAt: daysAgo(8),
                source: "CNN",
                category: "Business",
            },
            {
                title: "Retail Sales Surge as Consumer Confidence Hits Three-Year High",
                summary: "Consumer spending reaches highest levels since pandemic recovery began, driven by strong job market and wage growth.",
                content: "US retail sales jumped 1.8% in January, well above economists' expectations of 0.9%, as a strong labor market and rising wages continued to fuel consumer spending across categories.\n\nThe Commerce Department report showed broad-based strength, with electronics and appliance stores posting the largest gains at 4.2%, followed by clothing retailers at 3.1% and restaurants at 2.7%. Online sales grew 2.4%, maintaining their steady capture of retail market share.\n\nThe consumer confidence index from the Conference Board rose to its highest level since early 2023, supported by unemployment at 3.6% and average hourly earnings growing at 4.1% annually — comfortably above the current inflation rate of 2.3%.\n\n\"The American consumer remains the engine of the global economy,\" said a senior economist at JPMorgan. \"With real wages growing, balance sheets healthy, and the housing market stabilizing, we see no signs of a meaningful pullback in spending.\" Retailers are cautiously optimistic about the spring season, though some have flagged rising input costs as a potential headwind.",
                url: "https://cnn.com/business/retail-sales-surge",
                image: "https://picsum.photos/seed/retail/800/450",
                author: "Lisa Huang",
                publishedAt: daysAgo(11),
                source: "CNN",
                category: "Business",
            },
            {
                title: "Remote Work Reshapes Commercial Real Estate Markets",
                summary: "Office vacancy rates climb to historic highs in major cities, forcing landlords and investors to rethink urban commercial properties.",
                content: "Commercial real estate markets in major US cities are undergoing a fundamental transformation as the persistence of remote and hybrid work arrangements drives office vacancy rates to levels not seen in decades.\n\nNew data from CBRE shows that average office vacancy rates in the top 20 US metro areas reached 21.3% in the fourth quarter, up from 12.1% pre-pandemic. San Francisco leads with a staggering 35% vacancy rate, followed by Houston at 28% and Chicago at 25%. New York's rate stands at 19%, though Manhattan's premium buildings have fared somewhat better.\n\nThe impact is being felt across the financial system. Several major commercial mortgage-backed securities have been downgraded, and regional banks with heavy commercial real estate exposure are under increased scrutiny from regulators. Some property owners have begun converting office buildings to residential use, though the economics remain challenging.\n\n\"This is not a cyclical downturn — it's a structural shift,\" said a Brookings Institution urban policy researcher. Cities are responding with zoning changes and tax incentives to encourage conversions, but experts say the adjustment process will take years to play out fully.",
                url: "https://nytimes.com/business/remote-work-real-estate",
                image: "https://picsum.photos/seed/realestate/800/450",
                author: "Catherine Brooks",
                publishedAt: daysAgo(14),
                source: "The New York Times",
                category: "Business",
            },

            // ── SPORTS (5 articles) ──────────────────────────────────────
            {
                title: "International Football Tournament Concludes with Thrilling Final",
                summary: "Home team secures victory in dramatic penalty shootout after a 2-2 draw in regulation and extra time.",
                content: "In one of the most dramatic finals in recent memory, the host nation claimed the international football championship with a nerve-wracking penalty shootout victory before 87,000 fans at the national stadium.\n\nThe match itself was a showcase of attacking football. The visiting team took an early 1-0 lead through a stunning long-range strike in the 23rd minute, only for the home side to equalize just before halftime with a header from a corner kick. The second half saw end-to-end action, with both goalkeepers making spectacular saves.\n\nA controversial VAR decision in the 78th minute awarded a penalty to the visitors, which was converted to make it 2-1. But the home team refused to surrender, scoring a dramatic equalizer in the 89th minute that sent the stadium into pandemonium. Extra time failed to produce a winner, setting up the decisive shootout.\n\nIn the shootout, the home goalkeeper became the hero, saving two of five penalties to clinch a 4-2 victory. \"This is for every person in this country who believed in us,\" the captain said through tears during the post-match interview. The victory parade through the capital city drew an estimated two million people to the streets.",
                url: "https://bbc.com/sport/football-final-2026",
                image: "https://picsum.photos/seed/football/800/450",
                author: "Tom Bradley",
                publishedAt: daysAgo(2),
                source: "BBC News",
                category: "Sports",
            },
            {
                title: "Olympic Champion Breaks World Record in 100m Freestyle",
                summary: "Swimmer surpasses 30-year-old record with stunning performance at World Aquatics Championships.",
                content: "A reigning Olympic champion shattered the 100-meter freestyle world record at the World Aquatics Championships, clocking a time of 46.40 seconds to erase a mark that had stood for over three decades.\n\nThe 22-year-old swimmer, who won gold at the previous Olympics, entered the final as the favorite but exceeded all expectations with a performance that left even the most experienced commentators speechless. The previous record of 46.86 seconds, set in 1994, had been considered one of swimming's most untouchable marks.\n\nThe race itself was commanding from start to finish. The swimmer hit the 50-meter turn in 22.18 seconds, already well ahead of world record pace, and maintained the blistering speed through the second half. The nearest competitor finished nearly a full second behind.\n\n\"I knew I had something special tonight,\" the champion said poolside. \"Everything felt perfect — the start, the turns, the final 25 meters. I could feel it was going to be fast, but I didn't realize how fast until I touched the wall and saw the time.\" Swimming analysts are already suggesting the record could fall further at the upcoming Olympics.",
                url: "https://cnn.com/sport/swimming-world-record",
                image: "https://picsum.photos/seed/swimming/800/450",
                author: "Jessica Murray",
                publishedAt: daysAgo(4),
                source: "CNN",
                category: "Sports",
            },
            {
                title: "Basketball League Finals Begin with Overtime Thriller",
                summary: "Two top-seeded teams face off in highly anticipated playoff series opener decided in double overtime.",
                content: "The championship finals tipped off with a double-overtime classic as the two best teams in the league traded blows in a game that lived up to every ounce of its pre-series hype.\n\nThe home team, seeking their first championship in 15 years, appeared to have the game in hand with a 12-point lead midway through the fourth quarter. But the visiting team mounted a furious comeback, capped by a three-pointer with 4.7 seconds remaining to force overtime at 108-108.\n\nThe first overtime period saw both teams trade lead changes six times before ending tied at 121. In the second overtime, fatigue became a factor, but the home team's star guard took over, scoring 11 of his team's 14 points in the period to secure a 135-129 victory. He finished with a triple-double: 47 points, 13 rebounds, and 11 assists.\n\n\"That's why they play the games,\" said the winning coach. \"You can't script this stuff.\" The series continues with Game 2 on Thursday, with the visiting team looking to steal home court advantage. Ticket prices for the remaining games have already surged 200% on resale markets.",
                url: "https://cnn.com/sport/basketball-finals-2026",
                image: "https://picsum.photos/seed/basketball/800/450",
                author: "Andre Williams",
                publishedAt: daysAgo(6),
                source: "CNN",
                category: "Sports",
            },
            {
                title: "Tennis Star Wins Third Grand Slam Title of the Year",
                summary: "Dominant player captures the French Open crown, keeping alive hopes for an unprecedented calendar-year Grand Slam.",
                content: "The world's number one tennis player claimed a third consecutive Grand Slam title of the year with a commanding straight-sets victory in the French Open final, keeping alive the possibility of a calendar-year Grand Slam for the first time since 1969.\n\nThe champion, who had already won the Australian Open and the recently relocated Indian Wells Masters, dispatched a determined opponent 6-3, 6-4, 6-2 in just under two hours on Philippe Chatrier Court. The victory was the player's seventh Grand Slam title overall, placing them in elite company among all-time greats.\n\nWhat made the run particularly remarkable was the clay-court dominance displayed throughout the tournament. Not a single set was dropped in seven matches, and only one opponent managed to push a set to a tiebreak. The semifinal victory over the defending champion was particularly clinical.\n\n\"Winning three Slams in a row is something I've dreamed about my whole life,\" the champion said during the trophy presentation. \"But I'm not thinking about the calendar Slam yet. Wimbledon is a completely different surface and challenge.\" Bookmakers have already installed the player as a heavy favorite for the grass-court major.",
                url: "https://bbc.com/sport/tennis-grand-slam",
                image: "https://picsum.photos/seed/tennis/800/450",
                author: "Sophie Martin",
                publishedAt: daysAgo(9),
                source: "BBC News",
                category: "Sports",
            },
            {
                title: "Rugby World Cup Qualifying Matches Draw Record Attendance",
                summary: "Unprecedented crowd numbers recorded across venues as global interest in rugby reaches new heights.",
                content: "Rugby World Cup qualifying matches have broken attendance records across multiple continents, signaling a surge in the sport's global popularity ahead of the next tournament.\n\nTotal attendance across qualifying fixtures surpassed 3.2 million, a 45% increase over the previous cycle. Matches in traditional strongholds like New Zealand, South Africa, and the UK sold out within hours, while emerging rugby nations including Japan, the United States, and Germany reported record crowds at their home venues.\n\nThe growth has been particularly striking in North America, where a US qualifier against Canada drew 62,000 fans to a converted American football stadium — the largest rugby crowd ever recorded on US soil. Japan's match against Samoa attracted 55,000 supporters in Tokyo, reflecting the lasting impact of the 2019 World Cup.\n\n\"Rugby is becoming a truly global sport,\" said the World Rugby chairman. \"The investment in development programs across Asia, the Americas, and continental Europe is paying dividends.\" Television viewership figures were equally impressive, with combined global audiences up 60% from the last qualifying cycle. Organizers are now exploring expanding the World Cup field from 20 to 24 teams.",
                url: "https://reuters.com/sport/rugby-world-cup-qualifying",
                image: "https://picsum.photos/seed/rugby/800/450",
                author: "Patrick O'Brien",
                publishedAt: daysAgo(13),
                source: "Reuters",
                category: "Sports",
            },

            // ── ENTERTAINMENT (5 articles) ───────────────────────────────
            {
                title: "Blockbuster Film Breaks Box Office Records on Opening Weekend",
                summary: "Latest superhero sequel becomes highest-grossing debut ever with $412 million worldwide in three days.",
                content: "The highly anticipated superhero sequel shattered box office records with a staggering $412 million worldwide opening weekend, surpassing the previous record by nearly $50 million and exceeding studio projections by 30%.\n\nDomestically, the film earned $215 million across its first three days, with sellout screenings across more than 4,600 theaters. International markets contributed $197 million, led by China ($58 million), the UK ($32 million), and South Korea ($21 million). The film also set records for Thursday preview screenings and IMAX presentations.\n\nCritics have been largely positive, with the film holding a 91% approval rating on Rotten Tomatoes. Audiences gave it an A+ CinemaScore, suggesting strong word-of-mouth that could sustain its theatrical run for weeks. The film's blend of spectacular action sequences, genuine emotional depth, and humor appears to have resonated with both longtime fans and newcomers to the franchise.\n\n\"These numbers are extraordinary even by modern blockbuster standards,\" said a senior box office analyst. \"The film is tracking to become one of the five highest-grossing movies of all time.\" The studio has already confirmed that a sequel is in active development, with the director expected to return.",
                url: "https://cnn.com/entertainment/box-office-record",
                image: "https://picsum.photos/seed/movies/800/450",
                author: "Kevin Wright",
                publishedAt: daysAgo(2),
                source: "CNN",
                category: "Entertainment",
            },
            {
                title: "Grammy Awards Announce Surprise Nominations for 2026",
                summary: "Major categories see unexpected choices as fresh indie artists compete alongside established superstars.",
                content: "The Recording Academy announced its nominations for the 68th Annual Grammy Awards, delivering several surprises that reflect the music industry's shifting landscape and growing influence of independent artists.\n\nThe Album of the Year category features an eclectic mix of nominees, including a debut album from a 23-year-old bedroom producer alongside releases from three of the world's biggest pop stars. The Song of the Year nominations are equally diverse, spanning genres from Afrobeat to country to electronic music.\n\nPerhaps the biggest surprise was the five nominations earned by a previously little-known folk artist from rural Tennessee, whose independently released album gained viral attention through social media. The album, recorded in a home studio for under $5,000, is now competing against productions with budgets in the millions.\n\n\"The nominations reflect what listeners actually care about, not what labels push,\" said a veteran music journalist. Streaming data supports the trend: independent artists now account for 40% of all music consumption, up from 25% just five years ago. The ceremony will take place in February at Crypto.com Arena in Los Angeles, with a still-to-be-announced host.",
                url: "https://theguardian.com/music/grammys-2026",
                image: "https://picsum.photos/seed/grammys/800/450",
                author: "Priya Patel",
                publishedAt: daysAgo(5),
                source: "The Guardian",
                category: "Entertainment",
            },
            {
                title: "Streaming Platform's New Series Breaks Viewership Records",
                summary: "Epic fantasy adaptation draws 48 million viewers in first week, becoming the most-watched premiere in streaming history.",
                content: "A major streaming platform's latest original series has set a new record for the most-watched premiere in streaming history, attracting 48 million viewers in its first seven days — surpassing the previous record by 11 million.\n\nThe series, an adaptation of a bestselling fantasy novel trilogy, features a reported $250 million production budget that is evident in its sweeping landscapes, intricate practical effects, and dense world-building. The eight-episode first season was released in a weekly format rather than all at once, a strategy that appears to have fueled sustained social media conversation.\n\nCritics have praised the show's nuanced storytelling, diverse cast, and willingness to diverge from the source material in ways that enhance the narrative. The lead performance has already generated awards season buzz, with several industry publications predicting Emmy nominations.\n\n\"This is the kind of event television that brings people together,\" said the platform's head of content. The series has already been renewed for a second and third season, with production scheduled to begin this summer in New Zealand and Iceland. Fan communities have exploded online, with dedicated subreddits and Discord servers attracting hundreds of thousands of members.",
                url: "https://nytimes.com/entertainment/streaming-record",
                image: "https://picsum.photos/seed/streaming/800/450",
                author: "Diana Kim",
                publishedAt: daysAgo(8),
                source: "The New York Times",
                category: "Entertainment",
            },
            {
                title: "Legendary Director Announces Final Film Project",
                summary: "Oscar-winning filmmaker reveals details of ambitious farewell project spanning three decades of storytelling.",
                content: "One of cinema's most celebrated directors has announced what will be their final feature film — an ambitious three-hour epic that the filmmaker describes as the culmination of their 45-year career.\n\nThe project, kept secret for over two years, features an ensemble cast including several actors who appeared in the director's earlier works. The screenplay, written by the director alone, reportedly follows multiple generations of a family across three continents and three decades, weaving together themes of memory, identity, and the passage of time.\n\nProduction is already underway, with filming locations in Japan, Italy, Mexico, and the American Midwest. The director is working with their longtime cinematographer, using a mix of 70mm film and select digital photography. The estimated budget of $100 million is being funded jointly by two studios.\n\n\"Every film I've made has been building toward this one,\" the director said in a rare extended interview. \"I want to leave cinema with something that says everything I've been trying to say.\" Industry insiders are already positioning the film as a frontrunner for major awards, though its release is not expected until late next year.",
                url: "https://theguardian.com/film/director-final-film",
                image: "https://picsum.photos/seed/cinema/800/450",
                author: "Oliver Grant",
                publishedAt: daysAgo(11),
                source: "The Guardian",
                category: "Entertainment",
            },
            {
                title: "Concert Tour Sets New Global Revenue Record of $1.2 Billion",
                summary: "Music superstar becomes highest-grossing touring act of all time with sold-out shows across six continents.",
                content: "A global music superstar has officially become the highest-grossing touring artist of all time, with their current world tour surpassing $1.2 billion in total revenue across 146 shows on six continents.\n\nThe tour, which launched 14 months ago and has visited 52 countries, consistently sold out stadiums with capacities ranging from 50,000 to 100,000. Average ticket prices ranged from $150 to $450, with VIP packages reaching $2,500. Merchandise sales contributed an additional estimated $180 million to the total.\n\nThe economic impact extended far beyond ticket and merch sales. Cities hosting the shows reported significant boosts to local economies through hotel bookings, restaurant visits, and transportation. One economic analysis estimated that each show generated between $50 million and $100 million in local economic activity.\n\n\"This tour has redefined what's possible in live entertainment,\" said a veteran concert promoter. The final leg of the tour includes 20 additional shows across Europe and Asia, projected to push the total revenue past $1.4 billion. The artist has indicated this will be their last large-scale tour for the foreseeable future, with plans to focus on studio work and smaller, more intimate performances.",
                url: "https://theguardian.com/music/concert-tour-record",
                image: "https://picsum.photos/seed/concert/800/450",
                author: "Maria Santos",
                publishedAt: daysAgo(15),
                source: "The Guardian",
                category: "Entertainment",
            },

            // ── HEALTH (5 articles) ──────────────────────────────────────
            {
                title: "Breakthrough Treatment Shows Promise for Alzheimer's Disease",
                summary: "Phase 3 clinical trials demonstrate significant cognitive improvement and plaque reduction in patients with early-stage Alzheimer's.",
                content: "A new antibody treatment for Alzheimer's disease has delivered the most promising clinical trial results to date, with patients showing a 35% slower rate of cognitive decline compared to a placebo group over an 18-month study period.\n\nThe drug, developed by a consortium of pharmaceutical companies, works by targeting and clearing amyloid-beta plaques from the brain — a mechanism that has been the focus of Alzheimer's research for decades. Unlike earlier attempts that showed plaque reduction but limited clinical benefit, this treatment demonstrated meaningful improvements in patients' daily functioning and memory scores.\n\nThe Phase 3 trial enrolled 3,200 patients with early-stage Alzheimer's across 240 clinical sites in 15 countries. Beyond the headline cognitive results, brain imaging showed a 68% average reduction in amyloid plaque burden, and biomarker analysis revealed significant decreases in tau protein levels, another hallmark of the disease.\n\n\"This is not a cure, but it represents the most significant advance in Alzheimer's treatment in our lifetimes,\" said the lead researcher. The companies plan to file for regulatory approval with the FDA and EMA by year's end. If approved, the treatment could benefit an estimated 6 million Americans and 50 million people worldwide living with the disease.",
                url: "https://bbc.com/news/health-alzheimers",
                image: "https://picsum.photos/seed/alzheimers/800/450",
                author: "Dr. Helen Carter",
                publishedAt: daysAgo(3),
                source: "BBC News",
                category: "Health",
            },
            {
                title: "WHO Launches Global Initiative to Combat Antimicrobial Resistance",
                summary: "World Health Organization unveils $4 billion program to develop new antibiotics and reduce overuse of existing drugs.",
                content: "The World Health Organization has launched its most ambitious global health initiative in a decade, committing $4 billion over five years to combat the growing threat of antimicrobial resistance (AMR) — what experts call a \"silent pandemic.\"\n\nThe program focuses on three pillars: accelerating the development of new antibiotics and alternative treatments, implementing global surveillance networks to track resistant pathogens, and reducing unnecessary antibiotic use in both human medicine and agriculture.\n\nAMR currently causes an estimated 1.3 million deaths annually and is projected to rise to 10 million per year by 2050 if left unchecked. The WHO initiative includes funding for 12 new antibiotic candidates currently in early-stage development, as well as novel approaches like phage therapy and antimicrobial peptides.\n\n\"Antimicrobial resistance is one of the greatest threats to global health security,\" said the WHO Director-General. \"Without effective antibiotics, routine surgeries become life-threatening, and minor infections can kill.\" The initiative has secured commitments from 45 countries and several major pharmaceutical companies, which have agreed to maintain antibiotic research programs despite historically low profit margins in the sector.",
                url: "https://reuters.com/health/who-amr-initiative",
                image: "https://picsum.photos/seed/who-health/800/450",
                author: "Dr. Samuel Okafor",
                publishedAt: daysAgo(6),
                source: "Reuters",
                category: "Health",
            },
            {
                title: "Major Study Confirms Exercise Reduces Depression Risk by 40%",
                summary: "Largest-ever meta-analysis of exercise and mental health demonstrates that regular physical activity significantly lowers depression and anxiety.",
                content: "The most comprehensive study ever conducted on the relationship between exercise and mental health has concluded that regular physical activity reduces the risk of depression by 40% and anxiety by 30%, based on data from over 2.4 million participants across 97 studies.\n\nThe meta-analysis, published in The Lancet Psychiatry, found that the benefits were consistent across age groups, genders, and geographic regions. Even modest amounts of exercise — as little as 30 minutes of brisk walking three times per week — produced significant protective effects. Higher-intensity activities like running and strength training showed even greater benefits.\n\nResearchers identified multiple mechanisms driving the effect, including increased production of brain-derived neurotrophic factor (BDNF), improved regulation of the hypothalamic-pituitary-adrenal axis, and enhanced neuroplasticity in brain regions associated with mood regulation. Social aspects of group exercise provided additional benefits.\n\n\"The evidence is now overwhelming,\" said the study's lead author. \"Exercise should be considered a first-line intervention for mild to moderate depression, alongside or even before pharmacological treatment.\" Several national health services are already developing exercise prescription programs based on the findings, with the UK's NHS launching a pilot program next month.",
                url: "https://nytimes.com/health/exercise-depression-study",
                image: "https://picsum.photos/seed/exercise/800/450",
                author: "Dr. Anna Lindqvist",
                publishedAt: daysAgo(9),
                source: "The New York Times",
                category: "Health",
            },
            {
                title: "mRNA Vaccine Technology Expands to Fight Cancer",
                summary: "Personalized mRNA cancer vaccines enter late-stage trials with early results showing tumor reduction in 60% of patients.",
                content: "The mRNA technology that revolutionized COVID-19 vaccines is now showing remarkable promise in the fight against cancer, with personalized cancer vaccines entering Phase 3 clinical trials after impressive early-stage results.\n\nThe approach works by sequencing a patient's tumor to identify unique mutations, then creating a custom mRNA vaccine that trains the immune system to recognize and attack cells carrying those specific mutations. In Phase 2 trials involving 420 patients with advanced melanoma, 60% showed measurable tumor reduction, and 22% achieved complete remission.\n\nWhat makes this approach particularly exciting is its potential applicability across cancer types. Separate trials are now underway for lung, pancreatic, and colorectal cancers. The manufacturing process, which initially took 8 weeks per patient, has been streamlined to just 4 weeks, and costs have dropped from $100,000 to approximately $25,000 per treatment course.\n\n\"We're witnessing the beginning of a new era in oncology,\" said the director of the National Cancer Institute. \"Personalized mRNA vaccines could eventually become a standard part of cancer treatment, used alongside surgery, chemotherapy, and immunotherapy.\" The pivotal Phase 3 trials are expected to enroll 2,500 patients across 150 sites worldwide.",
                url: "https://bbc.com/news/health-mrna-cancer",
                image: "https://picsum.photos/seed/mrna/800/450",
                author: "Dr. Robert Chen",
                publishedAt: daysAgo(12),
                source: "BBC News",
                category: "Health",
            },
            {
                title: "Sleep Deprivation Study Reveals Alarming Cognitive Impacts",
                summary: "Research shows that chronic sleep loss accelerates brain aging by up to 10 years and impairs decision-making comparable to alcohol intoxication.",
                content: "A landmark study from a leading neuroscience research center has revealed that chronic sleep deprivation — getting fewer than six hours per night over extended periods — accelerates brain aging by an estimated 7-10 years and impairs cognitive function to a degree comparable to moderate alcohol intoxication.\n\nThe study followed 12,000 participants over five years using a combination of cognitive testing, brain imaging, and wearable sleep trackers. Those consistently sleeping fewer than six hours showed measurably faster decline in processing speed, working memory, and executive function compared to those sleeping seven to eight hours.\n\nBrain imaging revealed that chronically sleep-deprived participants had significantly reduced gray matter volume in the prefrontal cortex and hippocampus — regions critical for decision-making and memory. The rate of volume loss was comparable to that seen in individuals 7-10 years older who slept adequately.\n\n\"Society treats sleep deprivation as a badge of honor, but the data tells a very different story,\" said the study's principal investigator. \"Getting six hours of sleep doesn't mean you've adapted — it means you've lost the ability to perceive how impaired you are.\" The researchers recommend that public health messaging around sleep be given the same urgency as campaigns against smoking and sedentary lifestyles.",
                url: "https://nytimes.com/health/sleep-deprivation-brain",
                image: "https://picsum.photos/seed/sleep/800/450",
                author: "Dr. Maya Thompson",
                publishedAt: daysAgo(16),
                source: "The New York Times",
                category: "Health",
            },

            // ── SCIENCE (5 articles) ─────────────────────────────────────
            {
                title: "Scientists Discover New Deep-Sea Species in Pacific Ocean Trenches",
                summary: "Expedition to the Mariana Trench reveals three previously unknown species adapted to extreme pressure and darkness.",
                content: "A deep-sea research expedition to the Pacific Ocean's hadal zone has discovered three previously unknown species living at depths exceeding 8,000 meters, where pressure reaches over 800 times atmospheric levels at the surface.\n\nThe expedition, a collaboration between marine biology institutes in Japan, the UK, and the US, deployed advanced autonomous underwater vehicles equipped with high-definition cameras and specimen collection systems. The newly discovered species include a translucent snailfish, a bioluminescent amphipod, and a previously undocumented type of polychaete worm.\n\nThe snailfish, provisionally named the \"ghost snailfish\" for its near-transparent body, was found at 8,336 meters — making it one of the deepest-dwelling vertebrates ever recorded. Its body has evolved remarkable adaptations to extreme pressure, including a skull that lacks mineralized bone entirely, replaced instead by a flexible cartilaginous structure.\n\n\"Every time we explore the deep ocean, we find life that shouldn't theoretically exist under such extreme conditions,\" said the expedition's chief scientist. The discoveries underscore how little of the deep ocean has been explored — by some estimates, less than 5%. The team's findings have been published in Nature and are expected to influence ongoing debates about the limits of habitability, both on Earth and potentially on other worlds.",
                url: "https://bbc.com/news/science-deep-sea-species",
                image: "https://picsum.photos/seed/deepsea/800/450",
                author: "Dr. Yuki Tanaka",
                publishedAt: daysAgo(2),
                source: "BBC News",
                category: "Science",
            },
            {
                title: "Mars Rover Discovers Complex Organic Molecules in Ancient Lake Bed",
                summary: "NASA's Perseverance rover finds organic compounds that could be evidence of ancient microbial life on Mars.",
                content: "NASA's Perseverance rover has detected the most complex organic molecules ever found on Mars, discovered in sedimentary rock samples from what scientists believe was once a deep, long-lived lake in Jezero Crater.\n\nThe molecules, identified using the rover's SHERLOC instrument, include ring-shaped aromatic compounds and long-chain hydrocarbons that, while not definitive proof of life, are consistent with the types of molecules produced by biological processes. The samples also contain mineral signatures indicating the rocks formed in a chemically rich aqueous environment roughly 3.5 billion years ago.\n\nScientists are careful to note that organic molecules can also form through non-biological processes. However, the concentration, diversity, and spatial distribution of the compounds in these particular samples are difficult to explain through purely geological mechanisms alone.\n\n\"These are the most tantalizing results we've obtained from Mars,\" said NASA's Mars Exploration Program director. \"They don't prove life existed, but they significantly strengthen the case for further investigation.\" The rock samples have been sealed in tubes for future retrieval by the Mars Sample Return mission, which would bring them to Earth laboratories capable of far more detailed analysis than any rover instrument can perform.",
                url: "https://reuters.com/science/mars-rover-organics",
                image: "https://picsum.photos/seed/mars/800/450",
                author: "Dr. Carlos Mendez",
                publishedAt: daysAgo(5),
                source: "Reuters",
                category: "Science",
            },
            {
                title: "Climate Scientists Confirm Accelerated Antarctic Ice Sheet Collapse",
                summary: "New satellite data reveals Antarctica's Thwaites Glacier is losing ice 40% faster than models predicted, with implications for global sea levels.",
                content: "An international team of glaciologists has published data showing that Antarctica's Thwaites Glacier — often called the \"Doomsday Glacier\" — is losing ice mass 40% faster than the most recent climate models predicted, raising urgent concerns about future sea level rise.\n\nThe study, published in Science, combines data from multiple satellite systems including ICESat-2, CryoSat-2, and the GRACE-FO gravity measurement satellites. It reveals that warm ocean water is penetrating further beneath the glacier's grounding line than previously understood, melting the ice from below and destabilizing the entire ice shelf.\n\nIf Thwaites were to collapse entirely, it could raise global sea levels by approximately 65 centimeters — enough to inundate coastal cities worldwide. While complete collapse would take decades to centuries, the accelerated melting rate suggests the timeline may be shorter than the IPCC's most recent projections.\n\n\"The Thwaites Glacier is the weak underbelly of the Antarctic ice sheet,\" said the study's lead author. \"What happens here will determine the fate of coastal communities around the world.\" The findings are expected to intensify calls for more aggressive emissions reductions at the upcoming COP climate summit, and have prompted several island nations to request emergency discussions at the United Nations.",
                url: "https://theguardian.com/environment/thwaites-glacier",
                image: "https://picsum.photos/seed/glacier/800/450",
                author: "Dr. Elena Petrov",
                publishedAt: daysAgo(7),
                source: "The Guardian",
                category: "Science",
            },
            {
                title: "CERN Physicists Discover New Fundamental Particle",
                summary: "Large Hadron Collider experiments reveal a previously unknown subatomic particle that could reshape the Standard Model of physics.",
                content: "Physicists at CERN's Large Hadron Collider have announced the discovery of a new subatomic particle that does not fit neatly within the current Standard Model of particle physics — a finding that could fundamentally alter our understanding of the universe's basic building blocks.\n\nThe particle, detected in proton-proton collisions at an energy of 13.6 TeV, has properties that match theoretical predictions made by several beyond-Standard-Model frameworks, including certain supersymmetry theories. It has a mass approximately 750 times that of a proton and decays in a pattern that no known particle exhibits.\n\nThe discovery was made independently by two of the LHC's main detector collaborations, ATLAS and CMS, with each team's data reaching the critical five-sigma threshold of statistical significance required to claim a discovery. The combined dataset represents over three years of collision data.\n\n\"If this result holds up to further scrutiny, it would be the most significant discovery in particle physics since the Higgs boson in 2012,\" said a senior CERN physicist. Theorists worldwide are already publishing papers attempting to explain the new particle within various frameworks. The LHC is scheduled for a luminosity upgrade that will allow much more detailed study of the particle's properties over the coming years.",
                url: "https://bbc.com/news/science/cern-new-particle",
                image: "https://picsum.photos/seed/particle/800/450",
                author: "Dr. François Dupont",
                publishedAt: daysAgo(10),
                source: "BBC News",
                category: "Science",
            },
            {
                title: "Gene Therapy Cures Inherited Blindness in Clinical Trial",
                summary: "Patients with Leber congenital amaurosis regain functional vision after single-dose gene therapy treatment.",
                content: "A groundbreaking gene therapy has restored functional vision to 18 patients with Leber congenital amaurosis (LCA), a rare inherited condition that causes severe vision loss from birth, in results that researchers are calling a \"milestone for genetic medicine.\"\n\nThe therapy works by delivering a functional copy of the RPE65 gene directly to retinal cells using an adeno-associated virus (AAV) vector. Patients who were legally blind prior to treatment showed dramatic improvements in light sensitivity, visual acuity, and the ability to navigate independently — many for the first time in their lives.\n\nThe most remarkable results came from younger patients. A 12-year-old participant, who had never seen stars before, reported being able to see the night sky clearly within three months of treatment. A 28-year-old patient was able to read a book independently for the first time. Follow-up data at 24 months shows the improvements are stable and potentially permanent.\n\n\"Watching a child see their parents' faces for the first time is why we do this work,\" said the trial's principal investigator. The treatment has been submitted for FDA approval, with a decision expected within 12 months. If approved, it would join a small but growing list of gene therapies available for inherited diseases, and could serve as a model for treating other forms of genetic blindness affecting an estimated 200,000 people worldwide.",
                url: "https://nytimes.com/science/gene-therapy-blindness",
                image: "https://picsum.photos/seed/genetherapy/800/450",
                author: "Dr. Amara Osei",
                publishedAt: daysAgo(14),
                source: "The New York Times",
                category: "Science",
            },
        ];

        for (const newsItem of newsData) {
            // Resolve source and category names to IDs
            const entry = {
                title: newsItem.title,
                summary: newsItem.summary,
                content: newsItem.content,
                url: newsItem.url,
                image: newsItem.image,
                author: newsItem.author,
                publishedAt: newsItem.publishedAt,
                source: createdSources[newsItem.source].id,
                category: createdCategories[newsItem.category].id,
            };
            await createEntry("news-articles", entry);
        }

        console.log("\n✅ Data import completed successfully!");
        console.log(`📊 Summary: ${newsData.length} articles imported`);
        console.log(`📁 Categories: ${Object.keys(createdCategories).length}`);
        console.log(`📰 Sources: ${Object.keys(createdSources).length}\n`);
    } catch (error) {
        console.error("\n❌ Data import failed:", error.message);
        process.exit(1);
    }
}

runImport().catch(console.error);
