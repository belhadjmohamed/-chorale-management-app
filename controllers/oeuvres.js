const Oeuvre = require("../models/oueuvre");


const ajout = async (req, res) => {
  try {
    const oeuvre = new Oeuvre(req.body);
    await oeuvre.save();
    res.status(201).send(oeuvre);
  } catch (error) {
    res.status(400).send(error);
  }
};

const getoeuvre = async (req, res) => {
  try {
    const oeuvres = await Oeuvre.find();
    res.send(oeuvres);
  } catch (error) {
    res.status(500).send(error);
  }
};

const getoeuvrebyId = async (req, res) => {
  try {
    const oeuvre = await Oeuvre.findById(req.params.id);
    if (!oeuvre) {
      return res.status(404).send();
    }
    res.send(oeuvre);
  } catch (error) {
    res.status(500).send(error);
  }
};

const updateoeuvre = async (req, res) => {
  try {
    const oeuvre = await Oeuvre.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!oeuvre) {
      return res.status(404).send();
    }
    res.send(oeuvre);
  } catch (error) {
    res.status(400).send(error);
  }
};

const deleteoeuvre = async (req, res) => {
  try {
    const oeuvre = await Oeuvre.findByIdAndDelete(req.params.id);
    if (!oeuvre) {
      return res.status(404).send();
    }
    res.send(oeuvre);
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports = {
  ajout,
  getoeuvre,
  getoeuvrebyId,
  deleteoeuvre,
  updateoeuvre,
};
