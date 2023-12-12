import fastify from "fastify";

const app = fastify();

app.get("/hello", () => {
  return "Hello World !! Fastify";
});

app.listen({ port: 3333 }).then(() => {
  console.log("RODANDO NA PORTA", 3333);
});
