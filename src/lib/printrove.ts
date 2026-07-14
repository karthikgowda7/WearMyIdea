import {
    PRINTROVE_PRINT_WIDTH,
    PRINTROVE_PRINT_HEIGHT,
} from "./printrove-variants";

/** Authenticate with Printrove and return an access token. */
export async function getPrintroveToken(): Promise<{
    access_token: string;
}> {
    const response = await fetch(
        "https://api.printrove.com/api/external/token",
        {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                email:
                    process.env
                        .PRINTROVE_EMAIL,
                password:
                    process.env
                        .PRINTROVE_PASSWORD,
            }),
        }
    );

    if (!response.ok) {
        throw new Error(
            "Failed to get Printrove token"
        );
    }

    return response.json();
}

/** Upload a design to Printrove via URL. Returns the created design. */
export async function uploadDesignFromUrl(
    token: string,
    imageUrl: string,
    name: string
): Promise<{ id: number; name: string }> {
    const response = await fetch(
        "https://api.printrove.com/api/external/designs/url",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type":
                    "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                url: imageUrl,
                name,
            }),
        }
    );

    return response.json();
}

/** Shape of the data needed to create a Printrove order. */
export interface PrintroveOrderInput {
    referenceNumber: string;
    designId: number;
    variantId: number;

    customerName: string;
    email?: string;
    phone: string;

    addressLine1: string;
    city: string;
    state: string;
    pincode: string;
}

/** Create a fulfillment order on Printrove. */
export async function createPrintroveOrder(
    token: string,
    input: PrintroveOrderInput
) {
    const response = await fetch(
        "https://api.printrove.com/api/external/orders",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type":
                    "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                reference_number:
                    input.referenceNumber,

                retail_price: 499,

                customer: {
                    name: input.customerName,
                    email: input.email,
                    number: input.phone,
                    address1:
                        input.addressLine1,
                    address2: input.city,
                    pincode: input.pincode,
                    state: input.state,
                    city: input.city,
                    country: "India",
                },

                order_products: [
                    {
                        product_id:
                            input.variantId,

                        quantity: 1,

                        is_plain: false,

                        design: {
                            front: {
                                id: input.designId,

                                dimensions: {
                                    width: PRINTROVE_PRINT_WIDTH,
                                    height: PRINTROVE_PRINT_HEIGHT,
                                    top: 0,
                                    left: 0,
                                },
                            },
                        },
                    },
                ],

                cod: false,
            }),
        }
    );

    return response.json();
}