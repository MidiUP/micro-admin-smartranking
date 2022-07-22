import { CategoriesService } from './categories.service';
import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { Category } from './interfaces/category.interface';

const ackErrors: string[] = [
  'E11000',
  'category is already registered',
  'Cast to ObjectId failed for value',
];

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}
  private readonly logger = new Logger(CategoriesController.name);

  @EventPattern('create-category')
  async createCategory(
    @Payload() category: Category,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    this.logger.log(JSON.stringify(category));
    try {
      await this.categoriesService.createCategory(category);
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
      return await this.categoriesService.getCategories();
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
      return await this.categoriesService.getCategoriesById(id);
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      return null;
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
      await this.categoriesService.updateCategory(_id, category);
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
