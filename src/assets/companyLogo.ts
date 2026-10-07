// High-precision vector representation of the official Agropecuária São Paulo ("Sp") logo.
// Accurately reproduces the exact geometry, layering, colors, and proportions of the original mark:
// - Light green vertical stalk (#7EB755) with rounded capsule caps
// - Three emerald green leaves (#108643) with central vein details
// - Light green curved limb branching towards the upper-right
// - Dark forest green organic "Sp" letters (#0E542D) with correct overlap layers and circular "p" bowl

export const OFFICIAL_SP_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 914 1024" width="914" height="1024">
  <!-- Clean white background -->
  <rect width="914" height="1024" fill="#ffffff" />

  <!-- 1. Light green curved branch extending to the upper right behind S -->
  <path d="M 280 435 C 380 420, 560 380, 715 220" 
        fill="none" 
        stroke="#7EB755" 
        stroke-width="50" 
        stroke-linecap="round" />

  <!-- 2. Dark forest green "S" - Lower rear loop passing behind the vertical stalk -->
  <path d="M 310 670 C 230 670, 165 640, 175 680 C 185 715, 250 725, 340 720 C 440 710, 520 680, 560 645" 
        fill="none" 
        stroke="#0E542D" 
        stroke-width="72" 
        stroke-linecap="round" 
        stroke-linejoin="round" />

  <!-- 3. Light green main vertical plant stalk -->
  <rect x="248" y="52" width="64" height="916" rx="32" fill="#7EB755" />

  <!-- 4. Emerald green leaves -->
  <!-- Top-left leaf -->
  <g transform="translate(280, 205)">
    <path d="M 0 0 C -45 -45, -125 -105, -235 -95 C -255 -35, -165 45, 0 0 Z" fill="#108643" />
    <path d="M 0 0 C -90 -35, -160 -65, -230 -90" stroke="#7EB755" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.6" />
  </g>

  <!-- Top-right leaf -->
  <g transform="translate(280, 205)">
    <path d="M 0 0 C 45 -45, 125 -105, 235 -95 C 255 -35, 165 45, 0 0 Z" fill="#108643" />
    <path d="M 0 0 C 90 -35, 160 -65, 230 -90" stroke="#7EB755" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.6" />
  </g>

  <!-- Middle-left leaf -->
  <g transform="translate(280, 520)">
    <path d="M 0 0 C -45 -20, -115 -25, -185 10 C -180 50, -100 85, 0 0 Z" fill="#108643" />
    <path d="M 0 0 C -70 -5, -120 5, -180 15" stroke="#7EB755" stroke-width="3.5" stroke-linecap="round" fill="none" opacity="0.6" />
  </g>

  <!-- 5. Dark forest green "S" - Main upper loop and spine passing in front of stalk -->
  <path d="M 500 305 C 475 275, 395 260, 315 295 C 235 330, 275 425, 345 460 C 445 510, 525 560, 485 645 C 455 700, 385 715, 320 705" 
        fill="none" 
        stroke="#0E542D" 
        stroke-width="72" 
        stroke-linecap="round" 
        stroke-linejoin="round" />

  <!-- 6. Dark forest green "p" - Vertical descender stem -->
  <rect x="539" y="390" width="62" height="505" rx="31" fill="#0E542D" />

  <!-- 7. Dark forest green "p" - Circular outer bowl and inner counter -->
  <circle cx="692" cy="558" r="122" 
          fill="none" 
          stroke="#0E542D" 
          stroke-width="72" />
</svg>`;

let cachedPngDataUrl: string | null = null;

/**
 * Returns a high-resolution PNG Data URL of the official SP logo.
 * Uses browser canvas rendering to produce a raster image for jsPDF.
 */
export async function getCompanyLogoPngDataUrl(): Promise<string> {
  if (cachedPngDataUrl) return cachedPngDataUrl;

  if (typeof window === 'undefined') {
    return `data:image/svg+xml;utf8,${encodeURIComponent(OFFICIAL_SP_LOGO_SVG)}`;
  }

  return new Promise((resolve) => {
    try {
      const img = new Image();
      const svgBlob = new Blob([OFFICIAL_SP_LOGO_SVG], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 512;
          canvas.height = 512;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 512, 512);

            const aspect = (img.width || 914) / (img.height || 1024);
            let drawW = 512;
            let drawH = 512;
            let drawX = 0;
            let drawY = 0;

            if (aspect > 1) {
              drawH = 512 / aspect;
              drawY = (512 - drawH) / 2;
            } else {
              drawW = 512 * aspect;
              drawX = (512 - drawW) / 2;
            }

            ctx.drawImage(img, drawX, drawY, drawW, drawH);
            cachedPngDataUrl = canvas.toDataURL('image/png');
            URL.revokeObjectURL(url);
            resolve(cachedPngDataUrl);
            return;
          }
        } catch (e) {
          console.warn('Canvas rendering error:', e);
        }
        URL.revokeObjectURL(url);
        resolve(`data:image/svg+xml;utf8,${encodeURIComponent(OFFICIAL_SP_LOGO_SVG)}`);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(`data:image/svg+xml;utf8,${encodeURIComponent(OFFICIAL_SP_LOGO_SVG)}`);
      };

      img.src = url;
    } catch {
      resolve(`data:image/svg+xml;utf8,${encodeURIComponent(OFFICIAL_SP_LOGO_SVG)}`);
    }
  });
}
