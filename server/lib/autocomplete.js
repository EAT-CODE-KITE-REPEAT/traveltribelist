const autocomplete = async (req, res, sequelize) => {
  const { q } = req.query;

  if (q === "" || q === null || q === undefined) {
    res.json([]);
    return;
  }
  const [
    results,
  ] = await sequelize.query(
    `SELECT * FROM cities WHERE city LIKE :q OR country LIKE :q LIMIT 0,5`,
    { replacements: { q: `%${q}%` } }
  );

  res.json(results);
};

module.exports = {
  autocomplete,
};
