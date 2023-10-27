const bcrypt = require("bcryptjs");
class HashService {
  /**
   *
   * @param {any} data data can be anything
   * @param {Number} slat slat is be number
   * @returns it will return hashed data
   */
  async hash(data, slat = 10) {
    try {
      const hashSlat = await bcrypt.genSaltSync(slat)
      return await bcrypt.hashSync(data, hashSlat);
    } catch (error) {
      console.log("hash error: ", error);
    }
  }

  /**
   *
   * @param {String} newData enter new data which you want to compare
   * @param {Number} hashedData enter hashed data which you want to compare with
   * @returns {Boolean} it will return boolean true or false
   */
  async compare(newData, hashedData) {
    try {
      return await bcrypt.compare(newData, hashedData);
    } catch (error) {
      console.log("hash error: ", error);
    }
  }
}

module.exports = new HashService();
