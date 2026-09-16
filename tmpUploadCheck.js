const Operation = require('./backend/models/Operation');
Operation.insertMany = async (data) => {
  console.log('INSERT_COUNT', data.length);
  return data;
};

const controller = require('./backend/controllers/uploadController');
const req = {
  file: {
    originalname: 'sample.csv',
    buffer: Buffer.from(
      'Date,Team,Location,Orders,Load,Efficiency,Performance\n' +
      '2024-01-01,Sales,North,120,82,88,96\n' +
      '2024-01-02,Operations,South,140,75,91,94\n'
    )
  }
};

const res = {
  status(code) {
    this.code = code;
    return this;
  },
  json(payload) {
    console.log(JSON.stringify({ code: this.code, payload }, null, 2));
  }
};

const next = (err) => {
  console.error('NEXT_ERR', err && err.message);
  process.exitCode = 1;
};

controller.uploadData(req, res, next)
  .then(() => console.log('DONE'))
  .catch((e) => {
    console.error('UNCAUGHT', e);
    process.exitCode = 1;
  });
