class Payment {
  constructor(id, saleId, amount, method, cashierId) {
    this.id = id;
    this.saleId = saleId;
    this.amount = amount;
    this.method = method; // cash, credit_card, debit_card, etc.
    this.cashierId = cashierId;
    this.date = new Date();
    this.status = 'completed';
    this.changeAmount = 0;
    this.transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  calculateChange(amountTendered) {
    if (amountTendered > this.amount) {
      this.changeAmount = amountTendered - this.amount;
    }
    return this.changeAmount;
  }

  void() {
    this.status = 'voided';
  }

  refund() {
    this.status = 'refunded';
  }
}

module.exports = Payment; 