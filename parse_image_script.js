const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const regexToFind = /const data = JSON\.parse\(response\.text \|\| '\{\}'\);/g;

const replacement = `const data = JSON.parse(response.text || '{}');
    
    // Check for [GENERATE_IMAGE: ...] in the botResponse
    let imageUrl = undefined;
    if (data.botResponse) {
      const imgMatch = data.botResponse.match(/\\[GENERATE_IMAGE:(.*?)\\]/);
      if (imgMatch) {
        const prompt = imgMatch[1].trim();
        imageUrl = "https://image.pollinations.ai/prompt/" + encodeURIComponent(prompt) + "?width=512&height=512&nologo=true";
        data.botResponse = data.botResponse.replace(/\\[GENERATE_IMAGE:(.*?)\\]/, '').trim();
      }
    }
    data.imageUrl = imageUrl;`;

code = code.replace(regexToFind, replacement);
fs.writeFileSync('server.ts', code);
