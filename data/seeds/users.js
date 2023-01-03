exports.seed = function (knex) {
  return knex('users').insert({
    username: 'brian',
    password: '$2a$10$dFwWjD8hi8K2I9/Y65MWi.WU0qn9eAVaiBoRSShTvuJVGw8XpsCiq', // password "1234"
  })
};
