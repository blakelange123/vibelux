const puppeteer = require('puppeteer');
const path = require('path');

async function captureIESComparison() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Set viewport for consistent rendering
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 2 // Higher quality
    });

    console.log('Navigating to advanced designer...');
    // Navigate to the designer page
    await page.goto('http://localhost:3001/design/advanced', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for the designer to load
    await page.waitForSelector('#designer-app', { timeout: 10000 });
    
    // Wait a bit more for everything to render
    await page.waitForTimeout(3000);

    // Scroll to the IES comparison section in the right panel
    await page.evaluate(() => {
      const rightPanel = document.querySelector('.overflow-y-auto');
      if (rightPanel) {
        // Find the Light Distribution Analysis section
        const sections = rightPanel.querySelectorAll('h3');
        for (const section of sections) {
          if (section.textContent.includes('Light Distribution Analysis')) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            break;
          }
        }
      }
    });

    // Wait for the comparison component to render
    await page.waitForTimeout(2000);

    // Take a screenshot of the IES comparison component
    const comparisonElement = await page.$('.bg-gray-900.rounded-xl.p-6.border.border-gray-700');
    
    if (comparisonElement) {
      const outputPath = path.join(process.env.HOME, 'Downloads', 'VibeLux_IES_Comparison_Live.png');
      await comparisonElement.screenshot({
        path: outputPath,
        omitBackground: false
      });
      console.log(`Screenshot saved to: ${outputPath}`);
    } else {
      console.log('Could not find IES comparison component, taking full page screenshot...');
      const outputPath = path.join(process.env.HOME, 'Downloads', 'VibeLux_Designer_With_IES.png');
      await page.screenshot({
        path: outputPath,
        fullPage: true
      });
      console.log(`Full page screenshot saved to: ${outputPath}`);
    }

  } catch (error) {
    console.error('Error capturing screenshot:', error);
    
    // Fallback: Create a static comparison image
    console.log('Creating static comparison image as fallback...');
    require('./generate-light-comparison.js');
  } finally {
    await browser.close();
  }
}

// Run the capture
captureIESComparison().catch(console.error);