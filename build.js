/**
 * @file build.js
 * @description Aggregates content from folder collections (products, gallery) into single JSON files.
 * This script runs during the Netlify build process.
 */

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const matter = require('gray-matter');

console.log("Starting content aggregation script...");

const contentDir = path.join(__dirname, 'content');
const outputDir = path.join(__dirname, 'assets/data');

// Ensure the output directory exists
fs.ensureDirSync(outputDir);

/**
 * Aggregates files from a specified folder collection.
 * @param {string} collectionName - The name of the folder (e.g., 'products', 'gallery').
 * @param {string} outputFileName - The name of the output JSON file (e.g., 'products.json').
 */
function aggregateCollection(collectionName, outputFileName) {
    const collectionPath = path.join(contentDir, collectionName);
    const files = glob.sync(`${collectionPath}/**/*.md`);
    
    console.log(`Found ${files.length} files in '${collectionName}'.`);

    const data = files.map(file => {
        const content = fs.readFileSync(file, 'utf8');
        const parsed = matter(content);
        // We only need the data from the front matter
        return parsed.data;
    });

    const outputPath = path.join(outputDir, outputFileName);
    fs.writeJsonSync(outputPath, data, { spaces: 2 });
    
    console.log(`Successfully aggregated ${collectionName} data to ${outputPath}`);
}

try {
    // Aggregate products
    aggregateCollection('products', 'products.json');
    
    // Aggregate gallery items
    aggregateCollection('gallery', 'gallery.json');

    console.log("Content aggregation finished successfully.");

} catch (error) {
    console.error("Error during content aggregation:", error);
    process.exit(1); // Exit with an error code
}
