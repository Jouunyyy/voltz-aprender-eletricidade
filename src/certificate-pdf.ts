type Box = { x: number; y: number; width: number; height: number };
type Icon = Box & { symbol: string; size: number; color: string };

/** Draw symbols without font baselines (emoji/grid rendering varies on Safari). */
function drawIcon(context: CanvasRenderingContext2D, icon: Icon) {
  context.save();
  context.translate(icon.x + (icon.width - icon.size) / 2, icon.y + (icon.height - icon.size) / 2);
  context.scale(icon.size / 24, icon.size / 24);
  context.strokeStyle = icon.color;
  context.fillStyle = icon.color;
  context.lineWidth = 2;
  context.lineCap = 'round';
  context.lineJoin = 'round';
  const paths: Record<string, string> = {
    '✓': 'M5 12 L10 17 L19 7',
    '↗': 'M6 18 L18 6 M6 6 H18 V18',
    '⚡': 'M14 2 L4 14 H11 L10 22 L20 10 H13 Z',
    '▣': 'M4 4 H20 V20 H4 Z',
  };
  const path = new Path2D(paths[icon.symbol] || paths['▣']);
  if (icon.symbol === '⚡') context.fill(path);
  else context.stroke(path);
  if (icon.symbol === '▣') context.fillRect(8, 8, 8, 8);
  context.restore();
}

/** Export the certificate without changing the visible iframe. */
export async function downloadCertificatePdf(frame: HTMLIFrameElement, code: string) {
  const doc = frame.contentDocument;
  const certificate = doc?.getElementById('cert');
  if (!doc || !certificate) throw new Error('Certificado indisponível');
  await doc.fonts.ready;
  await Promise.all(Array.from(certificate.querySelectorAll('img')).map(async image => {
    if (image.getAttribute('src')) await image.decode();
  }));
  const qr = certificate.querySelector<HTMLImageElement>('#qr');
  if (!qr?.naturalWidth) throw new Error('QR de validação indisponível');
  const icons: Icon[] = [];
  let qrBox: Box | undefined;
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
  const canvas = await html2canvas(certificate, {
    scale: 2, width: 1400, height: 875, windowWidth: 1400, windowHeight: 875,
    scrollX: 0, scrollY: 0, backgroundColor: '#ffffff', logging: false,
    onclone(clone) {
      const card = clone.getElementById('cert')!;
      Object.assign(card.style, { transform: 'none', position: 'absolute', left: '0', top: '0', boxShadow: 'none' });
      Object.assign(clone.body.style, { margin: '0', padding: '0', width: '1400px', height: '875px' });
      Object.assign(clone.getElementById('stage')!.style, { width: '1400px', height: '875px', margin: '0', position: 'relative' });
      const origin = card.getBoundingClientRect();
      const box = (element: Element): Box => {
        const rect = element.getBoundingClientRect();
        return { x: rect.left - origin.left, y: rect.top - origin.top, width: rect.width, height: rect.height };
      };
      card.querySelectorAll<HTMLElement>('.ico, .brand-logo b').forEach(element => {
        icons.push({ ...box(element), symbol: element.textContent!.trim(),
          size: element.matches('.ico') ? 22 : 29,
          color: element.textContent!.trim() === '⚡' ? '#ffd21c' : '#1268f4' });
        // Keep the existing coloured container; paint the symbol explicitly later.
        element.textContent = '';
      });
      const image = card.querySelector<HTMLElement>('#qr')!;
      qrBox = box(image);
      image.style.visibility = 'hidden';
    },
  });
  const context = canvas.getContext('2d');
  if (!context || !qrBox) throw new Error('Não foi possível renderizar o certificado');
  context.save();
  // html2canvas leaves its 2× transform active on the returned context.
  context.setTransform(2, 0, 0, 2, 0, 0);
  icons.forEach(icon => drawIcon(context, icon));
  // Explicit square geometry avoids object-fit/border-radius clipping in html2canvas.
  const { x, y: qrY, width: qrWidth, height: qrHeight } = qrBox;
  context.fillStyle = '#ffffff';
  context.fillRect(x, qrY, qrWidth, qrHeight);
  const inset = 8;
  const side = Math.min(qrWidth, qrHeight) - inset * 2;
  context.imageSmoothingEnabled = false;
  context.drawImage(qr, x + (qrWidth - side) / 2, qrY + (qrHeight - side) / 2, side, side);
  context.restore();

  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
  const width = 297, height = width * 875 / 1400, y = (210 - height) / 2;
  pdf.addImage(canvas, 'PNG', 0, y, width, height, undefined, 'FAST');
  const url = certificate.querySelector('#url')?.textContent?.trim();
  if (url) pdf.link(x * width / 1400, y + qrY * width / 1400, qrWidth * width / 1400, qrHeight * width / 1400, { url: `https://${url}` });
  pdf.setProperties({ title: `Certificado Voltz — ${code}`, author: 'Voltz' });
  pdf.save(`${code.replace(/[^a-zA-Z0-9_-]/g, '-')}.pdf`);
  canvas.width = 0;
  canvas.height = 0;
}
