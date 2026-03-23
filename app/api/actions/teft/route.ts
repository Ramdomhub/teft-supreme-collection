import { NextRequest } from "next/server";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, Content-Encoding, Accept-Encoding",
};

// OPTIONS (CORS)
export async function OPTIONS() {
  return new Response(null, { headers });
}

// GET → Preview im Blink
export async function GET() {
  return Response.json(
    {
      title: "TEFT Supreme",
      description: "Inside X.",
      label: "Buy",
    },
    { headers }
  );
}

// POST → Dummy (kommt später)
export async function POST(req: NextRequest) {
  return Response.json(
    {
      message: "TEFT action placeholder",
    },
    { headers }
  );
}
