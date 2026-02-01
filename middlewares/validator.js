const Joi = require('joi');

const todoSchema = Joi.object({
  task: Joi.string().min(3).required(),
  completed: Joi.boolean()
});

module.exports = { todoSchema };