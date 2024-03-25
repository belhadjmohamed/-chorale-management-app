const Pupitre = require("../models/pupitre");
const Concert = require("../models/concert");
const Oeuvre = require("../models/oueuvre");



const getListeChoristesPresProgRep = async (req, res) => {
  try {
    const { Type_voix } = req.body;

    const pupitre = await Pupitre.findOne({ type_voix: Type_voix }).populate(
      "membres"
    );

    const membres = pupitre.membres;
    console.log(membres);
    const membreChoriste = membres.filter(
      (membre) => membre.role === "choriste"
    );
    console.log(membreChoriste);
    
    const populatedMembres = await Concert.populate(membreChoriste, {
      path: "Concerts.Concert",
    });

    populatedMembresProgramme = await Oeuvre.populate(populatedMembres, {
      path: "Concerts.Concert.programme",
    });

    const result = populatedMembresProgramme.map((item) => ({
      nom: item.nom,
      prenom: item.prenom,
      email: item.email,
      Concerts: item.Concerts.map((concert) => ({
        id_concert: concert._id,
        programme: concert.Concert.programme,
        presence: concert.presence,
      })),
      Repetitions: item.Repetitions.map((repetition) => ({
        repetion: repetition.repetition,
        presence: repetition.presence,
      })),
      role: item.role,
    }));

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getChoristesseuilpres = async (req, res) => {

  try {
    const { Type_voix } = req.body;

    const pupitre = await Pupitre.findOne({ type_voix: Type_voix }).populate(
      "membres"
    );

    const membres = pupitre.membres;

    const membreChoriste = membres.filter(
      (membre) => membre.role === "choriste"
    );

    
    const populatedMembres = await Concert.populate(membreChoriste, {
      path: "Concerts.Concert",
    });

    let userfinale = [];

    for (let user of populatedMembres) {
      for (let concert of user.Concerts) {
        if (concert.Concert._id.toString() === req.params.id) {
          const repetitions = concert.Concert.repetitions;
          let repetitionsconcert = [];
          for (let repetitionsuser of user.Repetitions) {
            if (repetitions.includes(repetitionsuser.repetition)) {
              repetitionsconcert.push(repetitionsuser);
            }
          }
          const totalerepetitions = repetitionsconcert.length;
          let presencerepetitions = 0;
          for (let rep of repetitionsconcert) {
            if (rep.presence === true) {
              presencerepetitions = presencerepetitions + 1;
            }
          }
          const tauxpresence = (presencerepetitions / totalerepetitions) * 100;
          console.log(tauxpresence);
          if (
            tauxpresence >= concert.Concert.seuil &&
            concert.disponibilite === true
          ) {
            let userfinal = { ...user.toObject() };
            userfinal.tauxpresence = tauxpresence;
            const msg = {
              msg: `l'utilisateur ${user.nom} va etre present dans le concert ${concert.Concert._id} avec un taux de presence de ${tauxpresence}`,
              tauxpresence: tauxpresence,
            };
            userfinale.push(msg);
          }
        }
      }
    }
    userfinale.sort((a, b) => b.tauxpresence - a.tauxpresence);

    if (userfinale.length === 0) {
      return res.status(200).json({ msg: "Empty list" });
    } else {
      return res.status(200).json({ userfinale });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


module.exports = {
  getChoristesseuilpres,
  getListeChoristesPresProgRep,
};
