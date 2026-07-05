/**
 * Diagnostic route — READ ONLY, no orders created.
 * Since Product Library is empty, we MUST use product_id (catalog) instead of variant_id.
 * This route now drills into Men's Clothing (category 25) to get:
 *   - catalog product IDs (product_id for the order)
 *   - front_print_width / front_print_height (correct design dimensions)
 */
import { NextResponse } from "next/server";
import { getPrintroveToken } from "@/lib/printrove";

export async function GET() {
    const { access_token: token } = await getPrintroveToken();

    const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
    };

    // 1. Men's Clothing products (category 25) — get catalog product IDs
    const mensClotheRes = await fetch(
        "https://api.printrove.com/api/external/categories/25",
        { headers }
    );
    const mensClothing = await mensClotheRes.json();

    // 2. Drill into first product to get variants + print dimensions
    //    Look for: front_print_width, front_print_height, id (product_id for order)
    let firstProductVariants = null;
    const firstProduct = mensClothing?.products?.[0];
    if (firstProduct?.id) {
        const varRes = await fetch(
            `https://api.printrove.com/api/external/categories/25/products/${firstProduct.id}`,
            { headers }
        );
        firstProductVariants = await varRes.json();
    }

    // 3. Designs — confirm design 11926343038 is present (already confirmed)
    const designsRes = await fetch(
        "https://api.printrove.com/api/external/designs?per_page=20&page=1",
        { headers }
    );
    const designs = await designsRes.json();

    return NextResponse.json({
        // Use products[*].id as product_id in the order (no variant_id needed)
        mensClothing,
        // Use variants[*].id as variant_id, check front_print_width/height for dimensions
        firstProductVariants,
        // Design confirmed
        designs,
    });
}

