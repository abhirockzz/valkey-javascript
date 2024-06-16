import redis from 'redis';

const client = redis.createClient();
const channelName = 'valkey-channel';

(async () => {
  try {
    await client.connect();
    console.log('Connected to Redis server');

    await client.subscribe(channelName, (message, channel) => {
      console.log(`message "${message}" received from channel "${channel}"`)
    });

    console.log('Waiting for messages...');
  } catch (err) {
    console.error('Error:', err);
  }
})();