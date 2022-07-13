import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategorySchema } from './interfaces/categories/category.schema';
import { PlayerSchema } from './interfaces/players/player.schema';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://mateus:123@cluster0.uj8bzof.mongodb.net/sradmbackend?retryWrites=true&w=majority',
    ),
    MongooseModule.forFeature([
      { name: 'Player', schema: PlayerSchema },
      { name: 'Category', schema: CategorySchema },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
