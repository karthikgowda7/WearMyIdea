export async function getPrintroveToken() {
    const response = await fetch(
        "https://api.printrove.com/api/external/token",
        {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/json",
                Accept:
                    "application/json",
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

export async function getCategories(
    token: string
) {
    const response = await fetch(
        "https://api.printrove.com/api/external/categories",
        {
            headers: {
                Authorization:
                    `Bearer ${token}`,
                Accept:
                    "application/json",
            },
        }
    );

    return response.json();
}

export async function getCategoryProducts(
    token: string,
    categoryId: number
) {
    const response = await fetch(
        `https://api.printrove.com/api/external/categories/${categoryId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        }
    );

    return response.json();
}

export async function getVariants(
    token: string,
    categoryId: number,
    productId: number
) {
    const response = await fetch(
        `https://api.printrove.com/api/external/categories/${categoryId}/products/${productId}`,
        {
            headers: {
                Authorization:
                    `Bearer ${token}`,
                Accept:
                    "application/json",
            },
        }
    );

    return response.json();
}

export async function uploadDesignFromUrl(
    token: string,
    imageUrl: string,
    name: string
) {
    const response = await fetch(
        "https://api.printrove.com/api/external/designs/url",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
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

export async function createPrintroveOrder(
    token: string
) {
    const response = await fetch(
        "https://api.printrove.com/api/external/orders",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },

            body: JSON.stringify({
                reference_number:
                    `wearmyidea-${Date.now()}`,

                retail_price: 499,

                customer: {
                    name: "Karthik Gowda",

                    email:
                        "test@example.com",

                    number:
                        9876543210,

                    address1:
                        "Test Address",

                    address2:
                        "Bengaluru",

                    pincode:
                        560001,

                    state:
                        "Karnataka",

                    city:
                        "Bengaluru",

                    country:
                        "India",
                },

                order_products: [
                    {
                        product_id: 272,

                        quantity: 1,

                        is_plain: false,

                        design: {
                            front: {
                                id:
                                    11926343038,

                                dimensions: {
                                    width:
                                        4680,

                                    height:
                                        5880,

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