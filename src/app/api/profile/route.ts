import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        let user = await prisma.user.findUnique({
            where: { clerkId: userId },
        });

        // If user doesn't have an email in DB, try to fetch from Clerk
        if (user && !user.email) {
            const clerkUser = await currentUser();
            const email = clerkUser?.emailAddresses[0]?.emailAddress;
            if (email) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { email },
                });
            }
        }

        if (!user) {
            // Create user if not exists (fail-safe)
            const clerkUser = await currentUser();
            const email = clerkUser?.emailAddresses[0]?.emailAddress;

            user = await prisma.user.create({
                data: { clerkId: userId, email },
            });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("[PROFILE_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { email, name, phone, addressLine1, city, state, pincode } = body;

        const user = await prisma.user.update({
            where: { clerkId: userId },
            data: {
                email,
                name,
                phone,
                addressLine1,
                city,
                state,
                pincode,
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error("[PROFILE_PUT]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
