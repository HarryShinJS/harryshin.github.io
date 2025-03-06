const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
//const schedule = require('node-schedule');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);

// 포트 설정
const PORT = 3001;

// MySQL-session 연결 설정
// const options = {
//   host: 'localhost',
//   port: 3306,
//   user: 'test',
//   password: 'test',
//   database: 'study',
// };

// const sessionStore = new MySQLStore(options);

// MySQL 연결 설정
const db = mysql.createConnection({
  host: 'localhost',
  user: 'test',
  password: 'test', // 실제 비밀번호로 변경
  database: 'study',
});

// Express 애플리케이션 생성
const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// 미들웨어 설정
app.use(bodyParser.json());

// app.use(session({
//   secret:"asdfasffdas",
//   resave:false,
//   saveUninitialized:true,
//   store: sessionStore 
// }))



// MySQL 연결
db.connect((err) => {
  if (err) {
    console.error('MySQL 연결 실패:', err);
    return;
  }
  console.log('MySQL에 연결되었습니다.');
});

// 기본 라우트 설정
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.post('/api/contact', (req, res) => {
  const { email, name, subject, message } = req.body;
  const query = 'INSERT INTO messages (email, name, subject, message) VALUES (?, ?, ?, ?)';
  db.query(query, [email, name, subject, message], (err, results) => {
    if (err) {
      console.error('Contact Me 보내기 실패:', err);
      return res.status(500).json({ error: 'Contact Me 보내기 실패' });
    }
    console.log('Contact Me 보내기 성공');
    return res.status(200).json({ message: 'Contact Me 보내기 성공' });
  });
});

// User Registration Route
app.post('/api/register', async (req, res) => {
  try {
    const { 
      member_id, 
      username, 
      email, 
      password_hash, 
      full_name, 
      phone_number, 
      birth_date, 
      gender, 
      address, 
      ip_address, 
      role 
    } = req.body;

    console.log("Full Registration Request Body:", JSON.stringify(req.body, null, 2));

    // Validate required fields
    const requiredFields = [
      'member_id', 'username', 'email', 'password_hash', 
      'full_name', 'phone_number', 'birth_date', 
      'gender', 'address', 'ip_address', 'role'
    ];

    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return res.status(400).json({ 
        error: 'Missing required fields', 
        missingFields: missingFields 
      });
    }

    // Check if user already exists
    const checkUserQuery = 'SELECT * FROM study.portfolio_members WHERE username = ? OR email = ?';

    db.query(checkUserQuery, [username, email], async (checkErr, existingUsers) => {
      if (checkErr) {
        console.error('Database check error:', checkErr);
        return res.status(500).json({ 
          error: 'Database error during user check',
          details: checkErr.message 
        });
      }

      if (existingUsers.length > 0) {
        console.warn('Duplicate user attempt:', { username, email });
        return res.status(400).json({ error: 'Username or email already exists' });
      }

      // Insert new user
      const insertUserQuery = `
        INSERT INTO study.portfolio_members 
        (member_id, username, password_hash, email, phone_number, full_name, birth_date, gender, address, ip_address, role) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const queryParams = [
        member_id, 
        username, 
        password_hash, 
        email, 
        phone_number, 
        full_name, 
        birth_date, 
        gender, 
        address, 
        ip_address, 
        role
      ];

      console.log('Query Parameters:', queryParams);
      
      db.query(
        insertUserQuery, 
        queryParams, 
        (insertErr, result) => {
          if (insertErr) {
            console.error('Registration insert error:', {
              error: insertErr,
              sqlMessage: insertErr.sqlMessage,
              sqlState: insertErr.sqlState,
              code: insertErr.code
            });
            return res.status(500).json({ 
              error: 'Registration failed', 
              details: insertErr.sqlMessage || 'Unknown database error'
            });
          }
          
          res.status(201).json({ 
            message: 'User registered successfully',
            userId: result.insertId,
            memberId: member_id
          });
        }
      );
    });
  } catch (error) {
    console.error('Unexpected server registration error:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'Unexpected server error during registration',
      details: error.message 
    });
  }
});

// User Login Route
app.post('/api/login', (req, res) => {
  console.log(req.body)
  const { username, password } = req.body;

  const findUserQuery = 'SELECT * FROM study.portfolio_members WHERE username = ?';
  
  db.query(findUserQuery, [username], async (err, users) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }

    if (users.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    const user = users[0];
    const isMatch = bcrypt.compareSync(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.member_id, username: user.username }, 
      process.env.JWT_SECRET || 'your_jwt_secret', 
      { expiresIn: '1h' }
    );


    // Update last login
    const updateLoginQuery = 'UPDATE study.portfolio_members SET last_login = CURRENT_TIMESTAMP WHERE username = ?';
    console.log(updateLoginQuery, [user.username])

    db.query(updateLoginQuery, [user.username]);

    res.json({ 
      token, 
      user: { 
        id: user.member_id, 
        username: user.username, 
        email: user.email 
      } 
    });
    
    //localStorage.setItem('userSession', JSON.stringify({ username, token: tokenData.token }));  
    });
});

app.get('/api/protected', (req, res) => {
  // const token = req.headers.authorization?.split(' ')[1]; // Get token from header
  // if (!token) {
  //   return res.status(401).json({ error: 'No token provided' });
  // }

  // jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, decoded) => {
  //   if (err) {
  //     return res.status(401).json({ error: 'Failed to authenticate token' });
  //   }

  //   // Token is valid, return user info
  //   res.json({ id: decoded.id, username: decoded.username });
  // });
  console.log('protect')
});


let id = 2;
const todoList = [{
  id: 1,
  title: 'Todo 1',
  done : false,
}];

// todoList api
app.get('/api/todo', (req, res) => {
  res.json(todoList);
});

app.post('/api/todo', (req, res) => {
  const { title, done } = req.body;
  todoList.push({
    id: id++,
    title,
    done,
  });
  return res.send("Success");
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);

    // 스케줄러 사용 시 받는 함수
    // schedule.scheduleJob('0 * * * * *', function(){
    //   console.log(new Date() + 'Running Schedule!!');
    // });


  });