import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AutomationService } from './automation.service';
import { AddCardDto, CardLogResponseDto } from './dto/automation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Automation')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('automation')
export class AutomationController {
  constructor(private readonly automationService: AutomationService) {}

  @Post('add-card')
  @ApiOperation({
    summary: 'Add or update card for a user on Paramount+',
    description:
      'Automates the process of logging into Paramount+ and adding/updating card information',
  })
  @ApiResponse({
    status: 201,
    description: 'Card automation initiated successfully',
    type: CardLogResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Automation failed' })
  async addCard(@Body() addCardDto: AddCardDto) {
    return this.automationService.addCard(addCardDto);
  }

  @Get('logs/:userId')
  @ApiOperation({
    summary: 'Get automation logs for a user',
    description:
      'Retrieve all automation logs (card additions, updates, login attempts) for a specific user',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Logs retrieved successfully',
  })
  async getAutomationLogs(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.automationService.getAutomationLogs(userId, page, limit);
  }
}
