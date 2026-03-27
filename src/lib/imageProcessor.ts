import sharp from "sharp";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const OUTPUT_SIZE = 800; // square output in px
const PADDING_RATIO = 0.12; // 12 % padding on every side

// Gradient colors (center → edge)
const CENTER_R = 215,
  CENTER_G = 215,
  CENTER_B = 215;
const EDGE_R = 170,
  EDGE_G = 170,
  EDGE_B = 170;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Full pipeline: remove background → trim → center on gradient.
 * Falls back gracefully if bg-removal fails (uses original image).
 */
export async function processItemImage(inputBuffer: Buffer): Promise<Buffer> {
  // 0. Auto-rotate based on EXIF orientation (fixes iPhone sideways photos)
  inputBuffer = await sharp(inputBuffer).rotate().toBuffer();

  // 1. Attempt background removal
  let subjectBuffer: Buffer;
  try {
    subjectBuffer = await stripBackground(inputBuffer);
  } catch (err) {
    console.warn("[imageProcessor] bg-removal failed, using original:", err);
    subjectBuffer = inputBuffer;
  }

  // 2. Trim transparent / near-edge whitespace
  let trimmedBuffer: Buffer;
  try {
    trimmedBuffer = await sharp(subjectBuffer)
      .trim({ threshold: 10 })
      .toBuffer();
  } catch {
    // trim() throws if the entire image is one color – just use as-is
    trimmedBuffer = subjectBuffer;
  }

  // 3. Fit inside the padded area
  const meta = await sharp(trimmedBuffer).metadata();
  const subjectW = meta.width ?? OUTPUT_SIZE;
  const subjectH = meta.height ?? OUTPUT_SIZE;

  const pad = Math.round(OUTPUT_SIZE * PADDING_RATIO);
  const maxDim = OUTPUT_SIZE - pad * 2;
  const scale = Math.min(maxDim / subjectW, maxDim / subjectH, 1);
  const fitW = Math.round(subjectW * scale);
  const fitH = Math.round(subjectH * scale);

  const resized = await sharp(trimmedBuffer)
    .resize(fitW, fitH, { fit: "inside" })
    .png()
    .toBuffer();

  // 4. Create the gradient background
  const bgBuffer = await createGradientBackground(OUTPUT_SIZE, OUTPUT_SIZE);

  // 5. Composite subject centered on background
  const left = Math.round((OUTPUT_SIZE - fitW) / 2);
  const top = Math.round((OUTPUT_SIZE - fitH) / 2);

  return sharp(bgBuffer)
    .composite([{ input: resized, left, top }])
    .png({ compressionLevel: 6 })
    .toBuffer();
}

// ---------------------------------------------------------------------------
// Background removal (lazy-loaded to keep cold starts fast)
// ---------------------------------------------------------------------------

let removeBgFn: ((blob: Blob) => Promise<Blob>) | null = null;

async function loadRemoveBg() {
  if (removeBgFn) return removeBgFn;

  // Dynamic import – the ONNX models (~30 MB) are downloaded on first call
  const mod = await import("@imgly/background-removal-node");
  const bgRemove = mod.default ?? mod.removeBackground;

  removeBgFn = (blob: Blob) =>
    bgRemove(blob, {
      output: { format: "image/png" as const },
    }) as Promise<Blob>;

  return removeBgFn;
}

async function stripBackground(inputBuffer: Buffer): Promise<Buffer> {
  const fn = await loadRemoveBg();
  const uint8 = new Uint8Array(inputBuffer);
  const blob = new Blob([uint8], { type: "image/png" });
  const resultBlob = await fn(blob);
  return Buffer.from(await resultBlob.arrayBuffer());
}

// ---------------------------------------------------------------------------
// Gradient background generator
// ---------------------------------------------------------------------------

function createGradientBackground(w: number, h: number): Promise<Buffer> {
  const channels = 3;
  const data = Buffer.alloc(w * h * channels);
  const cx = w / 2;
  const cy = h / 2;
  const maxDist = Math.sqrt(cx * cx + cy * cy);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const t = Math.sqrt(dx * dx + dy * dy) / maxDist; // 0 at center, 1 at corner
      const i = (y * w + x) * channels;
      data[i] = Math.round(CENTER_R + (EDGE_R - CENTER_R) * t);
      data[i + 1] = Math.round(CENTER_G + (EDGE_G - CENTER_G) * t);
      data[i + 2] = Math.round(CENTER_B + (EDGE_B - CENTER_B) * t);
    }
  }

  return sharp(data, { raw: { width: w, height: h, channels } })
    .png()
    .toBuffer();
}
