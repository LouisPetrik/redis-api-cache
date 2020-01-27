const express = require('express')
const app = express()
const redis = require('redis')
const bodyParser = require('body-parser')
const cors = require('cors')
const axios = require('axios')
const client = redis.createClient('redis://localhost:6379')

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html')
})

// both functions get the original number from the user input, and the res object
// from express, to make a redirect to another URL as params
const getResultFromCache = (number, res) => {
	client.get(number, (error, result) => {
		res.redirect('/done?result=' + result + '&from=cache')
	})
}

const getResultFromAPI = (number, res) => {
	axios
		.post('http://localhost:3000/', {
			number: number
		})
		.then(response => {
			let result = response.data.result
			// when receiving the result from API, original number from the user input and the result will be stored in the CACHE
			client.set(number, result)
			// the cache entry will be deleted after 60 sec, automatically
			client.expire(number, 60)
			res.redirect('/done?result=' + result + '&from=API')
		})
		.catch(error => {
			console.log(error)
		})
}

app.post('/', (req, res) => {
	let number = req.body.number
	// if the original number and the result are already stored, result will be true
	client.exists(number, (error, result) => {
		if (result) {
			getResultFromCache(number, res)
			// else we will make a request to the API
		} else {
			getResultFromAPI(number, res)
		}
	})
})

app.get('/done', (req, res) => {
	res.send(`
   <html>
      <head>
      </head>
      <body>
      The Result is: ${req.query.result}
      <br/>
      So the original value is ${req.query.result / 2}
      <br/>
      And comes from: ${req.query.from}
      </body>
   </html>
   `)
})

app.listen(8080)
