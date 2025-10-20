const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    permissions: {
      canInvite: {
        type: Boolean,
        default: false
      },
      canRemove: {
        type: Boolean,
        default: false
      },
      canManageSettings: {
        type: Boolean,
        default: false
      }
    }
  }],
  invites: [{
    email: {
      type: String,
      required: true
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['member', 'admin'],
      default: 'member'
    },
    token: String,
    expiresAt: Date,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'expired'],
      default: 'pending'
    },
    sentAt: {
      type: Date,
      default: Date.now
    }
  }],
  stats: {
    totalReviews: {
      type: Number,
      default: 0
    },
    averageImprovement: {
      type: Number,
      default: 0
    },
    totalMembers: {
      type: Number,
      default: 1
    }
  },
  settings: {
    isPublic: {
      type: Boolean,
      default: false
    },
    allowMemberInvites: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    }
  },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes (slug already has unique index from schema, owner already has index from field)
teamSchema.index({ 'members.user': 1 });

// Method to add member
teamSchema.methods.addMember = function(userId, role = 'member') {
  const exists = this.members.some(m => m.user.toString() === userId.toString());
  if (!exists) {
    this.members.push({ user: userId, role });
    this.stats.totalMembers = this.members.length;
  }
};

// Method to remove member
teamSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(m => m.user.toString() !== userId.toString());
  this.stats.totalMembers = this.members.length;
};

module.exports = mongoose.model('Team', teamSchema);

