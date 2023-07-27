#!/usr/local/bin/node

/**
 * 3.12: Command-line database
 * Create a cloud-based MongoDB database for the phonebook application with MongoDB Atlas.
 * 
 * Create a mongo.js file in the project directory, that can be used for: 
 * - Adding entries to the phonebook
 * - Listing all of the existing entries in the phonebook.
 * 
 * NB: Do not include the password in the file that you commit and push to GitHub!
 * 
 * The application should work as follows. You use the program by passing three command-line arguments (the first is the password)
 * 
 */

const mongoose = require('mongoose');
const args = process.argv;

if (args.length !== 3 && args.length !== 5) {
    console.log(`Usage: ./mongo.js <password> [<NAME> <NUMBER>] `)
    process.exit(1);
}

const url = `mongodb+srv://dbebah:${args[2]}@cluster0.ovzghlj.mongodb.net/phonebookApp?retryWrites=true&w=majority`;
const personSchema = new mongoose.Schema({
    name: String,
    number: String
});

mongoose.set('strictQuery',false);
mongoose.connect(url);

const Person = mongoose.model('Person', personSchema);

if (args.length === 3) {
    Person
        .find({})
        .then(results => {
            console.log(`Phonebook:`);
            results.forEach(person => {
                console.log(person);
            });
            
            mongoose.connection.close();
        });
} else {
    const name = args[3];
    const number = args[4];
    const newPerson = new Person({
        name: name,
        number: number
    });

    newPerson
        .save()
        .then(_ => {
            console.log(`added "${name}" number ${number} to phonebook`);
            mongoose.connection.close();
        });
}