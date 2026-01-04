class Booking {
  constructor(id, userId, roomId, startDate, endDate, guests, totalPrice, status = 'pending') {
    this.id = id;
    this.userId = userId;
    this.roomId = roomId;
    this.startDate = startDate;
    this.endDate = endDate;
    this.guests = guests;
    this.totalPrice = totalPrice;
    this.status = status; // pending, confirmed, cancelled, completed
    this.createdAt = new Date();
    this.paymentStatus = 'pending';
    this.specialRequests = '';
  }

  confirm() {
    this.status = 'confirmed';
  }

  cancel() {
    this.status = 'cancelled';
  }

  complete() {
    this.status = 'completed';
  }

  updatePayment(status) {
    this.paymentStatus = status;
  }
}

module.exports = Booking; 