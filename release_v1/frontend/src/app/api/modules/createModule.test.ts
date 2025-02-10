import { createModule } from './createModule';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
async function test() {
  const result = await createModule({
    topic: 'player',
    concept: 'Babe Ruth',
    difficulty: 2,
    sport: 'baseball'
  });

  console.log(JSON.stringify(result, null, 2));
}

test().catch(console.error);