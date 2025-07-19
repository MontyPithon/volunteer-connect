const users = require('./users');
const { validateRegistration, validateLogin } = require('./authValidation');

exports.register = (req, res) => {
  const { error } = validateRegistration(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { email, password } = req.body;

  const exists = users.find(u => u.email === email);
  if (exists) return res.status(409).json({ error: 'User already exists' });

  users.push({ email, password });
  res.status(201).json({ message: 'User registered successfully' });
};

exports.login = (req, res) => {
  const { error } = validateLogin(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  res.status(200).json({ message: 'Login successful' });
};
