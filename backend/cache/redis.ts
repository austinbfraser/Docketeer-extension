import { RedisClientType, createClient } from 'redis';

//create redis client at port 6379
const redisClient: RedisClientType = createClient({
	url: 'redis://redis:6379',
	// url: 'redis://localhost:49258'
});

redisClient.on('error', err => console.log('Redis Client Error', err));

(async () => {
  await redisClient.connect();
})();

export default redisClient