const { Sequelize } = require("sequelize");
const md5 = require("md5");
const { saveImageIfValid } = require("./util");

const { isEmail } = require("./util");

const signup = async (req, res, User, Franchise) => {
  const { email, password, username, image } = req.body;

  if (!email) {
    res.json({ response: "Email is mandatory" });
    return;
  }

  if (!isEmail(email)) {
    console.log("email", email, "is not email");
    res.json({ response: "Incorrect email" });
    return;
  }

  if (!password || password.length < 6) {
    res.json({ response: "Password requires a minimum of 6 letters" });
    return;
  }

  const already = await User.findOne({
    where: {
      $and: Sequelize.where(
        Sequelize.fn("lower", Sequelize.col("email")),
        Sequelize.fn("lower", email)
      ),
    },
  });

  const usernameAlready = await User.findOne({
    where: {
      $and: Sequelize.where(
        Sequelize.fn("lower", Sequelize.col("username")),
        Sequelize.fn("lower", username)
      ),
    },
  });

  if (already) {
    res.json({ response: "This email is already in use" });
    return;
  }
  if (usernameAlready) {
    res.json({ response: "This username is already in use" });
    return;
  }

  const { pathImage, pathThumbnail, invalid } = saveImageIfValid(
    res,
    image,
    true
  );
  if (invalid) return;

  const { dataValues } = await User.create({
    username,
    email,
    image: pathImage,
    thumbnail: pathThumbnail,
    password: md5(password),
    loginToken:
      "token" + Math.round(Math.random() * Number.MAX_SAFE_INTEGER).toString(),
  });

  res.json({
    loginToken: dataValues.loginToken,
    response: `You're logged in on ${dataValues.email}`,
  });
};

module.exports = { signup };
