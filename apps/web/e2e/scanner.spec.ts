import { test, expect } from '@playwright/test';

// Common mock for valid OpenFoodFacts API response
// Common mock for valid OpenFoodFacts API response
const mockOFFResponse = {
  code: '737628064502',
  product: {
    product_name: 'Test Product',
    brands: 'Test Brand',
    nutriments: {
      'energy-kcal_100g': 100, 'energy-kcal_unit': 'kcal',
      proteins_100g: 5, proteins_unit: 'g',
      fat_100g: 2, fat_unit: 'g',
      'saturated-fat_100g': 0.5, 'saturated-fat_unit': 'g',
      carbohydrates_100g: 15, carbohydrates_unit: 'g',
      sugars_100g: 3, sugars_unit: 'g',
      salt_100g: 0.1, salt_unit: 'g',
    }
  },
  status: 1
};

test.beforeEach(async ({ context, page }) => {
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  page.on('console', msg => { if (msg.type() === 'error') console.log('BROWSER CONSOLE:', msg.text()) });
  // Mock OpenFoodFacts API
  await context.route('https://world.openfoodfacts.org/api/v3/product/**', async (route) => {
    const url = route.request().url();
    if (url.includes('737628064502')) {
      await route.fulfill({ json: mockOFFResponse });
    } else {
      await route.fulfill({ json: { status: 0, status_verbose: 'product not found' } });
    }
  });
});

test('1. Home page renders correctly', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'FoodGrade' })).toBeVisible();
  await expect(page.getByText("Know what's inside your food.")).toBeVisible();
  await expect(page.getByRole('button', { name: 'Scan Food' })).toBeVisible();
  await expect(page.getByText('Recent Scans')).toBeVisible();
});

test('2. Manual barcode flow - Invalid format', async ({ page }) => {
  await page.goto('/scan');
  await page.getByRole('button', { name: 'Enter Barcode Manually' }).click();
  // Invalid checksum (should end in 2)
  await page.getByPlaceholder('e.g. 8901234567890').fill('737628064503');
  await page.getByRole('button', { name: 'Analyze' }).click();
  await expect(page.getByText('Invalid barcode format or checksum')).toBeVisible();
});

test('3. Manual barcode flow - Valid format but not found', async ({ page }) => {
  await page.goto('/scan');
  await page.getByRole('button', { name: 'Enter Barcode Manually' }).click();
  // Valid checksum but not in mocked database (we'll use 8901234567890 here which has valid check digit 0)
  await page.getByPlaceholder('e.g. 8901234567890').fill('8901234567890');
  await page.getByRole('button', { name: 'Analyze' }).click();
  await expect(page.getByText('Product not found in database')).toBeVisible();
});

test('4. Manual barcode flow - Valid format and found', async ({ page }) => {
  await page.goto('/scan');
  await page.getByRole('button', { name: 'Enter Barcode Manually' }).click();
  // Valid checksum and in mocked db
  await page.getByPlaceholder('e.g. 8901234567890').fill('737628064502');
  await page.getByRole('button', { name: 'Analyze' }).click();
  
  // Should navigate to Result
  await expect(page).toHaveURL(/.*result/);
  await expect(page.getByText('Test Product')).toBeVisible();
  await expect(page.getByText('Test Brand')).toBeVisible();
});

test('5. Result page has no mocks and shows context data', async ({ page }) => {
  await page.goto('/scan');
  await page.getByRole('button', { name: 'Enter Barcode Manually' }).click();
  await page.getByPlaceholder('e.g. 8901234567890').fill('737628064502');
  await page.getByRole('button', { name: 'Analyze' }).click();
  
  await expect(page).toHaveURL(/.*result/);
  await expect(page.getByText('MOCK PRODUCT')).not.toBeVisible();
});

test('6. Navigation to History', async ({ page }) => {
  await page.goto('/history');
  await expect(page.getByRole('heading', { name: 'Scan History' })).toBeVisible();
});

test('7. Saving and removing Favorites', async ({ page }) => {
  // Generate a result
  await page.goto('/scan');
  await page.getByRole('button', { name: 'Enter Barcode Manually' }).click();
  await page.getByPlaceholder('e.g. 8901234567890').fill('737628064502');
  await page.getByRole('button', { name: 'Analyze' }).click();
  await expect(page).toHaveURL(/.*result/);

  // Click Save
  const starButton = page.locator('button', { has: page.locator('svg.lucide-star') }).first();
  await starButton.click();

  // Go to Favorites
  await page.goto('/saved');
  await expect(page.getByRole('button', { name: /View favorite for Test Product/ })).toBeVisible();
});

test('8. About page has disclaimer', async ({ page }) => {
  await page.goto('/about');
  await expect(page.getByText('application-specific assessment')).toBeVisible();
  await expect(page.getByText('not an official FSSAI grading system')).toBeVisible();
});

test('9. Missing Result Context handles gracefully', async ({ page }) => {
  // Go directly to result without context
  await page.goto('/result');
  await expect(page.getByText('No product analysis found.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Go to Scanner' })).toBeVisible();
});

test('10. Label OCR Navigation flow', async ({ page }) => {
  await page.goto('/scan');
  // Click Label OCR mode
  await page.getByRole('button', { name: 'Label OCR' }).click();
  await expect(page.getByText('Position the ingredients or nutrition label clearly in frame')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Capture Photo' })).toBeVisible();
});

test('11. Full WEB -> API -> VISION E2E Flow', async ({ page }) => {
  // Mock the new API backend
  await page.route('**/api/v1/vision/ocr', async (route) => {
    // Check if payload has correct shape
    const req = route.request();
    const postData = req.postDataJSON();
    expect(postData).toHaveProperty('image');
    expect(postData.image).toHaveProperty('mimeType');
    expect(postData.image).toHaveProperty('data');
    
    // fulfill with mock Gemini OCR text
    await route.fulfill({
      json: {
        rawText: "Ingredients: Sugar, Water. \nNutrition Facts: Energy 100kcal.",
        provider: "gemini_cloud_vision",
        confidenceAvailable: false,
        metadata: { model: "gemini-3.7-flash", proxyResponse: true }
      }
    });
  });

  await page.goto('/scan');
  await page.getByRole('button', { name: 'Label OCR' }).click();
  // set file
  await page.locator('input[type="file"]').setInputFiles('e2e/dummy.png');
  // click use photo
  await page.getByRole('button', { name: 'Use Photo' }).click();

  // wait for result
  await expect(page).toHaveURL(/.*result/);
  await expect(page.getByText('Sugar').first()).toBeVisible();
});

