import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategorySchema } from './categories/interfaces/category.schema';
import { CategoriesModule } from './categories/categories.module';
import { PlayersModule } from './players/players.module';
import 'dotenv/config';
import { PlayerSchema } from './players/interfaces/player.schema';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URL),
    MongooseModule.forFeature([
      { name: 'Player', schema: PlayerSchema },
      { name: 'Category', schema: CategorySchema },
    ]),
    CategoriesModule,
    PlayersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
