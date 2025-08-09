const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const bcrypt = require('bcrypt');
const db = require('./db');
const { validateRegistration, validateLogin } = require('./authValidation');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
console.log("Email:", process.env.EMAIL_USER);
console.log("Password:", process.env.EMAIL_PASS);

exports.register = async (req, res) => {
  //
console.log('Request Body:', req.body);
//
  const { error } = validateRegistration(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { email, password, role = 'volunteer' } = req.body; // Default to volunteer if no role specified
  const hashed = await bcrypt.hash(password, 10);
  const verification_token = crypto.randomBytes(32).toString('hex');
  console.log('Generated Token:', verification_token); // Debug log

  try {
    const result = await db.query(
      'INSERT INTO usercredentials (email, password_hash, verification_token, role) VALUES ($1, $2, $3, $4) RETURNING user_id',
      [email, hashed, verification_token, role]
    );

    // Send verification email
    const transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
      user: 'apikey',             
      pass: process.env.SENDGRID_API_KEY,
      },
    });
    const verificationUrl = `http://localhost:3000/verify-email?verification_token=${verification_token}`;
    console.log('Verification URL:', verificationUrl); // Debug log
    
    await transporter.sendMail({
      to: email,
      from: process.env.EMAIL_FROM,
      subject: 'Verify your email',
       html: `
    <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);">
        <h2 style="color: #111827; margin-bottom: 10px;">Welcome to Volunteer Connect!</h2>
        <p style="color: #4b5563; font-size: 16px;">Thanks for registering. Please verify your email address to complete your signup.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #3b82f6; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">
            Verify Email
          </a>
        </div>

        <p style="color: #6b7280; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="color: #2563eb; font-size: 14px; word-break: break-all;">${verificationUrl}</p>

        <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">If you didn’t create an account, you can ignore this email.</p>
      </div>
    </div>
  `,
});

    res.status(201).json({ message: 'User registered. Please check your email to verify your account.' });
  } catch (err) {
  console.error('Registration error:', err);

  if (err.code === '23505') {
    return res.status(409).json({ error: 'Email already registered' });
  }

  res.status(500).json({ error: 'Unexpected error during registration' });
}

};

exports.login = async (req, res) => {
  const { error } = validateLogin(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { email, password } = req.body;

  try {
    const result = await db.query('SELECT user_id, email, password_hash, role, is_verified FROM usercredentials WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash)))
      return res.status(401).json({ error: 'Invalid credentials' });
    
    if (!user.is_verified)
      return res.status(403).json({ error: 'Please verify your email before logging in.' });

    res.status(200).json({ 
      message: 'Login successful', 
      userId: user.user_id,
      email: user.email,
      role: user.role 
    });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.verifyEmail = async (req, res) => {
  const { verification_token } = req.query;
  if (!verification_token) return res.status(400).json({ error: 'Missing token' });

  try {
    const result = await db.query(
      'UPDATE usercredentials SET is_verified = TRUE, verification_token = NULL WHERE verification_token = $1 RETURNING user_id',
      [verification_token]
    );

    if (!result || result.rowCount === 0) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    res.status(200).json({ message: 'Email verified successfully' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};
