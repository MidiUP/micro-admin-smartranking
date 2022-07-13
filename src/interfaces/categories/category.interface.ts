import { Document } from 'mongoose';
import { Player } from 'src/interfaces/players/player.interface';

export interface Category extends Document {
  category: string;
  description: string;
  events: Event[];
  players: Player[];
}

export interface Event {
  name: string;
  operation: string;
  value: number;
}
