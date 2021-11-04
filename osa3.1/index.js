require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const Person = require('./models/person')
const morgan = require('morgan')

// middlewaressit
// Middlewaret ovat funktioita, joiden avulla voidaan käsitellä request- ja response-olioita.
app.use(express.static('build'))
app.use(express.json())
//app.use(requestLogger)
app.use(cors())

// morgan
// loggausta tekevä middleware morgan
morgan.token("content", (req) => {
    return JSON.stringify(req.body);
  });
  
  app.use(
    morgan(
      ":method :url :status :res[content-length] - :response-time ms :content"
    )
  )
  
/*
const requestLogger = (request, response, next) => {
    console.log("Method:", request.method)
    console.log("Path:  ", request.path)
    console.log("Body:  ", request.body)
    console.log("---")
    next()
}
*/

// error handler
const errorHandler = (error, request, response, next) => {
    console.error(error.message);
  
    if (error.name === "CastError") {
      return response.status(400).send({ error: "malformatted id" });
    } else if (error.name === "ValidationError") {
      return response.status(406).json({ error: error.message });
    } else if (error.name === "BadRequest") {
      return response.status(400).json({ error: error.message });
    }
    next(error);
  }
  

// kaikki henkilöt
app.get("/api/persons", (request, response) => {
    Person.find({}).then((persons) => {
        response.json(persons)
    })
})

// poista henkilö
app.delete("/api/persons/:id", (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(() => {
            response.status(204).end()
        })
        .catch((error) => next(error))
})

// yksi henkilö
app.get("/api/persons/:id", (request, response, next) => {
    Person.findById(request.params.id)
        .then((person) => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch((error) => {
            console.log("VÄÄRÄ ID")
            next(error)
        })
})

// uusi henkilö
app.post("/api/persons", (request, response, next) => {
    const body = request.body

    if (body.name === undefined) {
        return response.status(400).json({ error: "sisältö puuttuu" })
    }

    const person = new Person({
        name: body.name,
        phone: body.phone,
    })

    person
        .save()
        .then((savedPerson) => savedPerson.toJSON())
        .then((savedAndFormattedPerson) => response.json(savedAndFormattedPerson))
        .catch((error) => next(error))
})

// päivitetään henkilö
app.put("/api/persons/:id", (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(request.params.id, person, {
        new: true,
        runValidators: true,
        context: "query",
    })
        .then((updatedPerson) => {
            if (updatedPerson === null) {
                return response.status(404).end()
            }
            response.json(updatedPerson)
        })
        .catch((error) => next(error))
})

// Info sivu
app.get("/info", (request, response) => {
    Person.find({}).then((persons) => {
        response.send(
            "Puhelinluettelossa " +
        persons.length +
        " henkilön tiedot" +
        "<br></br>" +
        new Date().toLocaleString("fi-FI", { timeZone: "Europe/Helsinki" })
        )
    })
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: "unknown endpoint" })
}

// olemattomien osoitteiden käsittely
app.use(unknownEndpoint)
// virheellisten pyyntöjen käsittely
app.use(errorHandler)

const PORT = process.env.PORT; 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
