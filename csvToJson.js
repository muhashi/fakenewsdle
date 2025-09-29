import fs from 'fs';
import path from 'path';

/**
 * Converts CSV data to JSON format
 * @param {string} csvData - Raw CSV data as string
 * @returns {Array} - Array of objects with headline and isOnion properties
 */
function convertCsvToJson(csvData) {
  const lines = csvData.trim().split('\n');
  const headers = lines[0].split(',');
  
  // Find the indices of text and label columns
  const textIndex = headers.findIndex(header => header.trim().toLowerCase() === 'text');
  const labelIndex = headers.findIndex(header => header.trim().toLowerCase() === 'label');
  
  if (textIndex === -1 || labelIndex === -1) {
    throw new Error('CSV must contain "text" and "label" columns');
  }
  
  const result = [];
  
  // Process each data row (skip header row)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines
    
    // Simple CSV parsing - handles basic cases
    const values = parseCsvLine(line);
    
    if (values.length > Math.max(textIndex, labelIndex)) {
      const headline = values[textIndex].trim();
      const label = values[labelIndex].trim();
      const isOnion = label === '1'; // Convert to boolean: 1 = true (Onion), 0 = false (Not Onion)
      
      result.push({
        headline: headline,
        isOnion: isOnion
      });
    }
  }
  
  return result;
}

/**
 * Filters out records where headline contains the word "onion" (case-insensitive)
 * @param {Array} records - Array of records to filter
 * @returns {Array} - Filtered array without records containing "onion"
 */
function filterOutOnionReferences(records) {
  return records.filter(record => {
    const headline = record.headline.toLowerCase();
    return !headline.includes('onion') && !headline.includes('clickhole') && !headline.includes('horoscope') && !headline.includes('video:') && !headline.includes('[video]') && !headline.includes('quiz:') && !headline.includes('life:') && !headline.includes('heartbreaking:') && !headline.includes('patriothole:') && !headline.includes('shameful:') && !headline.includes('amazing:') && !headline.includes('awesome:');
  });
}

/**
 * Shuffles an array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} - Shuffled array
 */
function shuffleArray(array) {
  const shuffled = [...array]; // Create a copy to avoid mutating original
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Simple CSV line parser that handles quoted fields
 * @param {string} line - CSV line to parse
 * @returns {Array} - Array of field values
 */
function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Handle escaped quotes
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator outside quotes
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last field
  result.push(current);
  
  return result;
}

/**
 * Main function to process CSV file and output JSON
 */
async function main() {
  try {
    // Get command line arguments
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      console.log('Usage: node csv-to-json.js <input-csv-file> [output-json-file]');
      console.log('Example: node csv-to-json.js data.csv output.json');
      process.exit(1);
    }
    
    const inputFile = args[0];
    const outputFile = args[1] || inputFile.replace('.csv', '.json');
    
    // Check if input file exists
    if (!fs.existsSync(inputFile)) {
      throw new Error(`Input file "${inputFile}" does not exist`);
    }
    
    // Read CSV file
    console.log(`Reading CSV file: ${inputFile}`);
    const csvData = fs.readFileSync(inputFile, 'utf-8');
    
    // Convert to JSON
    console.log('Converting CSV to JSON...');
    const jsonData = convertCsvToJson(csvData);
    
    // Filter out records containing "onion"
    console.log('Filtering out records containing "onion"...');
    const filteredData = filterOutOnionReferences(jsonData);
    const filteredCount = jsonData.length - filteredData.length;
    if (filteredCount > 0) {
      console.log(`🗑️  Filtered out ${filteredCount} record(s) containing "onion"`);
    }
    
    // Shuffle the data
    console.log('Shuffling records...');
    const shuffledData = shuffleArray(filteredData);
    
    // Write JSON file
    console.log(`Writing JSON file: ${outputFile}`);
    fs.writeFileSync(outputFile, JSON.stringify(shuffledData));
    
    console.log(`✅ Successfully converted, filtered, and shuffled ${shuffledData.length} records`);
    console.log(`📄 Output saved to: ${outputFile}`);
    
    // Display first few records as preview
    if (shuffledData.length > 0) {
      console.log('\n📋 Preview of shuffled data:');
      const preview = shuffledData.slice(0, 3);
      console.log(JSON.stringify(preview, null, 2));
      if (shuffledData.length > 3) {
        console.log(`... and ${shuffledData.length - 3} more records`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Export functions
export {
  convertCsvToJson,
  parseCsvLine,
  shuffleArray,
  filterOutOnionReferences
};

// Run main function if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
