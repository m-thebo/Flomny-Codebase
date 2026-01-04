class Product {
  constructor(id, name, description, price, stock, category, barcode = null, cost = 0) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.stock = stock;
    this.category = category;
    this.barcode = barcode;
    this.cost = cost;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  updateStock(quantity) {
    this.stock += quantity;
    this.updatedAt = new Date();
    return this.stock;
  }

  updatePrice(newPrice) {
    this.price = newPrice;
    this.updatedAt = new Date();
    return this.price;
  }
}

module.exports = Product; 