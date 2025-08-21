import { Database } from './connection';
import { createTablesSQL, createIndexesSQL, createTriggersSQL } from './schemas/schema.sql';

export class Migration {
  constructor(private db: Database) {}

  async runInitialMigration(): Promise<void> {
    console.log('Running initial database migration...');
    
    try {
      // Create tables
      await this.db.query(createTablesSQL);
      console.log('✓ Tables created successfully');

      // Create indexes
      await this.db.query(createIndexesSQL);
      console.log('✓ Indexes created successfully');

      // Create triggers
      await this.db.query(createTriggersSQL);
      console.log('✓ Triggers created successfully');

      // Insert default regions
      await this.insertDefaultRegions();
      console.log('✓ Default regions inserted successfully');

      console.log('Migration completed successfully!');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  private async insertDefaultRegions(): Promise<void> {
    const regions = [
      { name: 'North America', currency: 'USD', cashback_rate: 0.05 },
      { name: 'Europe', currency: 'EUR', cashback_rate: 0.04 },
      { name: 'Asia Pacific', currency: 'USD', cashback_rate: 0.06 },
      { name: 'Latin America', currency: 'USD', cashback_rate: 0.05 },
    ];

    for (const region of regions) {
      await this.db.query(
        `INSERT INTO regions (name, currency, cashback_rate) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (name) DO NOTHING`,
        [region.name, region.currency, region.cashback_rate]
      );
    }
  }
}