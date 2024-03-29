﻿const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Theme = new Schema({
    name: String,
    video: String,
    username: String,
    description: String, //可随意添加字段
    classification: String,
    date: Date,
    price: Number
});

module.exports = mongoose.model('Theme', Theme)