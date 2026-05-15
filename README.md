123456789# SecureKeys - API Key Manager

A secure API key management application built with Next.js, featuring client-side encryption and a clean, professional interface.

## Features

### 🔐 Security First
- **Client-Side Encryption**: All API keys are encrypted using AES encryption before being stored
- **Master Password Protection**: Access your keys only with your master password
- **No Plain Text Storage**: Keys are never stored or transmitted in plain text
- **Secure Authentication**: Built with NextAuth.js for robust user authentication

### 📊 Key Management
- **Add/Edit/Delete Keys**: Full CRUD operations for your API keys
- **Smart Organization**: Organize by provider, environment, and custom tags
- **Masked Display**: Keys are masked by default, reveal only when needed
- **One-Click Copy**: Secure copy-to-clipboard functionality
- **Bulk Operations**: Import/export encrypted key collections

### 🔍 Advanced Features
- **Full-Text Search**: Search across labels, notes, and tags
- **Advanced Filtering**: Filter by provider, environment, and tags
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Real-Time Updates**: Instant UI updates with optimistic rendering

## Tech Stack

- **Frontend**: Next.js 13+ with App Router
- **UI**: Tailwind CSS + shadcn/ui components
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js with credentials provider
- **Encryption**: crypto-js for client-side AES encryption
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ and npm
- MongoDB database (local or cloud)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd securekeys
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-super-secret-nextauth-key
   MONGODB_URI=mongodb://localhost:27017/api-key-manager
   ```

4. **Start MongoDB**
   Make sure your MongoDB instance is running locally or update the `MONGODB_URI` to point to your MongoDB Atlas cluster.

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Getting Started
1. **Create an Account**: Sign up with your email and password
2. **Set Master Password**: Choose a strong master password for encrypting your keys
3. **Add Your First Key**: Click "Add Key" and enter your API key details

### Adding API Keys
- **Label**: Descriptive name for the key (e.g., "Stripe Production")
- **API Key**: The actual key value (encrypted client-side)
- **Provider**: Choose from Stripe, AWS, Google, GitHub, OpenAI, or Other
- **Environment**: Production, Staging, or Development
- **Tags**: Custom tags for organization
- **Notes**: Additional context or usage notes

### Security Best Practices
- Use a strong, unique master password
- Log out when not using the application
- Regularly backup your encrypted keys
- Never share your master password

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth.js handlers

### API Keys
- `GET /api/keys` - Fetch user's API keys (with filtering)
- `POST /api/keys` - Create new API key
- `PUT /api/keys/[id]` - Update existing API key
- `DELETE /api/keys/[id]` - Delete API key
- `PATCH /api/keys/[id]` - Update last accessed timestamp

## Database Schema

### User Model
```javascript
{
  email: String (unique, required),
  hashedPassword: String (required),
  createdAt: Date
}
```

### ApiKey Model
```javascript
{
  userId: ObjectId (required),
  label: String (required),
  encryptedKey: String (required),
  notes: String,
  tags: [String],
  provider: String (enum),
  environment: String (enum),
  createdAt: Date,
  lastAccessed: Date
}
```

## Security Architecture

### Encryption Flow
1. User enters API key in the frontend
2. Key is encrypted using AES with master password
3. Encrypted key is sent to server
4. Server stores encrypted key (never sees plain text)

### Decryption Flow
1. User requests to view key
2. Encrypted key is fetched from server
3. Key is decrypted client-side using master password
4. Plain text key is displayed temporarily

## 🗺️ Roadmap

- [ ] **Multi-Factor Authentication (MFA)**: Add an extra layer of security for logins
- [ ] **Key Expiration Alerts**: Notify users when keys are about to expire
- [ ] **Usage Analytics**: Track and visualize key usage over time
- [ ] **Team Collaboration**: Securely share key collections with team members
- [ ] **Mobile App**: Dedicated mobile application for on-the-go management

## 📁 Code Structure

```text
├── app/                    # Next.js 13+ App Router
│   ├── api/               # Serverless API routes
│   │   ├── auth/          # Authentication endpoints
│   │   └── keys/          # API key management endpoints
│   ├── auth/              # Auth pages (Sign In, Sign Up)
│   ├── dashboard/         # User dashboard & key listing
│   ├── settings/          # User account settings
│   └── layout.tsx         # Global layout & providers
├── components/            # React components
│   ├── ui/                # Base UI components (shadcn/ui)
│   ├── ApiKeyCard.tsx     # Display card for individual keys
│   ├── AddKeyDialog.tsx   # Modal for adding new keys
│   └── GlassCard.tsx      # Specialized glassmorphism container
├── lib/                   # Shared logic & configuration
│   ├── models/           # Mongoose schemas (User, ApiKey)
│   ├── auth.ts           # NextAuth.js configuration
│   ├── encryption.ts     # Client-side AES encryption service
│   ├── mongodb.ts        # Database connection management
│   └── utils.ts          # Helper functions & utilities
├── types/                # TypeScript definitions
└── public/               # Static assets
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## Security Considerations

- All encryption happens client-side
- Master passwords are never transmitted to the server
- API keys are never logged or stored in plain text
- Regular security audits recommended for production use

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue on GitHub or contact the development team.
