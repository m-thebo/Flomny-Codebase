class Amenity {
  constructor(id, name, description, icon, type = 'hotel') {
    this.id = id;
    this.name = name;
    this.description = description;
    this.icon = icon; // icon name or URL
    this.type = type; // 'hotel' or 'room'
  }
}

module.exports = Amenity; 