# phpMyAdmin Deployment Guide

## Generated Files

1. `001_schema.sql` - Creates database tables
2. `002_seed_upgrades.sql` - Seeds the upgrade configurations

## Deployment Steps

### Option 1: Import via phpMyAdmin

1. Log in to phpMyAdmin on your cPanel hosting
2. Select your database (or create one if needed)
3. Click on "Import" tab
4. Upload `001_schema.sql` first
5. Upload `002_seed_upgrades.sql` second

### Option 2: Manual SQL execution

1. Open phpMyAdmin
2. Select your database
3. Click on "SQL" tab
4. Copy and paste the contents of each file

## Verification

After deployment, run this query to verify:

```sql
SELECT COUNT(*) as total_upgrades FROM upgrade_configs;
```

Expected result: 66 upgrades

## Database Connection

Make sure your `.env` file has the correct DATABASE_URL:

```
DATABASE_URL="mysql://your_user:your_password@localhost/your_database"
```

## Troubleshooting

- If you get "Table already exists" errors, run schema first
- If you get encoding issues, ensure UTF-8 encoding is selected
- For large imports, increase PHP memory limit in phpMyAdmin
