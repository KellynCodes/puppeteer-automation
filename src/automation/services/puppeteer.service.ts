import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import { ImageFormat } from 'puppeteer';

@Injectable()
export class PuppeteerService {
  private readonly logger = new Logger(PuppeteerService.name);
  private readonly screenshotDir = path.join(
    process.cwd(),
    'logs',
    'screenshots',
  );

  constructor(private configService: ConfigService) {
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  async createBrowser() {
    const headless = this.configService.get<boolean>('puppeteer.headless');

    return await puppeteer.launch({
      headless: headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
      ],
      defaultViewport: {
        width: 1920,
        height: 1080,
      },
    });
  }

  async withRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    maxRetries?: number,
  ): Promise<T> {
    const retries =
      maxRetries || this.configService.get<number>('puppeteer.maxRetries') || 0;
    let lastError: Error = new Error('Unknown error');

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        this.logger.log(`Attempt ${attempt}/${retries} for ${operationName}`);
        return await operation();
      } catch (error) {
        lastError = error;
        this.logger.warn(
          `Attempt ${attempt}/${retries} failed for ${operationName}: ${error.message}`,
        );

        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000;
          this.logger.log(`Waiting ${delay}ms before retry...`);
          await this.sleep(delay);
        }
      }
    }

    throw lastError;
  }

  async waitForSelectorWithRetry(
    page: puppeteer.Page,
    selector: string,
    options?: puppeteer.WaitForSelectorOptions,
  ): Promise<puppeteer.ElementHandle> {
    const timeout = this.configService.get<number>('puppeteer.timeout');

    return await this.withRetry(async () => {
      const element = await page.waitForSelector(selector, {
        timeout,
        ...options,
      });
      if (!element) {
        throw new Error(`Element not found: ${selector}`);
      }
      return element;
    }, `waitForSelector: ${selector}`);
  }

  async typeWithDelay(
    page: puppeteer.Page,
    selector: string,
    text: string,
    delayMs: number = 100,
  ): Promise<void> {
    await this.withRetry(async () => {
      await page.waitForSelector(selector);
      await page.type(selector, text, { delay: delayMs });
    }, `typeWithDelay: ${selector}`);
  }

  async clickWithRetry(page: puppeteer.Page, selector: string): Promise<void> {
    await this.withRetry(async () => {
      await page.waitForSelector(selector);
      await page.click(selector);
    }, `click: ${selector}`);
  }

  async takeScreenshot(
    page: puppeteer.Page,
    name: string,
    format: ImageFormat = 'png',
  ): Promise<string> {
    const timestamp = Date.now();
    const filename = `${name}_${timestamp}`;
    const filepath = `${this.screenshotDir}/${filename}.png`;
    console.log(filepath);

    await page.screenshot({
      fullPage: true,
      path: `${this.screenshotDir}/${filename}.png`,
      type: format,
    });

    return filepath;
  }

  async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getLastFourDigits(cardNumber: string): string {
    return cardNumber.slice(-4);
  }
}
