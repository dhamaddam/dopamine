import express from 'express';
const router = express.Router();
import { v4 as uuidv4 } from 'uuid';
import mysql from 'mysql2';

// Create a connection pool (good for performance)
const db = mysql.createPool({
    host: 'localhost',    // Your MySQL host
    user: 'root',         // Your MySQL user
    password: 'root', // Your MySQL password
    port:'8889',
    database: 'dopamine'    // Your database name
  });

  // Test database connection
db.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to MySQL database:', err);
      return;
    }
    console.log('Connected to MySQL database!');
    connection.release();  // Release connection back to the pool
  });

  // Automatically create the 'users' table if it doesn't exist
const createUsersTable = `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

db.query(createUsersTable, (err, result) => {
if (err) {
  console.error('Error creating table:', err);
  return;
}
console.log('Users table created or already exists');
});

// Getting the list of users from the mock database
router.get('/', (req, res) => {
    // res.send(users);
    const sql = 'SELECT * FROM users';  // Your SQL query
    db.query(sql, (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database query error' });
      }
      res.json(results);  // Send results as JSON response
    });
})

router.post('/', (req, res) => {
    const { first_name, last_name, email } = req.body;
    const sql = 'INSERT INTO users (first_name,last_name, email) VALUES (?, ? , ?)';
    db.query(sql, [first_name, last_name, email], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database insert error' });
      }
      res.json({ message: 'User added successfully', id: result.insertId });
    });
})
router.get('/:id', (req, res) => {
    const id = req.params.id;

    const sql = 'SELECT * FROM users WHERE id = ?';
    db.query(sql, [id], (err, results) => {
      if (err) {
        console.error('Error fetching record:', err);
        return res.status(500).send('Error fetching record');
      }
      if (results.length === 0) {
        return res.status(404).send('Record not found');
      }
      res.json(results[0]);
    });
  });

    //const { id } = req.params;

   // const foundUser = users.find((user) => user.id === id)

   // res.send(foundUser)
//});

router.delete('/:id', (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM users WHERE id = '+id;
    db.query(sql, [id], (err, results) => {
      if (err) {
        console.error('Error deleting record:', err);
        return res.status(500).send('Error deleting record');
      }
      if (results.affectedRows === 0) {
        return res.status(404).send('Record not found');
      }
      res.send('Record deleted successfully');
    });
  });
  
  
    //users = users.filter((user) => user.id !== id)
   // res.send(`${id} deleted successfully from database`);
 // });





  router.patch('/:id', (req, res) => {
    const { id } = req.params;
  
   const { first_name, last_name, email} = req.body;
  
   // const user = users.find((user) => user.id === id)
   const sql = 'UPDATE users SET first_name = ?, last_name = ?, email = ? WHERE id = '+id;
   db.query(sql, [first_name, last_name, email], (err, results) => {
      if (err) {
        console.error('Error updating record:', err);
        return res.status(500).send('Error updating record');
      }
      res.send('Record updated successfully');
    });
  });

export default router