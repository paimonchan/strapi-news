#!/usr/bin/env node
/**
 * Migration Script - Add New Categories
 * Registers 'Politics' and 'World' categories in Strapi
 */

const strapi = require('../lib/strapi-client');
const logger = require('../scripts/logger');

async function migrate() {
    logger.section('Migration: Adding New Categories');

    try {
        // Authenticate first
        await strapi.authenticate();

        const newCategories = ['Politics', 'World'];
        
        for (const catName of newCategories) {
            logger.info(`Checking/Creating category: ${catName}...`);
            const id = await strapi.getOrCreateCategory(catName);
            
            if (id) {
                logger.success(`Category '${catName}' is ready (ID: ${id})`);
            } else {
                logger.fail(`Failed to ensure category '${catName}' exists.`);
            }
        }

        logger.section('Migration Completed');
    } catch (error) {
        logger.error(`Migration failed: ${error.message}`);
        process.exit(1);
    }
}

migrate();
