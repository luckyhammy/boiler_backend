const express = require('express');
const router = express.Router();
const cityController = require('../controllers/cityController');

router.get('/', cityController.getAllCities);
router.post('/', cityController.addCity);
router.patch('/:id', cityController.updateCity);
router.delete('/:id', cityController.deleteCity);

module.exports = router; 