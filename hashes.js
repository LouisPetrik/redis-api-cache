const express = require('express')
const redis = require('redis')
const redisURL = 'redis://localhost:6379'
const client = redis.createClient(redisURL)

client.hset('spanish', 'red', 'rojo')
client.hget('spanish', 'red', (error, value) => {
	console.log(value)
})
