const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');

class User {
  constructor(userData) {
    this.name = userData.name;
    this.email = userData.email?.toLowerCase();
    this.password = userData.password;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  // Validate user data
  static validate(userData) {
    const errors = [];

    if (!userData.name || userData.name.trim().length === 0) {
      errors.push('Name is required');
    }

    if (!userData.email || !this.isValidEmail(userData.email)) {
      errors.push('Valid email is required');
    }

    if (!userData.password || userData.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    return errors;
  }

  // Email validation
  static isValidEmail(email) {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
  }

  // Hash password
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 12);
  }

  // Compare password
  static async comparePassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }

  // Convert to JSON (exclude password)
  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}

module.exports = User;