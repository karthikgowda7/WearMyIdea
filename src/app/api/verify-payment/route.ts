import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            designId,
            amount,
            shipping,
        } = await req.json();

        const expectedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env.RAZORPAY_KEY_SECRET!
                )
                .update(
                    `${razorpay_order_id}|${razorpay_payment_id}`
                )
                .digest("hex");

        const isValid =
            expectedSignature ===
            razorpay_signature;

        if (!isValid) {
            return NextResponse.json(
                {
                    success: false,
                },
                {
                    status: 400,
                }
            );
        }

        const order =
            await prisma.order.create({
                data: {
                    designId,

                    razorpayOrderId:
                        razorpay_order_id,

                    razorpayPaymentId:
                        razorpay_payment_id,

                    amount,

                    status: "PAID",

                    customerName:
                        shipping.customerName,

                    phone:
                        shipping.phone,

                    addressLine1:
                        shipping.addressLine1,

                    city:
                        shipping.city,

                    state:
                        shipping.state,

                    pincode:
                        shipping.pincode,
                },
            });

        return NextResponse.json({
            success: true,
            order,
        });

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
            },
            {
                status: 500,
            }
        );
    }
}