const df = require('durable-functions');

module.exports = df.orchestrator(function* (context) {
  const {input} = context.bindings.context;
  context.log('Input', input);
  const items = yield context.df.callActivity('GetItems', input);
  context.log('items', items);

  if (items.length > 0) {
    for (let item of items) {
      yield context.df.callActivity('Hello', item);
    }
    context.df.continueAsNew({stamp: items[0].Modified, ...input});
  } else {
    context.log('No items, done');
  }
  return 'OK';
});