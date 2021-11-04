const mongoose = require("mongoose")

if (process.argv.length < 3) {
  console.log("Please provide the password as an argument: ")
  process.exit(1);
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url = 'mongodb+srv://fullstack:${password}@cluster0.gw0p4.mongodb.net/persons?retryWrites=true&w=majority'

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

const noteSchema = new mongoose.Schema({
  name: String,
  id: Number,
  number: String,
})

const generatedId = () => {
  return Math.floor(Math.random() * 1000000);
}

const Person = mongoose.model("Person", noteSchema);

if (process.argv.length === 3) {
  Person.find({}).then((result) => {
    console.log('Puhelinluettelo: ')
    result.forEach((person) => {
      console.log(person.name, person.number)
    })
    mongoose.connection.close()
  });
} else {
  const person = new Person({
    name: name,
    id: generatedId(),
    number: number,
  });

  person.save().then((result) => {
    console.log('Lisätty ${name} numero ${number} to puhelinluetteloon')

    mongoose.connection.close()
  });
}