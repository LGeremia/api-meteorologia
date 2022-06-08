const SetupServer = require("../src/server");
const supertest = require("supertest");

beforeAll(()=>{
    const server = new SetupServer();
    server.init();
    global.testRequest = supertest(server.getApp())
})