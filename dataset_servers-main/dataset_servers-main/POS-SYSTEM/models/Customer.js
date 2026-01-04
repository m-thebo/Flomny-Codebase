class Customer {
  constructor(id, name, email = null, phone = null, address = null) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.address = address;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.totalPurchases = 0;
    this.purchaseHistory = [];
  }

  addPurchase(saleId, total) {
    this.purchaseHistory.push({
      saleId,
      date: new Date(),
      total
    });
    this.totalPurchases += total;
    this.updatedAt = new Date();
  }

  update(data) {
    if (data.name) this.name = data.name;
    if (data.email) this.email = data.email;
    if (data.phone) this.phone = data.phone;
    if (data.address) this.address = data.address;
    this.updatedAt = new Date();
  }
}

module.exports = Customer; 