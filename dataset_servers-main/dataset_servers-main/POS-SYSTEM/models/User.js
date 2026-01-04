// In a real application, this would be a Mongoose/Sequelize model
// For this mock API, we'll use a simple class

class User {
  constructor(id, username, password, role = 'cashier', name = '') {
    this.id = id;
    this.username = username;
    this.password = password;
    this.role = role; // admin or cashier
    this.name = name;
    this.createdAt = new Date();
    this.lastLogin = null;
  }

  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}

module.exports = User; 