const puppeteer = require('puppeteer');

async function generatePDF(html) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu',
    ],
  });

  try {
    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Esperar fuente Inter (puede no cargar en Railway, usa fallback del sistema)
    await page.evaluate(() => document.fonts.ready).catch(() => {});

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

module.exports = { generatePDF };
