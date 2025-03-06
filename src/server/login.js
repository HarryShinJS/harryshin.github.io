// User Management Routes and Table Creation
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// User Registration Route
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, full_name } = req.body;

    // Check if user already exists
    const checkUserQuery = 'SELECT * FROM users WHERE username = ? OR email = ?';
    db.query(checkUserQuery, [username, email], async (checkErr, existingUsers) => {
      if (checkErr) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (existingUsers.length > 0) {
        return res.status(400).json({ error: 'Username or email already exists' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const existingMemberIds = new Set(); // 생성된 ID를 저장할 Set (중복 방지용)

      function generateRandomMemberId(length = 10) {
          const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
          let randomId;

          do {
              randomId = '';
              for (let i = 0; i < length; i++) {
                  const randomIndex = Math.floor(Math.random() * characters.length);
                  randomId += characters[randomIndex];
              }
          } while (existingMemberIds.has(randomId)); // 중복된 ID가 있다면 다시 생성

          existingMemberIds.add(randomId); // 새로운 ID를 저장
          return randomId;
      }

      // 사용 예시
      const newMemberId1 = generateRandomMemberId();
      console.log('Generated Member ID:', newMemberId1);

      const newMemberId2 = generateRandomMemberId();
      console.log('Generated Member ID:', newMemberId2);

      // Set을 확인해서 중복 방지가 되었는지 확인
      console.log('All Generated IDs:', Array.from(existingMemberIds));


      // Insert new user
      const insertUserQuery = `
        INSERT INTO users 
        (username, email, password, full_name) 
        VALUES (?, ?, ?, ?)
      `;
      
      db.query(
        insertUserQuery, 
        [newMemberId1, email, hashedPassword, full_name], 
        (insertErr, result) => {
          if (insertErr) {
            return res.status(500).json({ error: 'Registration failed' });
          }
          
          res.status(201).json({ 
            message: 'User registered successfully',
            userId: result.insertId 
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// User Login Route
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  console.log('Login Request Body:', JSON.stringify(req.body, null, 2))

  const findUserQuery = 'SELECT * FROM users WHERE username = ?';
  db.query(findUserQuery, [username], async (err, users) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }

    if (users.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username }, 
      process.env.JWT_SECRET || 'your_jwt_secret', 
      { expiresIn: '1h' }
    );

    // Update last login
    const updateLoginQuery = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?';
    db.query(updateLoginQuery, [user.id]);

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email 
      } 
    });
  });
});