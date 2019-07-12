const Joi = require('joi');
const helmet=require('helmet');
const express = require('express');
const app = express();
const logger=require('./logger');
const authenticate=require('./authenticate');
const morgan=require('morgan')
const config=require('config')
const startupDebuger=require('debug')('app:startup');
const dbDebuger=require('debug')('app:db');

app.use(express.json());
app.use(logger);
app.use(authenticate);
app.use(helmet());
app.use(morgan('tiny'))

console.log(`Node_ENV:${process.env.Node_ENV}`)

console.log('Application name:'+config.get('name'))
// console.log('Mail server:'+config.get('mail.host'))
// console.log('Mail server:'+config.get('mail.password'))

if(app.get('env')==='development'){
  console.log(`app:${app.get('env')}`)
  //console.log('Morgan enabled')
  startupDebuger('Morgan Enabled')
}
dbDebuger('dbConncted...')

const genres = [
  { id: 1, name: 'Action' },  
  { id: 2, name: 'Horror' },  
  { id: 3, name: 'Romance' },  
];
app.get('/api/genres', (req, res) => {
  res.send(genres);
});
app.post('/api/genres', (req, res) => {
  const { error } = validateGenre(req.body); 
  if (error) return res.status(400).send(error.details[0].message);
  const genre = {
    id: genres.length + 1,
    name: req.body.name
  };
  genres.push(genre);
  res.send(genre);
});

app.put('/api/genres/:id', (req, res) => {
  const genre = genres.find(c => c.id === parseInt(req.params.id));
  if (!genre) return res.status(404).send('The genre with the given ID was not found.');

  const { error } = validateGenre(req.body); 
  if (error) return res.status(400).send(error.details[0].message);
  
  genre.name = req.body.name; 
  res.send(genre);
});

app.delete('/api/genres/:id', (req, res) => {
  const genre = genres.find(c => c.id === parseInt(req.params.id));
  if (!genre) return res.status(404).send('The genre with the given ID was not found.');

  const index = genres.indexOf(genre);
  genres.splice(index, 1);

  res.send(genre);
});

app.get('/api/genres/:id', (req, res) => {
  const genre = genres.find(c => c.id === parseInt(req.params.id));
  if (!genre) return res.status(404).send('The genre with the given ID was not found.');
  res.send(genre);
});

function validateGenre(genre) {
  const schema = {
    name: Joi.string().min(3).required()
  };

  return Joi.validate(genre, schema);
}

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));