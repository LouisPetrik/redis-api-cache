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
	client.exists(req.body.number, (error, value) => {
		if (value) {
			console.log('vorhanden')
			client.get(req.body.number, (error, value) => {
				res.redirect('/done?value=' + value + '&from=cache')
			})
		} else {
			axios
				.post('http://localhost:3000/', {
					number: req.body.number
				})
				.then(function(response) {
					client.set(req.body.number, response.data.value)
					client.expire(req.body.number, 60)
					res.redirect(
						'/done?value=' +
							response.data.value +
							'&from=' +
							response.data.from
					)
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
      The value is: ${req.query.value}
      <br/>
      And comes from: ${req.query.from}
      </body>
   </html>
   `)
})

app.listen(8080)
/*

// key hi für wert there speichern
client.set('hi', 'there')

// den key nach 10 sekunden expiren, also löschen lassen:
client.expire('hi', 10)

// ausgeben, wie lange der key noch vorhanden sein wird. Minus bedeutet, ist bereits gelöscht
client.ttl('hi', (error, value) => {
	console.log(value)
})

// wenn key existiert, wird 1, ansonsten 0 ausgegeben
client.exists('hi', (error, value) => {
	if (value) {
		console.log('vorhanden')
	} else {
		console.log('nicht vorhanden')
	}
})

// wert ausgeben, der zu dem key "hi" gehört, falls keiner besteht wird null ausgegeben
client.get('hi', (error, value) => {
	console.log(value)
})

// key mit zugehörigem wert permanent löschen:
client.del('hi')

*/
