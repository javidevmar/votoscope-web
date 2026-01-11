import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@votoscope/db';

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/1poller';

// Disable prefetch as it is not supported for "Transaction" pool mode 
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
