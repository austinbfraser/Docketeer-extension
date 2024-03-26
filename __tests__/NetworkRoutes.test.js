/**
 * @jest-environment node
 */

import request from 'supertest';
import response from 'supertest';
import express from 'express';
import { describe, beforeEach, expect, test, jest } from '@jest/globals';

const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
// TODO:fix the router, update the names. api router and commande router only exist in the old version 
// import apiRouter from '../server/routes/apiRouter';
// import commandRouter from '../server/routes/commandRouter';

import networkRouter from '../backend/routers/docker/networkRouter';

app.use('/gapi', apiRouter);
app.use('/api', apiRouter);
app.use('/command', commandRouter);

app.use('/network', networkRouter);

xdescribe('/command/networkContainers', () => {
  test('Get networkContainers', async () => {
    const res = await request(app)
      .get('/command/networkContainers');
    expect(res.status).toBe(200)
    expect(res.body).toBeInstanceOf(Array)
    res.body.forEach(network => {
      expect(network.Name).toBeDefined()
    })
  });
})

describe('/network/', () => {
  test('Get a list of networks running on Docker', async () => {
    const res = await request(app)
      .get('/network/');
    expect(res.status).toBe(200)
    expect(res.body).toBeInstanceOf(Array)
    res.body.forEach(network => {
      expect(network.Name).toBeDefined()
    })
  });
})

xdescribe('/command/networkListContainers', () => {
  test('Get networkListContainers', async () => {
    const res = await request(app).get('/command/networkListContainers');
    expect(res.status).toBe(200)
    expect(res.body).toBeInstanceOf(Array)
    res.body.forEach(network => {
      expect(network.networkName).toBeDefined()
      expect(network.containers).toBeDefined()
    })
  })
})

describe('/network/container', () => {
  test('Get a list of networks with the containers they are attached to', async () => {
    const res = await request(app).get('/network/container');
    expect(res.status).toBe(200)
    expect(res.body).toBeInstanceOf(Array)
    res.body.forEach(network => {
      expect(network.networkName).toBeDefined()
      expect(network.containers).toBeDefined()
    })
  })
})

xdescribe('/command/networkCreate', () => {

  beforeAll(async () => {
    await request(app)
      .post('/command/networkCreate')
      .send({
        networkName: "test2",
      })
  })

  afterAll(async () => {
  await request(app)
      .post('/command/networkRemove')
      .send({
        networkName: "test1",
      })
  await request(app)
      .post('/command/networkRemove')
      .send({
        networkName: "test2",
      })
});

  test('networkCreate with a valid name', async () => {
    const res = await request(app)
      .post('/command/networkCreate')
      .send({
        networkName: "test1",
      })
    expect(res.status).toBe(200)
    expect(res.body.hash).toBeDefined()
  });

  test('networkCreate duplicate', async () => {
    const res = await request(app)
      .post('/command/networkCreate')
      .send({
        networkName: "test2",
      })
    expect(res.status).toBe(200)
    expect(res.body.hash).not.toBeDefined()
    expect(res.body.error).toBeDefined()
  });
  
  test('networkCreate with an invalid name', async () => {
    const res = await request(app)
      .post('/command/networkCreate')
      .send({
        networkName: "#test",
      })
    expect(res.status).toBe(200)
    expect(res.body.hash).not.toBeDefined()
    expect(res.body.error).toBeDefined()
  });
})

describe('/network/', () => {

  beforeAll(async () => {
    await request(app)
      .post('/network/')
      .send({
        networkName: "test2",
      })
  })

  afterAll(async () => {
  await request(app)
      .delete('/network/test1')
  await request(app)
      .delete('/network/test2')
  })

  test('create network with a valid name', async () => {
    const res = await request(app)
      .post('/network/')
      .send({
        networkName: "test1",
      })
    expect(res.status).toBe(201)
    expect(res.body.hash).toBeDefined()
  });

  test('create an invalid duplicate network', async () => {
    const res = await request(app)
      .post('/network/')
      .send({
        networkName: "test2",
      })
    expect(res.status).toBe(500)
    expect(res.body.hash).not.toBeDefined()
    //TODO: Error property is not what we are expecting: 'error message in server: { err: 'networkController.createNetwork error' }'
    expect(res.error).toBeDefined();
  });
  
  test('create a network with an invalid name', async () => {
    const res = await request(app)
      .post('/network/')
      .send({
        networkName: "#test",
      })
    expect(res.status).toBe(500)
    expect(res.body.hash).not.toBeDefined()
    expect(res.error).toBeDefined()
  });
})

xdescribe('/command/networkRemove', () => {

  beforeAll(async () => {
    await request(app)
      .post('/command/networkCreate')
      .send({
        networkName: "test3",
      })
  });

  test('networkRemove', async () => {
    const res = await request(app)
      .post('/command/networkRemove')
      .send({
        networkName: "test3",
      })
    expect(res.status).toBe(200)
    expect(res.body.hash).toBeDefined()
  });

  test('networkRemove duplicate', async () => {
    const res = await request(app)
      .post('/command/networkRemove')
      .send({
        networkName: "test3",
      })
    expect(res.status).toBe(200)
    expect(res.body.hash).not.toBeDefined()
    expect(res.body.error).toBeDefined()
  });
})

