const express = require('express');
const crypto = require('crypto');
// 3.7: Add morgan for logging middleware
const morgan = require('morgan');

const app = express();
/**
 * CORS are needed in case we are acessing information from another origin
 * In this case it would be from http://localhost:3000 to http://localhost:3001: Requesting the persons
 * This due to the service inside frontend using a relative path: '/api/persons'
 * which would make te requests directly to http://localhost:3000 with the full path it wuld have been 'localhost:3001/api/persons' instead of "/api/persons"
 * But since we are proxying the front to have the requests made from there as if it was rom http://localhost:3001 then
 * It probably wont be used this time
 */
const cors = require('cors');

const unknownEndpoint = (_, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

/**
 * 3.16: Phonebook database, step4
 * Move the error handling of the application to a new error handler middleware.
 */

const errorHandlerMiddleWare = function (error, request, response, next) {
  console.log(error);

  if (error.name === 'CastError') return response.status(400).end();
  if (error.name === 'ValidationError') return response.status(400).json({ error: error.message });

  next(error);
};

/**
 * 3.7: Phonebook backend step7
 * - Add the morgan middleware to your application for logging.
 * Configure it to log messages to your console based on the tiny configuration.
 * 3.8*: Phonebook backend step8
 * - Configure morgan so that it also shows the data sent in HTTP POST requests:
 */

morgan.token('dataSent', (req) => JSON.stringify(req.body));

/**
 * MiddleWares
 */

app.use(morgan((tokens, req, res) => [
  tokens.method(req, res),
  tokens.url(req, res),
  tokens.status(req, res),
  tokens.res(req, res, 'content-length'), '-',
  tokens['response-time'](req, res), 'ms',
  tokens.dataSent(req),
].join(' ')));

/**
 * 3.11 phonebook full stack
 * Generate a production build of your frontend, and add it to the internet application using the method introduced in this part.
 *
 * NB If you use Render, make sure the directory build is not gitignored
 * Also, make sure that the frontend still works locally (in development mode when started with command npm start).
 * If you have problems getting the app working make sure that your directory structure matches the example app.
 */
app.use(express.static('dist'));
app.use(express.json());

/**
 *
let persons = [
    {
      "id": 1,
      "name": "Arto Hellas",
      "number": "040-123456"
    },
    {
      "id": 2,
      "name": "Ada Lovelace",
      "number": "39-44-5323523"
    },
    {
      "id": 3,
      "name": "Dan Abramov",
      "number": "12-43-234345"
    },
    {
      "id": 4,
      "name": "Mary Poppendieck",
      "number": "39-23-6423122"
    }
];
 */

/**
 * 3.13: Phonebook database, step1
 *
 * Change the fetching of all phonebook entries so that the data is fetched from the database.
 * Verify that the frontend works after the changes have been made.
 *
 * In the following exercises, write all Mongoose-specific code into its own module
 * just like we did in the chapter Database configuration into its own module.
 */

const Persons = require('./models/person');

/**
 * Step 3.1
 * implement a Node application that returns a hardcoded list of phonebook entries from the address http://localhost:3001/api/persons.

app.get('/api/persons', (_, response) => {
    response.json(persons)
});
 */

app.get('/api/persons', (_, response, next) => {
  Persons
    .find({})
    .then((results) => {
      if (results) response.json(results);
      else response.status(404).end();
    })
    .catch((err) => next(err));
});

/**
 * Step 3.2
 * Implement a page at the address http://localhost:3001/info that looks roughly like this:

 * The page has to show the time that the request was received how many entries are in the phonebook at the time of processing the request.
 *
 * 3.18*: Phonebook database step6
 * Also update the handling of the api/persons/:id and info routes to use the database,
 * and verify that they work directly with the browser, Postman, or VS Code REST client.
 */

app.get('/info', (_, response, next) => {
  Persons
    .countDocuments({})
    .then((results) => {
      const res = `
                <p>Phonebook has info for ${results} people</br>${new Date()}</p>
            `;

      response.send(res);
    })
    .catch((err) => next(err));
});

/**
 * Step 3.3
 * Implement the functionality for displaying the information for a single phonebook entry.
 * The url for getting the data for a person with the id 5 should be http://localhost:3001/api/persons/5
 *
 * If an entry for the given id is not found, the server has to respond with the appropriate status code.
 */

app.get('/api/persons/:id', (request, response, next) => {
  const { id } = request.params;

  Persons
    .findById(id)
    .then((results) => {
      if (results) response.json(results);
      else response.status(404).end();
    })
    .catch((err) => next(err));
});

/**
 * 3.4: Phonebook backend step4
 * Implement functionality that makes it possible to delete a single phonebook entry by making an HTTP DELETE request to the unique URL of that phonebook entry.
 *
 * Test that your functionality works with either Postman or the Visual Studio Code REST client.
 *
 * 3.15: Phonebook database, step3
 * Change the backend so that deleting phonebook entries is reflected in the database.
 *
 * Verify that the frontend still works after making the changes.
 */

app.delete('/api/persons/:id', (request, response, next) => {
  const { id } = request.params;

  Persons
    .findByIdAndRemove(id)
    .then((result) => {
      console.log(result);
      response.status(204).end();
    })
    .catch((err) => next(err));
});

/**
 * Step 3.5
 * Expand the backend so that new phonebook entries can be added by making HTTP POST requests to the address
 * http://localhost:3001/api/persons.
 *
 * Generate a new id for the phonebook entry with the Math.random function.
 * Use a big enough range for your random values so that the likelihood of creating duplicate ids is small.
 * https://hackernoon.com/using-javascript-to-create-and-generate-uuids
 *
 * Step 3.6
 * Implement error handling for creating new entries. The request is not allowed to succeed, if:
 * ~ The name or number is missing
 * ~ The name already exists in the phonebook
 *
 * Respond to requests like these with the appropriate status code, and also send back information that explains the reason for the error, e.g.:
 *
 * function generateId() {
 * return crypto.randomUUID();
 * }
 */

app.post('/api/persons', (request, response, next) => {
  const { body } = request;
  const res = {
    name: body.name,
    number: body.number,
  };

  if (!res.name && !res.number) {
    const error = !res.name ? 'name' : 'number';
    return response.status(400).json({ error: `${error} property is missing` });
  }

  const person = new Persons(res);

  person
    .save()
    .then((result) => {
      response.json(result);
    })
    .catch((err) => next(err));
});

/**
 * 3.17*: Phonebook database, step5
 * If the user tries to create a new phonebook entry for a person whose name is already in the phonebook,
 * the frontend will try to update the phone number of the existing entry by making an HTTP PUT request to the entry's unique URL.
 *
 * Modify the backend to support this request.
 *
 * Verify that the frontend works after making your changes.
 */

app.put('/api/persons/:id', (request, response, next) => {
  const { body } = request;
  const { id } = request.params;

  const person = {
    name: body.name,
    number: body.number,
  };

  Persons
    .findByIdAndUpdate(id, person, { new: true, runValidators: true, context: 'query' })
    .then((updatedPerson) => {
      if (updatedPerson) response.status(200).json(updatedPerson);
      else response.status(404).end();
    })
    .catch((err) => next(err));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use(unknownEndpoint);
app.use(errorHandlerMiddleWare);
