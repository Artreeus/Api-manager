import mongoose from 'mongoose';

const ApiKeySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  encryptedKey: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
    default: '',
  },
  tags: [{
    type: String,
  }],
  provider: {
    type: String,
    enum: ['stripe', 'aws', 'google', 'github', 'openai', 'other'],
    default: 'other',
  },
  environment: {
    type: String,
    enum: ['production', 'staging', 'development'],
    default: 'production',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastAccessed: {
    type: Date,
    default: Date.now,
  },
});

ApiKeySchema.index({ userId: 1, label: 1 });
ApiKeySchema.index({ userId: 1, tags: 1 });
ApiKeySchema.index({ userId: 1, provider: 1 });

export default mongoose.models.ApiKey || mongoose.model('ApiKey', ApiKeySchema);