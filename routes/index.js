var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

router.get('/', (req, res, next) => {
    res.render('index', {title: 'Express'});
})

module.exports = router;