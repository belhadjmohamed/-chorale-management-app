const Candidattest = require("../models/Candidattest");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");



const sentmail = (req, res) => {
  const { nom, prenom, email } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "cyrinemechmech11@gmail.com",
      pass: "psaz iedp yyxu fewu",
    },
    tls: {
      rejectUnauthorized: false, 
    },
  });

  jwt.sign(
    { nom: nom, prenom: prenom, email: email },
    process.env.ACCESSTOKENSECRET,
    { expiresIn: "365d" },
    async (err, token) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error creating token");
      }

      const confirmation = `http://localhost:5000/api/candidat/confirmation?token=${token}`;

      const mailOptions = {
        from: "cyrinemechmech11@gmail.com",
        to: email,
        subject: "email confirmationnnn",
        text: `Hello ${nom} ${prenom},\n\n your email is valid, press this link to register ${confirmation}.`,
      };

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Adresse e-mail non valide." });
      }

      try {
        const existingEmail = await Candidattest.findOne({ email });

        if (existingEmail) {
          return res.status(200).json({
            message:
              "Adresse e-mail valide mais existante dans la base de données.",
          });
        } else {
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error(error);
              return res.status(500).send("Error sending email");
            }
            res.cookie("token", token, {
              path: "/",
              maxAge: 24 * 30 * 60,
            });
            console.log("Email sent: " + info.response);
          });
          return res.status(200).json({
            message: "Adresse e-mail valide et mail sent successfully",
          });
        }
      } catch (error) {
        console.error(error);
        return res.status(500).json({
          message: "Erreur lors de la validation de l'adresse e-mail.",
        });
      }
    }
  );
};

const confirmation = (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ message: "Token not found in cookies." });
    }
    jwt.verify(
      token,
      process.env.ACCESSTOKENSECRET,
      {},
      async (err, decoded) => {
        if (err) throw err;
        const existingEmail = await Candidattest.findOne({
          email: decoded.email,
        });

        if (existingEmail) {
          return res.status(200).json({
            message:
              "Adresse e-mail valide et existante dans la base de données.",
          });
        }

        const newCandidat = new Candidattest({
          nom: decoded.nom,
          prenom: decoded.prenom,
          email: decoded.email,
        });

        newCandidat.save();
        res.status(200).json({
          message: "Email confirmed successfully. Nouvel utilisateur créé",
        });
      }
    );
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};
module.exports = {
  sentmail,
  confirmation,
};
