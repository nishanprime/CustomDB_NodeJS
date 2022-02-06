const fs = require('fs');
const crypto = require('crypto');
class UserRepository {
  constructor(filename) {
    if (!filename) {
      throw new Error('Creating a repo requires a filename');
    }
    this.filename = filename;
    try {
      fs.accessSync(this.filename);
    } catch (error) {
      console.log('Files does not exist. Creating one');
      fs.writeFileSync(this.filename, '[]');
    }
  }

  async getAll() {
    //open the given file and read all of its contents and return the parsed data

    return JSON.parse(
      await fs.promises.readFile(this.filename, {
        encoding: 'utf8',
      })
    );
  }

  async create(attrs) {
    //assign unique random id
    attrs.id = this.randomId();
    //attrs is an object that has attributes related to the user
    const records = await this.getAll();
    records.push(attrs);
    //write the updated records array back to the this.filename
    //default encoding, which we can provide via options, is utf8
    await this.writeAll(records);
  }

  //method that will write to the database
  async writeAll(records) {
    await fs.promises.writeFile(
      this.filename,
      JSON.stringify(records, null, 2)
    );
  }

  //get record by id
  async getOne(id) {
    const records = await this.getAll();
    const record = records.find((record) => record.id === id);
    try {
      if (!record) {
        throw new Error(`No records available with given id`);
      }
      return record;
    } catch (error) {
      return { error: error.message };
    }
  }

  //delete record by id
  async delete(id) {
    const records = await this.getAll();
    const record = await this.getOne(id);
    if (record.error) {
      return await this.getOne(id);
    }
    const filteredRecords = records.filter((record) => record.id !== id);

    await this.writeAll(filteredRecords);
    return { message: 'Deleted' };
  }

  //update by id
  async update(id, attrs) {
    const records = await this.getAll();
    const record = records.find((record) => record.id === id);
    try {
      if (!record) {
        throw new Error(`Record with id: ${id} not found`);
      }
      Object.assign(record, attrs); //this method just put all the attrs in the record file, if the key already exists, it just replaces the value
      await this.writeAll(records);
      return { update: 'success' };
    } catch (error) {
      return { error: error.message };
    }
  }

  //get data by given attrs, as filers

  async getOneBy(filters) {
    const records = await this.getAll();
    for (let record of records) {
      let found = true;
      for (let key in filters) {
        if (record[key] !== filters[key]) {
          found = false;
        }
      }
      if (found) {
        return record;
      }
    }
  }

  //random id generation
  randomId() {
    return crypto.randomBytes(4).toString('hex');
  }
}

module.exports = new UserRepository('users.json');
