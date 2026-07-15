import { NextResponse } from "next/server";
import { getPrintroveToken } from "@/lib/printrove";
import { PRINTROVE_VARIANTS } from "@/lib/printrove-variants";

/** Minimal stock shape returned to the frontend. */
export interface StockEntry {
    variantId: number;
    color: string;
    size: string;
    stockStatus: "in_stock" | "out_of_stock";
}

/** Build a flat lookup of variantId to { color, size } from PRINTROVE_VARIANTS. */
function buildVariantIndex(): Map<number, { color: string; size: string }> {
    const index = new Map<number, { color: string; size: string }>();
    for (const [color, sizes] of Object.entries(PRINTROVE_VARIANTS)) {
        for (const [size, variantId] of Object.entries(sizes)) {
            index.set(variantId, { color, size });
        }
    }
    return index;
}

/**
 * GET /api/printrove-stock
 *
 * Authenticates with Printrove, fetches catalog data for
 * Category 25 / Product 460, and returns only the stock status
 * fields the ProductDesigner needs.
 *
 * The fetch is cached for 5 minutes via Next.js revalidate.
 */
export async function GET() {
    try {
        /* 1. Authenticate */
        const { access_token: token } = await getPrintroveToken();

        /* 2. Fetch catalog product variants */
        const catalogRes = await fetch(
            "https://api.printrove.com/api/external/categories/25/products/460",
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
                next: { revalidate: 300 },
            }
        );

        if (!catalogRes.ok) {
            console.error(
                "[printrove-stock] catalog fetch failed",
                catalogRes.status
            );
            return NextResponse.json(
                { error: "Failed to fetch Printrove catalog" },
                { status: 502 }
            );
        }

        const catalog = await catalogRes.json();

        /* 3. Extract variant stock */
        const rawVariants: Array<{
            id: number;
            stock_status?: string;
            is_available?: boolean;
        }> = catalog?.data?.variants ?? catalog?.variants ?? [];

        const variantIndex = buildVariantIndex();
        const stock: StockEntry[] = [];

        for (const rv of rawVariants) {
            const meta = variantIndex.get(rv.id);
            if (!meta) continue;

            let stockStatus: StockEntry["stockStatus"];

            if (typeof rv.stock_status === "string") {
                stockStatus =
                    rv.stock_status === "in_stock" ? "in_stock" : "out_of_stock";
            } else if (typeof rv.is_available === "boolean") {
                stockStatus = rv.is_available ? "in_stock" : "out_of_stock";
            } else {
                stockStatus = "in_stock";
            }

            stock.push({
                variantId: rv.id,
                color: meta.color,
                size: meta.size,
                stockStatus,
            });
        }

        if (stock.length === 0) {
            console.warn(
                "[printrove-stock] No variants matched, falling back to all in_stock"
            );
            for (const [color, sizes] of Object.entries(PRINTROVE_VARIANTS)) {
                for (const [size, variantId] of Object.entries(sizes)) {
                    stock.push({ variantId, color, size, stockStatus: "in_stock" });
                }
            }
        }

        return NextResponse.json(stock, {
            headers: {
                "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
            },
        });
    } catch (err) {
        console.error("[printrove-stock] error", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
