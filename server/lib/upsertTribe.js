const { Sequelize } = require("sequelize");
const { saveImageIfValid } = require("./util");

const upsertTribe = async (req, res, User, Tribe) => {
  const {
    loginToken,
    tribeId,
    type,
    target,
    city,
    country,
    bio,
    price,
    priceForWhat,
    name,
    slug,
    image,
  } = req.body;

  if (!loginToken) {
    return res.json({ response: "No login token given" });
  }

  const user = await User.findOne({ where: { loginToken } });

  if (!user) {
    return res.json({ response: "User not found" });
  }

  let tribe;

  if (tribeId) {
    tribe = await Tribe.findOne({ where: { id: tribeId } });
  }

  const already = await Tribe.findOne({
    where: {
      $and: Sequelize.where(
        Sequelize.fn("lower", Sequelize.col("slug")),
        Sequelize.fn("lower", slug)
      ),
    },
  });

  if (already) {
    res.json({ response: "This slug is already in use" });
    return;
  }

  const { pathImage, pathThumbnail, invalid } = saveImageIfValid(
    res,
    image,
    true
  );
  if (invalid) return;

  if (tribe) {
    //update

    const updateFields = {};

    if (name) updateFields.name = name;
    if (slug) updateFields.slug = slug;
    if (type) updateFields.type = type;
    if (target) updateFields.target = target;
    if (city) updateFields.city = city;
    if (country) updateFields.country = country;
    if (bio) updateFields.bio = bio;
    if (price) updateFields.price = price;
    if (priceForWhat) updateFields.priceForWhat = priceForWhat;

    Tribe.update(updateFields, { where: { id: tribe.id } });

    res.json({ response: "Updated" });
  } else {
    //create

    const { dataValues } = await Tribe.create({
      name,
      slug,
      type,
      target,
      city,
      country,
      bio,
      price,
      priceForWhat,
      image: pathImage,
      thumbnail: pathThumbnail,
    });

    res.json({ response: "Created" });
  }
};

module.exports = { upsertTribe };
