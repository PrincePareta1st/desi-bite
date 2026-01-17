import { neon } from '@neondatabase/serverless';

export default async (req, context) => {
    const sql = neon(process.env.DATABASE_URL);
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS"
    };

    if (req.method === "OPTIONS") return new Response("OK", { headers });

    try {
        const url = new URL(req.url);

        // GET Products
        if (req.method === "GET") {
            const rows = await sql`SELECT * FROM products ORDER BY id DESC`;
            return new Response(JSON.stringify(rows), { headers: { ...headers, "Content-Type": "application/json" } });
        }

        // POST Add Product (With Preferences)
        if (req.method === "POST") {
            const body = await req.json();
            await sql`
                INSERT INTO products (name, price, description, image_url, category, is_veg, options)
                VALUES (${body.name}, ${body.price}, ${body.description}, ${body.image_url}, ${body.category}, ${body.is_veg}, ${JSON.stringify(body.options)})
            `;
            return new Response(JSON.stringify({ success: true }), { headers });
        }

        // DELETE
        if (req.method === "DELETE") {
            const id = url.searchParams.get('id');
            await sql`DELETE FROM products WHERE id = ${id}`;
            return new Response(JSON.stringify({ success: true }), { headers });
        }

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
    }
};
