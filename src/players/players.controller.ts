import { ackMessageError } from './../common/utils/ackMessages';
import { PlayersService } from './players.service';
import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { Player } from 'src/players/interfaces/player.interface';
import { ackMessage } from 'src/common/utils/ackMessages';

const ackErrors: string[] = [
  'E11000',
  'the user with this email or this phone already registered',
  'Cast to ObjectId failed for value',
  'cannot find user with id',
];

@Controller('players')
export class PlayersController {
  private readonly logger = new Logger(PlayersController.name);
  constructor(private playersService: PlayersService) {}

  @EventPattern('create-player')
  async createPlayer(@Payload() player: Player, @Ctx() context: RmqContext) {
    try {
      await this.playersService.createPlayer(player);
      await ackMessage(context);
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      await ackMessageError(ackErrors, error, context);
    }
  }

  @EventPattern('update-player')
  async updatePlayer(@Payload() player: Player, @Ctx() context: RmqContext) {
    try {
      await this.playersService.updatePlayer(player);
      await ackMessage(context);
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      await ackMessageError(ackErrors, error, context);
    }
  }

  @MessagePattern('get-player-by-id')
  async getPlayerById(
    @Payload() id: string,
    @Ctx() context: RmqContext,
  ): Promise<Player> {
    try {
      return await this.playersService.getPlayerById(id);
    } catch (error) {
      if (error.message.indexOf('Cast to ObjectId failed for value') !== -1) {
        return null;
      }

      this.logger.error(`error: ${JSON.stringify(error.message)}`);
    } finally {
      await ackMessage(context);
    }
  }

  @MessagePattern('get-players')
  async getPlayers(@Ctx() context: RmqContext): Promise<Player[]> {
    try {
      return await this.playersService.getPlayers();
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
    } finally {
      await ackMessage(context);
    }
  }

  @EventPattern('delete-player')
  async deletePlayer(
    @Payload() id: string,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    try {
      await this.playersService.deletePlayerById(id);
      await ackMessage(context);
    } catch (error) {
      this.logger.error(`error: ${JSON.stringify(error.message)}`);
      await ackMessageError(ackErrors, error, context);
    }
  }
}
