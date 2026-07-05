import { NextResponse } from "next/server";

import {
    getPrintroveToken,
    createPrintroveOrder,
} from "@/lib/printrove";

export async function GET() {
    try {
        const tokenData =
            await getPrintroveToken();

        const result =
            await createPrintroveOrder(
                tokenData.access_token
            );

        return NextResponse.json(
            result
        );
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                error:
                    "Printrove order failed",
            },
            {
                status: 500,
            }
        );
    }
}