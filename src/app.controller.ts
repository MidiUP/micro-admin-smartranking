// import { CreateCategoryDto } from './dtos/create-category.dto';
import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { AppService } from './app.service';
import { Category } from './interfaces/categories/category.interface';

const ackErrors: string[] = [
  'E11000',
  'category is already registered',
  'Cast to ObjectId failed for value',
];

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  private readonly logger = new Logger(AppController.name);

  @EventPattern('create-category')
  async createCategory(
    @Payload() category: Category,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    this.logger.log(JSON.stringify(category));
    try {
      await this.appService.createCategory(category);
      await channel.ack(originalMessage);
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      ackErrors.map(async (ackError) => {
        if (error.message.includes(ackError)) {
          await channel.ack(originalMessage);
        }
      });
    }
  }

  @MessagePattern('get-categories')
  async getCategories(@Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      return await this.appService.getCategories();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
    } finally {
      await channel.ack(originalMessage);
    }
  }

  @MessagePattern('get-category-by-id')
  async getCategoryById(@Ctx() context: RmqContext, @Payload() id: string) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      return await this.appService.getCategoriesByCategory(id);
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
    } finally {
      await channel.ack(originalMessage);
    }
  }

  @EventPattern('update-category')
  async updateCategory(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    this.logger.log(`data: ${JSON.stringify(data)}`);
    try {
      const _id: string = data.id;
      const category: Category = data.category;
      await this.appService.updateCategory(_id, category);
      await channel.ack(originalMessage);
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      ackErrors.map(async (ackError) => {
        if (error.message.includes(ackError)) {
          await channel.ack(originalMessage);
        }
      });
    }
  }
}
