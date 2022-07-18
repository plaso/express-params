require('dotenv').config()
console.log(process.env.MI_SUPER_SECRETO)

const express = require('express')
const PunkAPIWrapper = require('punkapi-javascript-wrapper')

const punkAPI = new PunkAPIWrapper({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET
})

const app = express()

app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))

app.set('views', __dirname + '/views')
app.set('view engine', 'hbs')

app.use((req, res, next) => {
  console.log('mi super middleware')
  req.patata = 'hola'

  next()
})

app.get('/', (req, res, next) => {
  console.log(req.patata)
  res.render('index')
})

app.get('/beers', (req, res, next) => {
  console.log(req.query)
  const { name } = req.query

  const options = {}

  if (name) {
    options.beer_name = name
  }


  punkAPI.getBeers(options)
    .then(beers => {
      // console.log(beers[0]) // para verlo en consola


      res.render('beers', { beers })
    })
})

app.get('/beers/new', (req, res, next) => {
  res.render('newBeer')
})

app.get('/beers/:id', async (req, res, next) => {
  const { id } = req.params
  // const id = req.params.id

  console.log(id)

  try {
    const beers = await punkAPI.getBeer(id)

    if (beers && beers.statusCode === 400) {
      throw Error('Not found')
    }
  
    console.log(beers)

    res.render('beerDetail', { beer: beers[0] })
  } catch(err) {
    next(err)
  }
})

app.post('/beers', (req, res, next) => {
  console.log(req.body)
  const { name, description } = req.body

  res.render('createdBeer', { name, description })
})

app.use((err, req, res, next) => {
  console.log('entra por el middleware de error')

  res.send(err)
})

app.listen(3000, () => console.log('Listening on port 3000'))