describe('/network/', () => {

  beforeAll(async () => {
    await request(app)
      .post('/network/')
      .send({
        networkName: "test3",
      })
  });

  test('deleting a network', async () => {
    const res = await request(app)
      .delete('/network/test3')
    expect(res.status).toBe(200)
    expect(res.body.hash).toBeDefined()
  });

  test('deleting a non-existant network returns error', async () => {
    const res = await request(app)
      .delete('/network/test3')
    expect(res.status).toBe(500)
    expect(res.body.hash).not.toBeDefined()
    expect(res.error).toBeDefined()
  });
})


xdescribe('/command/networkConnect', () => {

  beforeAll(async () => {
    await request(app)
      .post('/command/networkCreate')
      .send({
        networkName: "test4",
      })
    
    // await request(app)
    //   .post('/command/runImage')
    //   .send({
    //     reps: "nginx",
    //     tag: "latest"
    //   })
  });

  afterAll(async () => {
    await request(app)
      .post('/command/networkDisconnect')
      .send({
        networkName: "test4",
        containerName: "docketeerdb"
      })
    
    await request(app)
      .post('/command/networkRemove')
      .send({
        networkName: "test4",
      })
    
  });

  test('networkConnect', async () => {
    const res = await request(app)
      .post('/command/networkConnect')
      .send({
        networkName: "test4",
        containerName: "docketeerdb"
        
      })
    expect(res.status).toBe(200)
    expect(res.body.hash).toBeDefined()
    expect(res.body.error).not.toBeDefined()
  });

  test('networkConnect duplicate', async () => {
    const res = await request(app)
      .post('/command/networkConnect')
      .send({
        networkName: "test4",
        containerName: "docketeerdb"

      })
    expect(res.status).toBe(200)
    expect(res.body.hash).not.toBeDefined()
    expect(res.body.error).toBeDefined()
  });
})

describe('/network/container', () => {

  beforeAll(async () => {
    await request(app)
      .post('/network/')
      .send({
        networkName: "test4",
      })
    
    // await request(app)
    //   .post('/command/runImage')
    //   .send({
    //     reps: "nginx",
    //     tag: "latest"
    //   })
  });

  afterAll(async () => {
    await request(app)
      // .delete('/network/removeContainer/?name=gabyTest')
      .delete('/network/removeContainer/?networkName=test4&containerName=docketeer-ext')
      // .delete('/network/removeContainer/?networkName=test4')
      // .send({
      //   networkName: "test4",
      //   containerName: "docketeerdb"
      // })
    
    await request(app)
      .delete('/network/test4')
  });

  test('connecting container to the network', async () => {
    const res = await request(app)
      .post('/network/container')
      .send({
        networkName: "test4",
        containerName: "docketeer-ext"
        
      })
    expect(res.status).toBe(201)
    // expect(res.body.hash).toBeDefined()
    // expect(res.body.error).not.toBeDefined()
  });

  test('connecting duplicate network to duplicate container', async () => {
    const res = await request(app)
      .post('/network/container')
      .send({
        networkName: "test4",
        containerName: "docketeer-ext"

      })
    expect(res.status).toBe(500)
    // expect(res.body.hash).not.toBeDefined()
    expect(res.error).toBeDefined()
  });
})


xdescribe('/command/networkDisconnect', () => {

  beforeAll(async () => {
    await request(app)
      .post('/command/networkCreate')
      .send({
        networkName: "test5",
      })

    await request(app)
      .post('/command/networkConnect')
      .send({
        networkName: "test5",
        containerName: "docketeerdb"
      })
  });

  afterAll(async () => {
    await request(app)
      .post('/command/networkRemove')
      .send({
        networkName: "test5",
      })
  });

  test('networkDisconnect', async () => {

    const res = await request(app)
      .post('/command/networkDisconnect')
      .send({
        networkName: "test5",
        containerName: "docketeerdb"

      })
    expect(res.status).toBe(200)
    expect(res.body.hash).toBeDefined()
    expect(res.body.error).not.toBeDefined()
  });

  test('networkDisconnect duplicate', async () => {
    const res = await request(app)
      .post('/command/networkDisconnect')
      .send({
        networkName: "test5",
        containerName: "docketeerdb"

      })
    expect(res.status).toBe(200)
    expect(res.body.hash).not.toBeDefined()
    expect(res.body.error).toBeDefined()
  });
})

describe('/network/container', () => {

  beforeAll(async () => {
    await request(app)
      .post('/network')
      .send({
        networkName: "test5",
      })

    await request(app)
      .post('/network/container')
      .send({
        networkName: "test5",
        containerName: "docketeer-ext"
      })
  });

  afterAll(async () => {
    await request(app)
      .delete('/network/test5')
      // .send({
      //   networkName: "test5",
      // })
  });

  test('disconnect network from container', async () => {

    const res = await request(app)
      .delete('/network/removeContainer/?networkName=test5&containerName=docketeer-ext')
      // .send({
      //   networkName: "test5",
      //   containerName: "docketeer-ext"

      // })
    expect(res.status).toBe(204)
  });

  test('disconnecting non-existent network from container', async () => {
    const res = await request(app)
      .post('/network/container')
      .send({
        networkName: "test5",
        containerName: "docketeerdb"

      })
    expect(res.status).toBe(500)
  });
})



