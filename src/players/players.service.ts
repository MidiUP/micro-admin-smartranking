import { RpcException } from '@nestjs/microservices';
import { Player } from 'src/players/interfaces/player.interface';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class PlayersService {
  private readonly logger = new Logger(PlayersService.name);
  constructor(
    @InjectModel('Player') private readonly playerModel: Model<Player>,
  ) {}

  async getPlayerById(_id: string): Promise<Player> {
    try {
      return await this.playerModel
        .findOne({ _id })
        .populate('category')
        .exec();
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  async getPlayers(): Promise<Player[]> {
    try {
      return await this.playerModel.find().populate('category').exec();
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  async createPlayer(createPlayerDto: Player): Promise<Player> {
    try {
      const { email } = createPlayerDto;

      const playerExists = await this.playerModel.findOne({ email }).exec();
      if (playerExists) {
        throw new RpcException(
          `the user with this email or this phone already registered`,
        );
      }

      const playerCreated = new this.playerModel(createPlayerDto);
      return await playerCreated.save();
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  async updatePlayer(updatePlayerDto: Player): Promise<Player> {
    try {
      const { id } = updatePlayerDto;
      const playerExists = await this.playerModel.findOne({ _id: id }).exec();

      if (!playerExists) {
        throw new RpcException(`cannot find user with id: ${id}`);
      }

      return await this.playerModel
        .findOneAndUpdate({ id }, { $set: updatePlayerDto })
        .exec();
    } catch (error) {
      this.logger.error(JSON.stringify(error));
      throw new RpcException(error.message);
    }
  }

  async deletePlayerById(_id: string): Promise<void> {
    try {
      return this.playerModel.remove({ _id }).exec();
    } catch (error) {
      throw new RpcException(error.message);
    }
  }
}
