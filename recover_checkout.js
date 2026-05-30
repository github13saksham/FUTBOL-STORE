const fs = require('fs');
const logPath = 'C:/Users/SAKSHAM/.gemini/antigravity-ide/brain/23782603-cb6e-476d-a927-b39323b704fd/.system_generated/logs/transcript.jsonl';
const lines = fs.readFileSync(logPath, 'utf8').split('\n').filter(Boolean);

let files = {};

for(let i=0; i<lines.length; i++) {
  const line = JSON.parse(lines[i]);
  if (line.step_index > 436) break;

  if (line.type === 'PLANNER_RESPONSE' && line.tool_calls) {
    line.tool_calls.forEach(tc => {
      let file = tc.args.TargetFile || tc.args.AbsolutePath || '';
      file = file.replace(/^"|"$/g, '');
      
      if (tc.name === 'write_to_file') {
        files[file] = tc.args.CodeContent;
      } else if (tc.name === 'replace_file_content') {
        if (files[file]) {
          files[file] = files[file].replace(tc.args.TargetContent, tc.args.ReplacementContent);
        }
      } else if (tc.name === 'multi_replace_file_content') {
        if (files[file]) {
          let chunks = tc.args.ReplacementChunks;
          if (typeof chunks === 'string') {
             try { chunks = eval('(' + chunks + ')'); } catch(e2) { chunks = []; }
          }
          chunks.forEach(chunk => {
             files[file] = files[file].replace(chunk.TargetContent, chunk.ReplacementContent);
          });
        }
      }
    });
  }
}

for (const [f, c] of Object.entries(files)) {
  if (f.includes('checkout') && f.includes('page.tsx')) {
     fs.writeFileSync('src/app/checkout/page.tsx', c);
     console.log('Restored checkout page from transcript!');
  }
}
