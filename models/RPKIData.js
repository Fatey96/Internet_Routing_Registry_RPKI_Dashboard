const mongoose = require('mongoose');

const rpkiDataSchema = new mongoose.Schema({
  ASN: { type: Number, required: true, index: true },
  prefix: { type: String, required: true },
  state: { type: String, required: true, index: true },
  validationStatus: { type: String, enum: ['Valid', 'Invalid', 'Unknown'], required: true }
}, { timestamps: true });

rpkiDataSchema.index({ ASN: 1, state: 1 }, { unique: false });

rpkiDataSchema.pre('save', function(next) {
  console.log(`Saving RPKI data for ASN: ${this.ASN}, State: ${this.state}`);
  next();
});

rpkiDataSchema.post('save', function(doc) {
  console.log(`RPKI data saved for ASN: ${doc.ASN}, State: ${doc.state}`);
});

rpkiDataSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    console.error('Error: Duplicate RPKI data entry', error);
    next(new Error('Duplicate RPKI data entry'));
  } else if (error) {
    console.error('Error saving RPKI data', error);
    next(error);
  } else {
    next();
  }
});

module.exports = mongoose.model('RPKIData', rpkiDataSchema);