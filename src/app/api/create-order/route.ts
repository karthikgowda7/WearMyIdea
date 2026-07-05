import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const {
            amount,
            designId,
        } = await req.json();

        const order =
            await razorpay.orders.create({
                amount: amount * 100,
                currency: "INR",
                receipt: `receipt_${Date.now()}`,

                notes: {
                    designId,
                },
            });

        return NextResponse.json(order);

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Failed to create order" },
            { status: 500 }
        );
    }
}