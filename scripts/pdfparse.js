const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = 'C:\\Users\\home\\OneDrive\\Desktop\\DOTBot-Prototype\\dotbot-auth\\Specifications_standard.pdf';

fs.readFile(pdfPath, (err, data) => {
  if (err) {
    console.error('Error reading PDF:', err);
    return;
  }
  pdf(data).then((result) => {
    const text = result.text;
    const sections = text.split(/\n(?=Section \d{3} —)/); // Split by section headers
    const chunks = sections.map((section, index) => {
      const match = section.match(/Section (\d{3}) — (.*)/);
      if (match) {
        return {
          section_id: match[1],
          title: match[2],
          text: section.trim(),
        };
      }
      return null; // Handle cases where no match is found
    }).filter(chunk => chunk !== null);

    fs.writeFileSync('spec_chunks.json', JSON.stringify(chunks, null, 2));
    console.log(`Extracted ${chunks.length} sections into spec_chunks.json`);
  }).catch((err) => {
    console.error('Error parsing PDF:', err);
  });
});