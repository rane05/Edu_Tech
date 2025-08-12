const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    certificateId: {
        type: String,
        required: true,
        unique: true
    },
    issuer: {
        type: String,
        required: true
    },
    issueDate: {
        type: Date,
        required: true
    },
    expirationDate: {
        type: Date,
        required: false
    },
    skillsCovered: [{
        type: String,
        required: true
    }],
    status: {
        type: String,
        enum: ['active', 'expired', 'revoked'],
        default: 'active'
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'failed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
certificationSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Method to check if certification is expired
certificationSchema.methods.isExpired = function() {
    if (!this.expirationDate) return false;
    return new Date() > this.expirationDate;
};

// Method to get days until expiration
certificationSchema.methods.daysUntilExpiration = function() {
    if (!this.expirationDate) return null;
    const now = new Date();
    const diffTime = this.expirationDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

// Static method to find active certifications by user
certificationSchema.statics.findActiveByUser = function(userId) {
    return this.find({
        userId: userId,
        status: 'active',
        $or: [
            { expirationDate: { $exists: false } },
            { expirationDate: { $gt: new Date() } }
        ]
    });
};

// Static method to find expiring certifications
certificationSchema.statics.findExpiringSoon = function(daysThreshold = 30) {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);
    
    return this.find({
        status: 'active',
        expirationDate: {
            $exists: true,
            $lte: thresholdDate,
            $gt: new Date()
        }
    });
};

const Certification = mongoose.model('Certification', certificationSchema);

module.exports = Certification;
