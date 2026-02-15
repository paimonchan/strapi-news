// scripts/import-data.js
/**
 * Data Import Script for NewsWire Application
 * Creates comprehensive mock data for news articles, categories, and sources
 * Based on CLAUDE.md specification with 25+ articles across 6 categories
 */

const API_TOKEN = "e4a8154a3dc2929a55cd9f2ee5067fb2a569f968363dda7ca30c4ff40575b045fb20cf0e516c374a41ad92b2541aa12c781bd8cbbd0137fc523411890b9f07c98cc6eb20509380159f798a18de9b8174abbb80e0f4edac1b1cbcf191e61ef2404dd5fda9b7c40612f9e249af4b5ee343d9250bf80eee6247e795e6c1e0d785b9"; // TODO: Replace with your actual API token if authentication is enabled
const STRAPI_URL = "http://localhost:1337/api";

async function createEntry(endpoint, data) {
    try {
        const response = await fetch(`${STRAPI_URL}/${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${API_TOKEN}`, // Uncomment and set token if needed
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

async function runImport() {
    console.log("🚀 Starting data import for NewsWire...\n");

    try {
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
        // 3. Create News Articles (25+ articles)
        // ====================================================================
        console.log("📰 Creating news articles...");
        const newsData = [
            // TECHNOLOGY (5 articles)
            {
                title: "OpenAI Releases GPT-5 with Multimodal Capabilities",
                summary:
                    "Latest AI model showcases unprecedented understanding of images, video, and text.",
                url: "https://techcrunch.com/openai-gpt5-release",
                publishedAt: "2026-02-15T14:30:00Z",
                source: createdSources["TechCrunch"].id,
                category: createdCategories["Technology"].id,
            },
            {
                title: "Apple Announces Next Generation M4 Chip",
                summary:
                    "New chip brings significant performance improvements for MacBook Pro lineup.",
                url: "https://techcrunch.com/apple-m4-announcement",
                publishedAt: "2026-02-14T10:15:00Z",
                source: createdSources["TechCrunch"].id,
                category: createdCategories["Technology"].id,
            },
            {
                title: "Meta Launches Advanced VR Headset with Neural Interface",
                summary:
                    "Revolutionary technology allows users to control devices with thoughts.",
                url: "https://techcrunch.com/meta-vr-neural",
                publishedAt: "2026-02-13T09:45:00Z",
                source: createdSources["The Guardian"].id,
                category: createdCategories["Technology"].id,
            },
            {
                title: "Quantum Computing Reaches Major Milestone",
                summary:
                    "Google achieves quantum advantage with new error correction breakthrough.",
                url: "https://bbc.com/news/quantum-computing",
                publishedAt: "2026-02-12T16:20:00Z",
                source: createdSources["BBC News"].id,
                category: createdCategories["Technology"].id,
            },
            {
                title: "Cybersecurity Firms Report Record Breaches in 2026",
                summary:
                    "Data shows concerning trend in enterprise security vulnerabilities.",
                url: "https://nytimes.com/tech/cybersecurity",
                publishedAt: "2026-02-11T11:30:00Z",
                source: createdSources["The New York Times"].id,
                category: createdCategories["Technology"].id,
            },

            // BUSINESS (5 articles)
            {
                title: "Global Stock Markets Reach Record Highs",
                summary:
                    "Bull market continues as investor confidence strengthens across sectors.",
                url: "https://reuters.com/business/markets",
                publishedAt: "2026-02-15T13:00:00Z",
                source: createdSources["Reuters"].id,
                category: createdCategories["Business"].id,
            },
            {
                title: "Major Tech Company Acquires Startup for $10 Billion",
                summary:
                    "Strategic acquisition aims to strengthen AI and cloud computing division.",
                url: "https://nytimes.com/business/acquisition",
                publishedAt: "2026-02-14T08:30:00Z",
                source: createdSources["The New York Times"].id,
                category: createdCategories["Business"].id,
            },
            {
                title: "Oil Prices Drop 15% on Supply Increase",
                summary:
                    "Market reacts to increased production from major oil-producing nations.",
                url: "https://reuters.com/business/commodities",
                publishedAt: "2026-02-13T14:15:00Z",
                source: createdSources["Reuters"].id,
                category: createdCategories["Business"].id,
            },
            {
                title: "Cryptocurrency Market Experiences Volatility",
                summary:
                    "Bitcoin and Ethereum fluctuate amid regulatory developments.",
                url: "https://techcrunch.com/crypto-markets",
                publishedAt: "2026-02-12T10:45:00Z",
                source: createdSources["TechCrunch"].id,
                category: createdCategories["Business"].id,
            },
            {
                title: "Retail Sales Surge Ahead of Spring Season",
                summary:
                    "Consumer spending reaches highest levels since pandemic recovery began.",
                url: "https://cnn.com/business/retail",
                publishedAt: "2026-02-11T15:20:00Z",
                source: createdSources["CNN"].id,
                category: createdCategories["Business"].id,
            },

            // SPORTS (5 articles)
            {
                title: "International Football Tournament Concludes with Thrilling Final",
                summary:
                    "Home team secures victory in dramatic penalty shootout.",
                url: "https://bbc.com/sport/football",
                publishedAt: "2026-02-15T20:00:00Z",
                source: createdSources["BBC News"].id,
                category: createdCategories["Sports"].id,
            },
            {
                title: "Olympic Champion Breaks World Record in Swimming",
                summary:
                    "Athlete surpasses 30-year-old record with stunning performance.",
                url: "https://cnn.com/sport/olympics",
                publishedAt: "2026-02-14T17:45:00Z",
                source: createdSources["CNN"].id,
                category: createdCategories["Sports"].id,
            },
            {
                title: "Basketball League Finals Begin with Exciting Matchup",
                summary:
                    "Two top teams face off in highly anticipated playoff series.",
                url: "https://espn.com/nba/finals",
                publishedAt: "2026-02-13T19:30:00Z",
                source: createdSources["CNN"].id,
                category: createdCategories["Sports"].id,
            },
            {
                title: "Tennis Star Wins Grand Slam Championship",
                summary:
                    "Player captures third major title of the year.",
                url: "https://bbc.com/sport/tennis",
                publishedAt: "2026-02-12T18:15:00Z",
                source: createdSources["BBC News"].id,
                category: createdCategories["Sports"].id,
            },
            {
                title: "Rugby World Cup Qualifying Matches Draw Massive Crowds",
                summary:
                    "Unprecedented attendance numbers recorded across venues.",
                url: "https://reuters.com/sport/rugby",
                publishedAt: "2026-02-11T19:00:00Z",
                source: createdSources["Reuters"].id,
                category: createdCategories["Sports"].id,
            },

            // ENTERTAINMENT (5 articles)
            {
                title: "Blockbuster Film Breaks Box Office Records on Opening Weekend",
                summary:
                    "Latest superhero movie becomes highest-grossing debut ever.",
                url: "https://cnn.com/entertainment/movies",
                publishedAt: "2026-02-15T12:30:00Z",
                source: createdSources["CNN"].id,
                category: createdCategories["Entertainment"].id,
            },
            {
                title: "Grammy Awards Announce Nominations for 2026",
                summary:
                    "Major categories see surprising choices and fresh talent.",
                url: "https://theguardian.com/music/grammys",
                publishedAt: "2026-02-14T14:00:00Z",
                source: createdSources["The Guardian"].id,
                category: createdCategories["Entertainment"].id,
            },
            {
                title: "Streaming Giant Releases Highly Anticipated Series",
                summary:
                    "New show breaks viewership records in first 24 hours.",
                url: "https://nytimes.com/entertainment/streaming",
                publishedAt: "2026-02-13T11:20:00Z",
                source: createdSources["The New York Times"].id,
                category: createdCategories["Entertainment"].id,
            },
            {
                title: "Celebrity Couple Confirms Engagement at Awards Show",
                summary:
                    "Surprise proposal captured by millions of television viewers.",
                url: "https://cnn.com/entertainment/celebrities",
                publishedAt: "2026-02-12T20:45:00Z",
                source: createdSources["CNN"].id,
                category: createdCategories["Entertainment"].id,
            },
            {
                title: "Concert Tour Sets New Revenue Records",
                summary:
                    "Music artist becomes highest-grossing touring act of all time.",
                url: "https://theguardian.com/music/concerts",
                publishedAt: "2026-02-11T13:15:00Z",
                source: createdSources["The Guardian"].id,
                category: createdCategories["Entertainment"].id,
            },

            // HEALTH (5 articles)
            {
                title: "Breakthrough Treatment Shows Promise for Alzheimer's Disease",
                summary:
                    "Clinical trials demonstrate significant cognitive improvement in patients.",
                url: "https://bbc.com/news/health",
                publishedAt: "2026-02-15T09:00:00Z",
                source: createdSources["BBC News"].id,
                category: createdCategories["Health"].id,
            },
            {
                title: "WHO Launches Global Health Initiative for Disease Prevention",
                summary:
                    "New program aims to reduce preventable deaths by 50% by 2030.",
                url: "https://reuters.com/health/who",
                publishedAt: "2026-02-14T11:45:00Z",
                source: createdSources["Reuters"].id,
                category: createdCategories["Health"].id,
            },
            {
                title: "Study Links Exercise to Improved Mental Health",
                summary:
                    "Research shows regular physical activity reduces anxiety and depression.",
                url: "https://nytimes.com/health/fitness",
                publishedAt: "2026-02-13T07:30:00Z",
                source: createdSources["The New York Times"].id,
                category: createdCategories["Health"].id,
            },
            {
                title: "Vaccine Program Reaches Milestone Immunity Rates",
                summary:
                    "Global immunization efforts exceed 80% population coverage.",
                url: "https://bbc.com/news/vaccines",
                publishedAt: "2026-02-12T08:00:00Z",
                source: createdSources["BBC News"].id,
                category: createdCategories["Health"].id,
            },
            {
                title: "Sleep Deprivation Study Reveals Unexpected Health Impacts",
                summary:
                    "Research highlights importance of adequate rest for overall wellbeing.",
                url: "https://nytimes.com/health/sleep",
                publishedAt: "2026-02-11T09:30:00Z",
                source: createdSources["The New York Times"].id,
                category: createdCategories["Health"].id,
            },

            // SCIENCE (5 articles)
            {
                title: "Scientists Discover New Species in Deep Ocean Trenches",
                summary:
                    "Expedition reveals previously unknown marine life forms.",
                url: "https://bbc.com/news/science",
                publishedAt: "2026-02-15T10:15:00Z",
                source: createdSources["BBC News"].id,
                category: createdCategories["Science"].id,
            },
            {
                title: "Mars Rover Makes Surprising Discovery of Organic Compounds",
                summary:
                    "Finding suggests possibility of past microbial life on Mars.",
                url: "https://reuters.com/science/space",
                publishedAt: "2026-02-14T15:30:00Z",
                source: createdSources["Reuters"].id,
                category: createdCategories["Science"].id,
            },
            {
                title: "Climate Scientists Warn of Accelerated Ice Melting",
                summary:
                    "New data shows polar ice sheets melting faster than previously predicted.",
                url: "https://theguardian.com/environment/climate",
                publishedAt: "2026-02-13T12:45:00Z",
                source: createdSources["The Guardian"].id,
                category: createdCategories["Science"].id,
            },
            {
                title: "Particle Physics Experiments Detect New Subatomic Particle",
                summary:
                    "Breakthrough potentially reshapes understanding of matter.",
                url: "https://bbc.com/news/science/physics",
                publishedAt: "2026-02-12T13:20:00Z",
                source: createdSources["BBC News"].id,
                category: createdCategories["Science"].id,
            },
            {
                title: "Biotech Company Develops Gene Therapy for Genetic Disorder",
                summary:
                    "New treatment offers hope for patients with previously incurable conditions.",
                url: "https://nytimes.com/science/biotech",
                publishedAt: "2026-02-11T08:45:00Z",
                source: createdSources["The New York Times"].id,
                category: createdCategories["Science"].id,
            },
        ];

        for (const newsItem of newsData) {
            await createEntry("news-articles", newsItem);
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
