const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

async function createTestUser() {
    const dbPath = path.join(__dirname, 'core/packages/server/flowise.db');
    const db = new sqlite3.Database(dbPath);

    const email = 'test@flowstack.com';
    const password = 'test123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // First, let's see what tables exist
    db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
        if (err) {
            console.error('Error listing tables:', err);
            return;
        }
        
        console.log('Available tables:', tables.map(t => t.name));
        
        // Look for user or auth related tables
        const userTables = tables.filter(t => 
            t.name.toLowerCase().includes('user') || 
            t.name.toLowerCase().includes('auth') ||
            t.name.toLowerCase().includes('account')
        );
        
        console.log('User-related tables:', userTables.map(t => t.name));
        
        // Check if enterprise user table exists
        if (tables.some(t => t.name === 'user')) {
            console.log('\nAttempting to insert user into "user" table...');
            db.run(`INSERT INTO user (email, password, created_at) VALUES (?, ?, datetime('now'))`, 
                [email, hashedPassword], 
                function(err) {
                    if (err) {
                        console.error('Error inserting user:', err);
                    } else {
                        console.log('✅ Test user created successfully!');
                        console.log('Email:', email);
                        console.log('Password:', password);
                    }
                    db.close();
                }
            );
        } else {
            console.log('\n⚠️  No standard user table found. Enterprise tables might not be initialized yet.');
            console.log('Try accessing the UI first to trigger table creation.');
            db.close();
        }
    });
}

createTestUser().catch(console.error); 