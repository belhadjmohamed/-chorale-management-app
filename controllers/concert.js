const Concert = require("../models/concert");


const SaveSeuilconcert = async (req, res) => {
  try {
    const idConcert = req.params.id;

    const { seuil } = req.body;
    if (seuil < 0) return res.status(500).json({ msg: "invalid seuil" });

    const concert = await Concert.findOneAndUpdate(
      { _id: idConcert },
      { $set: { seuil: seuil } },
      { new: true }
    );

    if (!concert) return res.status(500).json({ msg: "concert non existante" });

    return res.status(200).json({ concert });
  } catch (error) {
    return res.status(500).json({ msg: error.response });
  }
};


  

module.exports = {
  SaveSeuilconcert,
};
