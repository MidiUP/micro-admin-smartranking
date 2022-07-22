import { Player } from 'src/players/interfaces/player.interface';
import { RpcException } from '@nestjs/microservices';
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './interfaces/category.interface';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel('Category') private readonly categoryModel: Model<Category>,
    @InjectModel('Player') private readonly playeryModel: Model<Player>, // private readonly playersService: PlayersService,
  ) {}

  private readonly logger = new Logger(CategoriesService.name);

  async createCategory(createCategoryDto: Category): Promise<Category> {
    try {
      const { category } = createCategoryDto;

      const categoryExists = await this.categoryModel
        .findOne({ category })
        .exec();

      if (categoryExists) {
        throw new BadRequestException(`the category is already registered`);
      }

      const categoryCreated = new this.categoryModel(createCategoryDto);
      return await categoryCreated.save();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async updateCategory(
    _id: string,
    createCategoryDto: Category,
  ): Promise<Category> {
    try {
      return await this.categoryModel
        .findOneAndUpdate({ _id }, { $set: createCategoryDto })
        .exec();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async getCategories(): Promise<Category[]> {
    try {
      return await this.categoryModel.find().populate('players').exec();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }

  async getCategoriesById(_id: string): Promise<Category> {
    return await this.categoryModel.findOne({ _id }).populate('players').exec();
  }
  async getCategoriesByCategory(category: string): Promise<Category> {
    return await this.categoryModel
      .findOne({ category })
      .populate('players')
      .exec();
  }

  // async deleteCategoryById(_id: string): Promise<void> {
  //   await this.categoryModel.remove({ _id }).exec();
  // }

  // async addPlayerInCategory(params: string[]): Promise<void> {
  //   const category = params['category'];
  //   const idPlayer = params['idPlayer'];

  //   const existsCategory = await this.categoryModel
  //     .findOne({ category })
  //     .exec();

  //   const playerAlreadyRegisteredCategory = await this.categoryModel
  //     .find({ category })
  //     .where('players')
  //     .in(idPlayer)
  //     .exec();

  //   await this.playersService.getPlayerById(idPlayer);

  //   if (!existsCategory) {
  //     throw new BadRequestException('not found category');
  //   }

  //   if (playerAlreadyRegisteredCategory.length > 0) {
  //     throw new BadRequestException(
  //       `user is already registered in category ${category}`,
  //     );
  //   }

  //   existsCategory.players.push(idPlayer);
  //   await this.categoryModel
  //     .findOneAndUpdate({ category }, { $set: existsCategory })
  //     .exec();
  // }

  // async getCategoryOfPlayer(idPlayer: string): Promise<Category> {
  //   const CategoryPlayer = await this.categoryModel
  //     .findOne({})
  //     .where('players')
  //     .in([idPlayer])
  //     .exec();
  //   return CategoryPlayer;
  // }
}
