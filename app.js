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

app.post('/', (req, res) => {
	let number = req.body.number
	client.exists(number, (error, value) => {
		if (value) {
			client.get(number, (error, value) => {
				res.redirect('/done?value=' + value + '&from=cache')
			})
		} else {
			axios
				.post('http://localhost:3000/', {
					number: number
				})
				.then(function(response) {
					let result = response.data.value
					client.set(number, result)
					client.expire(number, 60)
					res.redirect('/done?value=' + result + '&from=API')
				})
				.catch(function(error) {
					console.log(error)
				})
		}
	})
})

app.get('/done', (req, res) => {
	res.send(`
   <html>
      <head>
      </head>
      <body>
      The Result is: ${req.query.value}
      <br/>
      So the original value is ${req.query.value / 2}
      <br/>
      And comes from: ${req.query.from}
      </body>
   </html>
   `)
})

app.listen(8080)
