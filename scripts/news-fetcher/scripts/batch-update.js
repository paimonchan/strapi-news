const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });
require('dotenv').config({ path: path.join(__dirname, '../.env.fetcher') });

const env = process.env.NODE_ENV || 'development';
const isProd = env === 'production';

const STRAPI_URL = isProd
    ? process.env.STRAPI_URL_PRODUCTION
    : (process.env.STRAPI_URL || 'http://127.0.0.1:1337');

const API_TOKEN = isProd
    ? process.env.STRAPI_API_TOKEN_PRODUCTION
    : process.env.STRAPI_API_TOKEN;

const updates = [
    {
        "documentId": "l2ckcwmd0ahfogr8wvkqf5l1",
        "content": "OpenAI has acquired TBPN, a popular founder-led business talk show, marking a new move into original media content."
    },
    {
        "documentId": "jg258dbarvbs50m7st0b7gc1",
        "content": "ElevenLabs has launched a new AI-powered music app, enabling users to generate full songs from simple text descriptions."
    },
    {
        "documentId": "u51ddh8ml6zvojmqku3xc6uz",
        "content": "NASA astronauts have shared the technical challenges of orbital communication, highlighting why deep-space emails are a feat of engineering."
    },
    {
        "documentId": "a0weg51pjgh6teor7lf2u25u",
        "content": "Money transfer app Duc accidentally exposed thousands of sensitive identity documents, including passports, on the public web."
    },
    {
        "documentId": "ejni24w64wabpxu2vwhv2d6a",
        "content": "Microsoft has unveiled three new foundational AI models to compete with rivals in the rapidly evolving enterprise AI market."
    },
    {
        "documentId": "ig0b95gfbx5actw3ezposzct",
        "content": "At least 43 people were killed in an attack by the ADF rebel group in northeastern DR Congo, according to army reports."
    },
    {
        "documentId": "yn3aou778zruwz41hb9o5spe",
        "content": "A new laser-powered wireless system has achieved 360 Gbps speeds while using significantly less power than traditional Wi-Fi."
    },
    {
        "documentId": "lfyiri0q7cdoem9muq1vrysd",
        "content": "President Trump has removed Attorney General Pam Bondi from her post, signaling another major shift in his administration."
    },
    {
        "documentId": "x61ysk0vy0f8ywzsa64o2hxg",
        "content": "The Trump administration has announced sweeping new tariffs on pharmaceutical imports to incentivize domestic production."
    },
    {
        "documentId": "brh12h3haq8qfmkdnv1vnnlc",
        "content": "Tesla reported a weaker-than-expected 6% increase in global deliveries, missing analyst targets amid growing competition."
    },
    {
        "documentId": "awmbkfozayi6rehlmeb2e6in",
        "content": "NASA has successfully launched the Artemis II mission, the first crewed flight to the Moon in over half a century."
    }
];

async function batchUpdate() {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`,
    };

    console.log(`Updating ${updates.length} articles on ${STRAPI_URL}...\n`);

    let success = 0;
    let failed = 0;

    for (const item of updates) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 15000);
            const res = await fetch(`${STRAPI_URL}/api/news-articles/${item.documentId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ data: { content: item.content } }),
                signal: controller.signal,
            });
            clearTimeout(timeout);

            if (res.ok) {
                success++;
                process.stdout.write(`\r✓ Updated ${success}/${updates.length}`);
            } else {
                const err = await res.json();
                failed++;
                console.log(`\n✗ Failed [${item.documentId}]: ${err.error?.message || res.status}`);
            }
        } catch (e) {
            failed++;
            console.log(`\n✗ Error [${item.documentId}]: ${e.message}`);
        }
    }

    console.log(`\n\n============================================================`);
    console.log(`  Done: ${success} updated, ${failed} failed`);
    console.log(`============================================================`);
}

batchUpdate();
