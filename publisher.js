import Redis from 'ioredis';

const redisClient = new Redis();
const channelName = 'valkey-channel';

const message = process.argv[2];

if (!message) {
  console.error('Please provide a message to publish.');
  process.exit(1);
}

async function publishMessage() {
  try {
    const receivedCount = await redisClient.publish(channelName, message);
    console.log(`Message "${message}" published to channel "${channelName}". Received by ${receivedCount} subscriber(s).`);
  } catch (err) {
    console.error('Error publishing message:', err);
  } finally {
    // Close the client connection
    await redisClient.quit();
  }
}

publishMessage();
