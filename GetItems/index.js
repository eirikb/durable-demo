module.exports = async function (context, input) {
  context.log('Get items', input);
  if (!input.stamp) {
    return [{Id: 1, Modified: new Date().toISOString()}];
  }
  return [];
};