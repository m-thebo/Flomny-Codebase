class Room {
  constructor(id, name, type, price, capacity, description, amenities = [], images = []) {
    this.id = id;
    this.name = name;
    this.type = type; // e.g., 'standard', 'deluxe', 'suite'
    this.price = price;
    this.capacity = capacity;
    this.description = description;
    this.amenities = amenities;
    this.images = images;
    this.isAvailable = true;
    this.bookedDates = []; // Array of {startDate, endDate} objects
  }

  isBooked(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return this.bookedDates.some(booking => {
      const bookingStart = new Date(booking.startDate);
      const bookingEnd = new Date(booking.endDate);
      
      return (
        (start <= bookingEnd && start >= bookingStart) ||
        (end <= bookingEnd && end >= bookingStart) ||
        (start <= bookingStart && end >= bookingEnd)
      );
    });
  }

  addBooking(startDate, endDate) {
    this.bookedDates.push({ startDate, endDate });
  }
}

module.exports = Room; 