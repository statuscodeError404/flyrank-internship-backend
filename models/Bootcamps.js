const mongoose = require('mongoose');
const { default: slugify } = require('slugify');



const BootcampSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  slug: String,
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  website: {
    type: String,
    match: [
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
      'Please enter a valid URL'
    ]
  },
  phone: {
    type: String,
    maxlength: [20, 'Phone number cannot be longer than 20 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please enter a valid email address'
    ]
  },
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: false
    },
    coordinates: {
      type: [Number],
      required: false,
      index: '2dsphere'
    },
    formattedAddress: String,
    street: String,
    city: String,
    state: String,
    zipcode: String,
    country: String
  },
  careers: {
    type: [String],
    required: true,
    enum: [
      "Software Engineer",
      "Data Scientist",
      "Product Manager",
      "UX/UI Designer",
      "Project Manager",
      "Marketing Specialist",
      "Sales Representative",
      "Web Development",
      "Mobile Development",
      "UI/UX",
      "Data Science",
      "Business",
      "Other"
    ]
  
  },
  averageRating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [10, 'Rating cannot be more than 10']
  },
  averageCost: Number,
  photo: {
    type: String,
    default: 'no-photo.jpg'
  },
  housing: {
    type: Boolean,
    default: false
  },
  jobAssistance: {
    type: Boolean,
    default: false
  },
  jobGuarantee: {
    type: Boolean,
    default: false
  },
  acceptGi: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

BootcampSchema.set('toJSON', { virtuals: true });
BootcampSchema.set('toObject', { virtuals: true });

// Create bootcamp slug from the name
BootcampSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

// // Cascade delete course when a bootcamp is deleted

BootcampSchema.pre('remove', async function (next) {
  const Course = this.model('Course'); 
  console.log(`Courses being removed from bootcamp ${this._id}`);
  await Course.deleteMany({ bootcamp: this._id });
  next();
});

// Reverse populate with virtuals
BootcampSchema.virtual('courses',{
  ref: 'Course',
  localField: '_id',
  foreignField: 'bootcamp',
  justOne: false
});


module.exports = mongoose.model('Bootcamp', BootcampSchema);