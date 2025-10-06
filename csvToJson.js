import fs from 'fs';

/**
 * Parses a CSV line handling quoted fields
 */
function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

/**
 * Converts CSV data to array of objects
 */
function parseCsv(csvData) {
  const lines = csvData.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  const textIndex = headers.indexOf('text');
  const labelIndex = headers.indexOf('label');
  
  if (textIndex === -1 || labelIndex === -1) {
    throw new Error('CSV must contain "text" and "label" columns');
  }
  
  const result = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = parseCsvLine(line);
    
    if (values.length > Math.max(textIndex, labelIndex)) {
      const headline = values[textIndex].trim();
      const label = values[labelIndex].trim();
      
      result.push({
        headline,
        label,
        originalLine: line
      });
    }
  }
  
  return result;
}

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Writes array back to CSV format
 */
function writeCsv(records, headers = ['text', 'label']) {
  const lines = [headers.join(',')];
  
  for (const record of records) {
    lines.push(record.originalLine);
  }
  
  return lines.join('\n');
}

/**
 * Main function
 */
async function main() {
  try {
    const args = process.argv.slice(2);
    
    if (args.length < 3) {
      console.log('Usage: node script.js <real.csv> <fake.csv> <output.json>');
      console.log('Example: node script.js real.csv fake.csv dataset.json');
      process.exit(1);
    }
    
    const realCsvPath = args[0];
    const fakeCsvPath = args[1];
    const jsonPath = args[2];
    
    // Check if files exist
    if (!fs.existsSync(realCsvPath)) {
      throw new Error(`File "${realCsvPath}" does not exist`);
    }
    if (!fs.existsSync(fakeCsvPath)) {
      throw new Error(`File "${fakeCsvPath}" does not exist`);
    }
    
    console.log('📖 Reading CSV files...');
    const realCsvData = fs.readFileSync(realCsvPath, 'utf-8');
    const fakeCsvData = fs.readFileSync(fakeCsvPath, 'utf-8');
    
    console.log('🔍 Parsing CSV data...');
    const realRecords = parseCsv(realCsvData);
    const fakeRecords = parseCsv(fakeCsvData);
    
    console.log(`   Real headlines: ${realRecords.length}`);
    console.log(`   Fake headlines: ${fakeRecords.length}`);
    
    // Determine how many to take from each (minimum of both)
    const countToTake = Math.min(realRecords.length, fakeRecords.length);
    console.log(`\n⚖️  Taking ${countToTake} from each file (balanced dataset)`);
    
    // Take the records
    const realToAdd = realRecords.slice(0, countToTake);
    const fakeToAdd = fakeRecords.slice(0, countToTake);
    
    // Convert to JSON format
    const realJsonRecords = realToAdd.map(r => ({
      headline: r.headline,
      isFake: false
    }));
    
    const fakeJsonRecords = fakeToAdd.map(r => ({
      headline: r.headline,
      isFake: true
    }));
    
    // Combine and shuffle
    const newRecords = [...realJsonRecords, ...fakeJsonRecords];
    console.log('🔀 Shuffling records...');
    const shuffledRecords = shuffleArray(newRecords);
    
    // Load existing JSON or create new array
    let existingData = [];
    if (fs.existsSync(jsonPath)) {
      console.log('📄 Loading existing JSON file...');
      const existingJson = fs.readFileSync(jsonPath, 'utf-8');
      existingData = JSON.parse(existingJson);
      console.log(`   Existing records: ${existingData.length}`);
    } else {
      console.log('📄 Creating new JSON file...');
    }
    
    // Append new records
    const updatedData = [...existingData, ...shuffledRecords];
    
    // Save JSON
    console.log('💾 Saving updated JSON...');
    fs.writeFileSync(jsonPath, JSON.stringify(updatedData, null, 2));
    console.log(`   Total records in JSON: ${updatedData.length}`);
    console.log(`   Added: ${shuffledRecords.length} records (${countToTake} real + ${countToTake} fake)`);
    
    // Remove processed records from CSV files
    console.log('\n🗑️  Removing processed records from CSV files...');
    const remainingReal = realRecords.slice(countToTake);
    const remainingFake = fakeRecords.slice(countToTake);
    
    const updatedRealCsv = writeCsv(remainingReal);
    const updatedFakeCsv = writeCsv(remainingFake);
    
    fs.writeFileSync(realCsvPath, updatedRealCsv);
    fs.writeFileSync(fakeCsvPath, updatedFakeCsv);
    
    console.log(`   Remaining in ${realCsvPath}: ${remainingReal.length}`);
    console.log(`   Remaining in ${fakeCsvPath}: ${remainingFake.length}`);
    
    console.log('\n✅ Done!');
    
    // Show preview
    if (shuffledRecords.length > 0) {
      console.log('\n📋 Preview of added records:');
      const preview = shuffledRecords.slice(0, 3);
      console.log(JSON.stringify(preview, null, 2));
      if (shuffledRecords.length > 3) {
        console.log(`   ... and ${shuffledRecords.length - 3} more`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Export functions
export {
  parseCsv,
  parseCsvLine,
  shuffleArray,
  writeCsv
};

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
