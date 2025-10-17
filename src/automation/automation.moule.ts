import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from 'src/users/user.module';
import { AutomationController } from './automation.controller';
import { AutomationService } from './automation.service';
import { CardLog, CardLogSchema } from './schemas/card-log.schema';
import { EncryptionService } from './services/encryption.service';
import { PuppeteerService } from './services/puppeteer.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CardLog.name, schema: CardLogSchema }]),
    UsersModule,
  ],
  controllers: [AutomationController],
  providers: [AutomationService, PuppeteerService, EncryptionService],
  exports: [AutomationService],
})
export class AutomationModule {}
