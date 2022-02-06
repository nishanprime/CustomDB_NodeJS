const express = require('express');
const bodyParser = require('body-parser');
const db = require('./repositories/users');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send(`
    <div>
      <form method="POST">
        <input name="email" placeholder="email" />
        <input name="password" placeholder="password" />
        <input name="passwordConfirmation" placeholder="password confirmation" />
        <button>Sign Up</button>
      </form>
    </div>
  `);
});

app.post('/', async (req, res) => {
  const { email, password, passwordConfirmation } = req.body;
  if (
    !email ||
    !password ||
    !passwordConfirmation ||
    passwordConfirmation !== password
  ) {
    return res.send(`Error`);
  } else {
    const existingUser = await db.getOneBy({ email });
    if (existingUser) {
      return res.send('Email in use ');
    } else {
      const createdUser = await db.create({ email, password });
      return res.send('Account created!!!');
    }
  }
});

app.listen(3000, () => {
  console.log('Listening');
});
