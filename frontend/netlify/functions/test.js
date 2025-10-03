export async function handler(event, context) {
  console.log("HELLO FROM SERVERLESS!");
  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true })
  };
}