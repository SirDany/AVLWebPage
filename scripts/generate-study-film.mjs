import { createServer } from 'node:http'
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const image = fileURLToPath(new URL('../public/studies/vesper.webp', import.meta.url))
const output = fileURLToPath(new URL('../public/studies/vesper-film.webm', import.meta.url))
const mp4 = fileURLToPath(new URL('../public/studies/vesper-film.mp4', import.meta.url))
const ffmpeg = process.env.FFMPEG_PATH || 'ffmpeg'
const available = spawnSync(ffmpeg, ['-version'], { encoding: 'utf8' })
if (available.status !== 0)
  throw new Error(
    'FFmpeg is required to generate the compatible MP4. Install it or set FFMPEG_PATH to its executable.',
  )
const html = `<!doctype html><html lang="en"><title>Generate AVL original study film</title>
<button id="record">Generate original four-second study film</button><p id="status">Ready</p>
<canvas width="640" height="704"></canvas><script>
document.querySelector('button').onclick = async () => {
  const canvas = document.querySelector('canvas'), ctx = canvas.getContext('2d');
  const image = new Image(); image.src = '/image'; await image.decode();
  const stream = canvas.captureStream(24);
  const recorder = new MediaRecorder(stream, {mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:500000});
  const chunks=[]; recorder.ondataavailable=e=>chunks.push(e.data);
  recorder.onstop=async()=>{
    const response=await fetch('/film',{method:'POST',headers:{'Content-Type':'video/webm'},body:new Blob(chunks,{type:'video/webm'})});
    document.querySelector('#status').textContent=response.ok?'Saved':'Failed';
    stream.getTracks().forEach(track=>track.stop());
  };
  recorder.start();
  const start=performance.now();
  function draw(now){
    const t=Math.min(1,(now-start)/4000);
    const gradient=ctx.createRadialGradient(320,250,20,320,350,500);
    gradient.addColorStop(0,'#b2a5bd');gradient.addColorStop(1,'#1c0b23');
    ctx.fillStyle=gradient;ctx.fillRect(0,0,640,704);
    ctx.save();ctx.translate(320,340);ctx.rotate(Math.sin(t*Math.PI*2)*0.025);
    const scale=1+Math.sin(t*Math.PI)*0.04;ctx.scale(scale,scale);
    ctx.drawImage(image,-300,-330,600,660);ctx.restore();
    ctx.fillStyle='#f8f8ff';ctx.font='12px sans-serif';ctx.fillText('VESPER / original digital surface study',28,674);
    if(t<1)requestAnimationFrame(draw);else recorder.stop();
  } requestAnimationFrame(draw);
};
</script></html>`

const timeout = setTimeout(() => {
  console.error('Film generator timed out.')
  server.close()
  process.exitCode = 1
}, 120000)
const server = createServer(async (request, response) => {
  try {
    if (request.method === 'GET' && request.url === '/') {
      response.writeHead(200, { 'Content-Type': 'text/html' }).end(html)
    } else if (request.method === 'GET' && request.url === '/image') {
      response.writeHead(200, { 'Content-Type': 'image/webp' }).end(await readFile(image))
    } else if (
      request.method === 'POST' &&
      request.url === '/film' &&
      request.headers['content-type'] === 'video/webm'
    ) {
      const chunks = []
      let size = 0
      for await (const chunk of request) {
        size += chunk.length
        if (size > 2_000_000) throw new Error('Generated film exceeds 2 MB.')
        chunks.push(chunk)
      }
      const film = Buffer.concat(chunks)
      if (film.readUInt32BE(0) !== 0x1a45dfa3) throw new Error('Expected a WebM container.')
      await writeFile(output, film)
      const encoded = spawnSync(
        ffmpeg,
        [
          '-hide_banner',
          '-y',
          '-i',
          output,
          '-an',
          '-c:v',
          'libx264',
          '-pix_fmt',
          'yuv420p',
          '-movflags',
          '+faststart',
          '-r',
          '24',
          mp4,
        ],
        { encoding: 'utf8', timeout: 30000 },
      )
      if (encoded.status !== 0)
        throw new Error(`MP4 encoding failed: ${encoded.stderr || encoded.error}`)
      response.writeHead(201).end('Saved')
      console.log(`Created original digital film: ${film.length} bytes`)
      clearTimeout(timeout)
      server.close()
    } else response.writeHead(404).end()
  } catch (error) {
    console.error(error)
    response.writeHead(500).end('Generation failed')
  }
})
server.listen(4319, '127.0.0.1', () =>
  console.log('Open http://127.0.0.1:4319 and generate the film.'),
)
