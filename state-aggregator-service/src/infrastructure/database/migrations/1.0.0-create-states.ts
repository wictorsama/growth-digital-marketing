import { IMigration } from './migration.interface';
import { Connection } from 'mongoose';

export class CreateStatesMigration implements IMigration {
  version = '1.0.0';

  constructor(private connection: Connection) {}

  async up(): Promise<void> {
    const db = this.connection.db;
    await db.createCollection('states');
    await db.collection('states').createIndex({ name: 1 }, { unique: true });
  }

  async down(): Promise<void> {
    const db = this.connection.db;
    await db.collection('states').drop();
  }
}