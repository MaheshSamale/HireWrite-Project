const fs = require('fs');
const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const jwt =require('jsonwebtoken')
const config = require('../utils/config')

const pool = require('../utils/db');
const result = require('../utils/result');

const router = express.Router();
const saltRounds = 10;



