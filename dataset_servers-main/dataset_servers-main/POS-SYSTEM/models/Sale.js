class Sale {
  constructor(id, items, cashierId, customerId = null) {
    this.id = id;
    this.items = items; // Array of {productId, quantity, price, subtotal}
    this.cashierId = cashierId;
    this.customerId = customerId;
    this.date = new Date();
    this.subtotal = this.calculateSubtotal();
    this.tax = this.calculateTax();
    this.total = this.calculateTotal();
    this.status = 'pending'; // pending, completed, cancelled
    this.paymentStatus = 'pending'; // pending, paid
    this.paymentId = null;
  }

  calculateSubtotal() {
    return this.items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  calculateTax() {
    return this.calculateSubtotal() * 0.1; // 10% tax rate
  }

  calculateTotal() {
    return this.calculateSubtotal() + this.calculateTax();
  }

  addItem(item) {
    this.items.push(item);
    this.subtotal = this.calculateSubtotal();
    this.tax = this.calculateTax();
    this.total = this.calculateTotal();
  }

  removeItem(index) {
    if (index >= 0 && index < this.items.length) {
      this.items.splice(index, 1);
      this.subtotal = this.calculateSubtotal();
      this.tax = this.calculateTax();
      this.total = this.calculateTotal();
      return true;
    }
    return false;
  }

  complete(paymentId) {
    this.status = 'completed';
    this.paymentStatus = 'paid';
    this.paymentId = paymentId;
  }

  cancel() {
    this.status = 'cancelled';
  }
}

module.exports = Sale; 