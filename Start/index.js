const df = require('durable-functions');

module.exports = async function (context, req) {
  const validationToken = req.query.validationtoken;
  if (validationToken) {
    context.log(`Validation token ${validationToken}`);
    return {
      headers: {'content-type': 'text/plain'},
      body: context.req.query.validationtoken,
    };
  }

  const {webUrl, listUrl} = req.query;
  if (!webUrl || !listUrl) return 'Missing webUrl or listUrl';

  const key = [webUrl, listUrl].join('_').replace(/[-_/]/gi, '');

  const client = df.getClient(context);
  const status = await client.getStatus(key);
  context.log('durable status for', key, 'is', status);

  if (status && status.runtimeStatus === 'Running') {
    const aliveSeconds = Math.floor((new Date() - new Date(status.createdTime)) / 1000);
    context.log(`Already running. ${aliveSeconds}s`);
    if (aliveSeconds > 360) {
      context.log(`${key}: 'Been alive for over 6 minutes - TERMINATING!`);
      await client.terminate(key, 'Forced timeout');
      context.log(`${key}: Terminated, starting new`);
      await client.startNew('Orchestrator', key, {webUrl, listUrl});
      return `${key}: Terminate + Start new`;
    } else {
      return `${key}: Already running (${360 - aliveSeconds}s until terminate)`;
    }
  } else {
    context.log(`${key}: Create / Start new`);
    await client.startNew('Orchestrator', key, {webUrl, listUrl});
    return `${key}: Start new`;
  }
};
