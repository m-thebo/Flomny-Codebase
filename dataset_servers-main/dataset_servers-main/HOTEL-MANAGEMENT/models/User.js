// In a real application, this would be a Mongoose/Sequelize model
// For this mock API, we'll use a simple class

class User {
  constructor(id, name, email, password, phone = '') {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.phone = phone;
    this.bookings = [];
    this.createdAt = new Date();
  }

  addBooking(bookingId) {
    this.bookings.push(bookingId);
  }

  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}

module.exports = User; 