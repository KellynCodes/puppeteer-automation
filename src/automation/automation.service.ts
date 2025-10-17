import { InjectModel } from '@nestjs/mongoose';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/user.service';
import { AddCardDto } from './dto/automation.dto';
import { CardLog } from './schemas/card-log.schema';
import { EncryptionService } from './services/encryption.service';
import { PuppeteerService } from './services/puppeteer.service';
import { Browser } from 'puppeteer';

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);

  constructor(
    @InjectModel(CardLog.name) private cardLogModel: Model<CardLog>,
    private usersService: UsersService,
    private puppeteerService: PuppeteerService,
    private encryptionService: EncryptionService,
    private configService: ConfigService,
  ) {}

  async addCard(addCardDto: AddCardDto): Promise<CardLog> {
    const startTime = Date.now();
    let browser: Browser | null = null;
    let screenshotPath: string | undefined = undefined;

    const log = new this.cardLogModel({
      userId: addCardDto.userId,
      action: 'add_card',
      status: 'pending',
      cardLast4Digits: this.puppeteerService.getLastFourDigits(
        addCardDto.cardNumber,
      ),
      cardHolder: addCardDto.cardHolder,
    });
    await log.save();

    try {
      const user = await this.usersService.findOne(addCardDto.userId);
      console.log(user);
      if (!user) {
        this.logger.log('User not found');
        return new CardLog();
      }

      this.logger.log(`Starting card automation for user: ${user.email}`);

      browser = await this.puppeteerService.createBrowser();
      const page = await browser.newPage();

      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      );

      const paramountUrl =
        this.configService.get<string>('paramount.url') ?? '';

      this.logger.log('Navigating to Paramount+...');
      await page.goto(paramountUrl + '/account/signin', {
        waitUntil: 'networkidle2',
      });
      await this.puppeteerService.sleep(2000);

      console.log(await page.content());
      await this.puppeteerService.takeScreenshot(page, 'paramount');

      this.logger.log('Clicking Sign In...');
      await this.puppeteerService.clickWithRetry(
        page,
        'a[href*="account"], button:has-text("Sign In"), [data-testid="sign-in"]',
      );
      await this.puppeteerService.sleep(2000);

      this.logger.log('Waiting for login form...');
      await this.puppeteerService.waitForSelectorWithRetry(
        page,
        'input[type="email"], input[name="email"]',
      );

      this.logger.log('Entering email...');
      await this.puppeteerService.typeWithDelay(
        page,
        'input[type="email"], input[name="email"]',
        user.email,
      );
      await this.puppeteerService.sleep(1000);

      this.logger.log('Entering password...');
      await this.puppeteerService.typeWithDelay(
        page,
        'input[type="password"], input[name="password"]',
        user.password,
      );
      await this.puppeteerService.sleep(1000);

      this.logger.log('Clicking login button...');
      await this.puppeteerService.clickWithRetry(
        page,
        'button[type="submit"], button:has-text("Sign In"), button:has-text("Log In"), button:has-text("Submit"), [data-testid="submit-button"], [data-testid="sign-in-button"], [data-testid="login-button"], [data-testid="submit"], [data-testid="sign-in"]',
      );

      await page.waitForNavigation({
        waitUntil: 'networkidle2',
        timeout: 30000,
      });
      await this.puppeteerService.sleep(3000);

      this.logger.log('Login successful');

      this.logger.log('Navigating to account settings...');
      await this.puppeteerService.clickWithRetry(
        page,
        'a[href*="account"], button:has-text("Account"), [aria-label="Account"]',
      );
      await this.puppeteerService.sleep(2000);

      this.logger.log('Opening payment settings...');
      await this.puppeteerService.clickWithRetry(
        page,
        'a[href*="billing"], a[href*="payment"], button:has-text("Billing")',
      );
      await this.puppeteerService.sleep(3000);

      this.logger.log('Opening card form...');
      await this.puppeteerService.clickWithRetry(
        page,
        'button:has-text("Add Card"), button:has-text("Update"), button:has-text("Add Payment")',
      );
      await this.puppeteerService.sleep(2000);

      await this.puppeteerService.waitForSelectorWithRetry(
        page,
        'input[name*="card"], input[placeholder*="Card number"], iframe[name*="card"]',
      );

      const cardFrames = page
        .frames()
        .filter(
          (frame) =>
            frame.url().includes('stripe') ||
            frame.url().includes('payment') ||
            frame.name().includes('card'),
        );

      let cardFrame = cardFrames.length > 0 ? cardFrames[0] : page;

      this.logger.log('Entering card number...');
      await this.puppeteerService.typeWithDelay(
        cardFrame as any,
        'input[name*="cardnumber"], input[placeholder*="Card number"], input[name="number"]',
        addCardDto.cardNumber,
        150,
      );
      await this.puppeteerService.sleep(1000);

      this.logger.log('Entering cardholder name...');
      await this.puppeteerService.typeWithDelay(
        page,
        'input[name*="name"], input[placeholder*="Name on card"]',
        addCardDto.cardHolder,
      );
      await this.puppeteerService.sleep(1000);

      this.logger.log('Entering expiry date...');
      await this.puppeteerService.typeWithDelay(
        cardFrame as any,
        'input[name*="exp"], input[placeholder*="MM"], input[name="month"]',
        addCardDto.expiryMonth,
      );

      await this.puppeteerService.typeWithDelay(
        cardFrame as any,
        'input[name*="exp"], input[placeholder*="YY"], input[name="year"]',
        addCardDto.expiryYear.slice(-2),
      );
      await this.puppeteerService.sleep(1000);

      this.logger.log('Entering CVV...');
      await this.puppeteerService.typeWithDelay(
        cardFrame as any,
        'input[name*="cvc"], input[name*="cvv"], input[placeholder*="CVV"]',
        addCardDto.cvv,
      );
      await this.puppeteerService.sleep(1000);

      this.logger.log('Entering ZIP code...');
      await this.puppeteerService.typeWithDelay(
        page,
        'input[name*="zip"], input[name*="postal"], input[placeholder*="ZIP"]',
        addCardDto.zipCode,
      );
      await this.puppeteerService.sleep(1000);

      screenshotPath = await this.puppeteerService.takeScreenshot(
        page,
        'card_form_filled',
      );

      this.logger.log('Submitting card...');
      await this.puppeteerService.clickWithRetry(
        page,
        'button[type="submit"], button:has-text("Save"), button:has-text("Add Card")',
      );

      await this.puppeteerService.sleep(5000);

      await this.puppeteerService.takeScreenshot(
        page,
        'card_submission_result',
      );

      const encryptedCardData = this.encryptionService.encryptCardData({
        cardNumber: addCardDto.cardNumber,
        cvv: addCardDto.cvv,
        expiryMonth: addCardDto.expiryMonth,
        expiryYear: addCardDto.expiryYear,
      });

      const duration = Date.now() - startTime;

      log.status = 'success';
      log.encryptedCardData = encryptedCardData;
      log.screenshotPath = screenshotPath;
      log.duration = duration;
      await log.save();

      this.logger.log(
        `Card automation completed successfully in ${duration}ms`,
      );

      return log;
    } catch (error) {
      this.logger.error(
        `Card automation failed: ${error.message}`,
        error.stack,
      );

      if (browser) {
        const pages = await browser.pages();
        if (pages.length > 0) {
          screenshotPath = await this.puppeteerService.takeScreenshot(
            pages[0],
            'error_screenshot',
          );
        }
      }

      const duration = Date.now() - startTime;

      log.status = 'failed';
      log.errorMessage = error.message;
      log.errorDetails = {
        stack: error.stack,
        timestamp: new Date().toISOString(),
      };
      log.screenshotPath = screenshotPath;
      log.duration = duration;
      await log.save();

      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  async getAutomationLogs(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: CardLog[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.cardLogModel
        .find({ userId })
        .select('-encryptedCardData')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.cardLogModel.countDocuments({ userId }),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
