/**
 * Printrove variant mapping — single source of truth.
 *
 * These are catalog child variant IDs for:
 * Parent Product 460 — "Half Sleeve Round Neck T-Shirt"
 * Category 25 — "Men's Clothing"
 *
 * Print area: 4680 × 5880 px (same for front and back).
 */

export const PRINTROVE_PRINT_WIDTH = 4680;
export const PRINTROVE_PRINT_HEIGHT = 5880;

export const PRINTROVE_VARIANTS: Record<
    string,
    Record<string, number>
> = {
    White: {
        S: 264,
        M: 265,
        L: 266,
        XL: 267,
    },
    Black: {
        S: 269,
        M: 270,
        L: 271,
        XL: 272,
    },
};

/** Resolve a color + size to a Printrove catalog variant ID. */
export function resolveVariantId(
    color: string,
    size: string
): number {
    const sizeMap = PRINTROVE_VARIANTS[color];

    if (!sizeMap) {
        throw new Error(
            `Unknown color: ${color}`
        );
    }

    const variantId = sizeMap[size];

    if (!variantId) {
        throw new Error(
            `Unknown size "${size}" for color "${color}"`
        );
    }

    return variantId;
}
