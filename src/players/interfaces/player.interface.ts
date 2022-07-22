import { Category } from '../../categories/interfaces/category.interface';
import { Document } from 'mongoose';

export interface Player extends Document {
  phoneNumber: string;
  email: string;
  name: string;
  ranking: string;
  positionRanking: number;
  urlImagePlayer: string;
  category: Category;
}