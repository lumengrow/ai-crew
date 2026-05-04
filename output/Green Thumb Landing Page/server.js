
```javascript
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer');
const validator = require('validator');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Database initialization
const dbPath = path.join(__dirname, 'contacts.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database schema
function initializeDatabase() {
  db.run(
    `CREATE TABLE IF NOT EXISTS contact_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      ip_address TEXT,
      user_agent TEXT
    )`,
    (err) => {
      if (err) {
        console.error('Error creating table:', err);
      } else {
        console.log('Database table initialized successfully');
      }
    }
  );
}

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password',
  },
});

// Verify email transporter connection
transporter.verify((error) => {
  if (error) {
    console.warn('Email transporter warning:', error.message);
    console.warn('Email notifications will not be sent. Please configure EMAIL_USER and EMAIL_PASSWORD environment variables.');
  } else {
    console.log('Email transporter is ready');
  }
});

// Input validation and sanitization helper
function validateAndSanitizeInput(name, email, message) {
  const errors = [];

  // Validate and sanitize name
  const sanitizedName = validator.trim(name);
  if (!sanitizedName || sanitizedName.length === 0) {
    errors.push('Name is required');
  } else if (sanitizedName.length < 2) {
    errors.push('Name must be at least 2 characters long');
  } else if (sanitizedName.length > 100) {
    errors.push('Name must not exceed 100 characters');
  }

  // Validate and sanitize email
  const sanitizedEmail = validator.trim(email).toLowerCase();
  if (!sanitizedEmail || sanitizedEmail.length === 0) {
    errors.push('Email is required');
  } else if (!validator.isEmail(sanitizedEmail)) {
    errors.push('Invalid email format');
  } else if (sanitizedEmail.length > 255) {
    errors.push('Email must not exceed 255 characters');
  }

  // Validate and sanitize message
  const sanitizedMessage = validator.trim(message);
  if (!sanitizedMessage || sanitizedMessage.length === 0) {
    errors.push('Message is required');
  } else if (sanitizedMessage.length < 10) {
    errors.push('Message must be at least 10 characters long');
  } else if (sanitizedMessage.length > 5000) {
    errors.push('Message must not exceed 5000 characters');
  }

  // Sanitize to prevent XSS
  const finalData = {
    name: validator.escape(sanitizedName),
    email: sanitizedEmail,
    message: validator.escape(sanitizedMessage),
  };

  return { isValid: errors.length === 0, errors, data: finalData };
}

// Rate limiting helper (simple in-memory implementation)
const rateLimitMap = new Map();

function checkRateLimit(ip, maxRequests = 5, windowMs = 60000) {
  const now = Date.now();
  const key = ip;

  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, []);
  }

  const timestamps = rateLimitMap.get(key);
  const recentTimestamps = timestamps.filter((t) => now - t < windowMs);

  if (recentTimestamps.length >= maxRequests) {
    return false;
  }

  recentTimestamps.push(now);
  rateLimitMap.set(key, recentTimestamps);
  return true;
}

// Send email notification to shop owner
async function sendOwnerNotification(submissionData) {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'your-email@gmail.com',
    to: process.env.OWNER_EMAIL || 'owner@shop.com',
    subject: `New Contact Form Submission from ${submissionData.name}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${submissionData.name}</p>
      <p><strong>Email:</strong> ${submissionData.email}</p>
      <p><strong>Submitted at:</strong> ${submissionData.timestamp}</p>
      <hr>
      <h3>Message:</h3>
      <p>${submissionData.message.replace(/\n/g, '<br>')}</p>
      <hr>
      <p><small>IP Address: ${submissionData.ip_address}</small></p>
    `,
    replyTo: submissionData.email,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Owner notification email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending owner notification:', error);
    return false;
  }
}

// Send confirmation email to user
async function sendUserConfirmation(email, name) {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'your-email@gmail.com',
    to: email,
    subject: 'We received your message',
    html: `
      <h2>Thank you for contacting us, ${name}!</h2>
      <p>We have received your message and will get back to you as soon as possible.</p>
      <p>Best regards,<br>The Shop Team</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('User confirmation email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending user confirmation:', error);
    return false;
  }
}

// POST /api/contact - Handle contact form submissions
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('user-agent') || 'unknown';

  // Rate limiting check (5 requests per minute per IP)
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
    });
  }

  // Validate and sanitize input
  const validation = validateAndSanitizeInput(name, email, message);

  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors: validation.errors,
    });
  }

  const { data } = validation;

  // Insert into database
  db.run(
    `INSERT INTO contact_submissions (name, email, message, ip_address, user_agent)
     VALUES (?, ?, ?, ?, ?)`,
    [data.name, data.email, data.message, clientIp, userAgent],
    async function (err) {
      if (err) {
        console.error('Database insertion error:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to save contact submission',
          code: 'DATABASE_ERROR',
        });
      }

      const submissionId = this.lastID;

      // Prepare data for email notifications
      const submissionData = {
        id: submissionId,
        name: data.name,
        email: data.email,
        message: data.message,
        timestamp: new Date().toISOString(),
        ip_address: clientIp,
      };

      // Send email notifications asynchronously
      try {
        // Send notification to owner
        await sendOwnerNotification(submissionData);

        // Send confirmation to user
        await sendUserConfirmation(data.email, data.name);
      } catch (emailError) {
        console.error('Error during email notification process:', emailError);
        // Don't fail the API response if emails can't be sent
        // The data is already saved to database
      }

      // Return success response
      return res.status(201).json({
        success: true,
        message: 'Contact form submitted successfully. We will get back to you soon.',
        code: 'SUBMISSION_SUCCESS',
        data: {
          id: submissionId,
          email: data.email,
          submittedAt: submissionData.timestamp,
        },
      });
    }
  );
});

// GET /api/contact/submissions - Retrieve all submissions (optional, for admin)
app.get('/api/contact/submissions', (req, res) => {
  // In production, add authentication/authorization middleware here
  const adminToken = req.headers.authorization;

  if (adminToken !== `Bearer ${process.env.ADMIN_TOKEN || 'admin-secret-key'}`) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
      code: 'UNAUTHORIZED',
    });
  }

  db.all(`SELECT * FROM contact_submissions ORDER BY timestamp DESC`, [], (err, rows) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve submissions',
        code: 'DATABASE_ERROR',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Submissions retrieved successfully',
      code: 'SUBMISSIONS_RETRIEVED',
      data: rows,
      count: rows.length,
    });
  });
});

// GET /api/contact/submissions/:id - Get specific submission (optional)
app.get('/api/contact/submissions/:id', (req, res) => {
  const adminToken = req.headers.authorization;

  if (adminToken !== `Bearer ${process.env.ADMIN_TOKEN || 'admin-secret-key'}`) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
      code: 'UNAUTHORIZED',
    });
  }

  const { id } = req.params;

  // Validate ID format
  if (!validator.isInt(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid submission ID',
      code: 'INVALID_ID',
    });
  }

  db.get(`SELECT * FROM contact_submissions WHERE id = ?`, [id], (err, row) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve submission',
        code: 'DATABASE_ERROR',
      });
    }

    if (!row) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
        code: 'NOT_FOUND',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Submission retrieved successfully',
      code: 'SUBMISSION_RETRIEVED',
      data: row,
    });
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    code: 'HEALTHY',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    code: 'NOT_FOUND',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unexpected error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    code: 'SERVER_ERROR',
  });
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Contact form API available at http://localhost:${PORT}/api/contact`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});
```