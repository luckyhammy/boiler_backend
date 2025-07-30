const City = require('../models/City');

const getAllCities = async (req, res) => {
  try {
    const cities = await City.find();
    res.json(cities);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const addCity = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'City name is required' });
    const city = new City({ name });
    await city.save();
    res.status(201).json(city);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const updateCity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'City name is required' });
    const city = await City.findByIdAndUpdate(id, { name }, { new: true });
    if (!city) return res.status(404).json({ message: 'City not found' });
    res.json(city);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const deleteCity = async (req, res) => {
  try {
    const { id } = req.params;
    const city = await City.findByIdAndDelete(id);
    if (!city) return res.status(404).json({ message: 'City not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { getAllCities, addCity, updateCity, deleteCity }; 