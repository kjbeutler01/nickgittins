import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve('dist');
function walk(dir) { return fs.readdirSync(dir,{withFileTypes:true}).flatMap(f=>f.isDirectory()?walk(path.join(dir,f.name)):[path.join(dir,f.name)]); }
const htmlFiles=walk(root).filter(f=>f.endsWith('.html'));
let references=0;
for(const file of htmlFiles) {
 const html=fs.readFileSync(file,'utf8');
 assert.match(html,/<html lang="en">/);
 assert.match(html,/<title>[^<]+<\/title>/);
 assert.match(html,/<meta name="description" content="[^"]+">/);
 assert.equal((html.match(/<h1[ >]/g)||[]).length,1,`One h1 required: ${file}`);
 for(const [,ref] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
  if(/^(https?:|mailto:|tel:|data:)/.test(ref)) continue;
  const [url,fragment]=ref.split('#');
  let target=url?path.resolve(root,'.'+url):file;
  if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
  assert.ok(fs.existsSync(target),`Missing reference ${ref} in ${file}`);
  if(fragment) assert.ok(fs.readFileSync(target,'utf8').includes(`id="${fragment}"`),`Missing anchor ${ref}`);
  references++;
 }
}
const original=fs.readFileSync('BigCV_nick.docx');
assert.ok(original.equals(fs.readFileSync(path.join(root,'assets/nicholas-gittins-cv.docx'))),'CV download must match the original');
assert.ok(fs.readFileSync('src/assets/nicholas-gittins-original.png').equals(fs.readFileSync(path.join(root,'assets/nicholas-gittins-original.png'))),'Portrait must remain the supplied photograph');
assert.ok(fs.readFileSync(path.join(root,'assets/nicholas-gittins-cv.pdf')).subarray(0,5).toString()==='%PDF-','PDF download must be a PDF');
console.log(`PASS: ${htmlFiles.length} pages; ${references} local links, anchors, and assets; original CV integrity; PDF signature.`);
