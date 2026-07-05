import { NextResponse } from "next/server";
import {
    getPrintroveToken,
    uploadDesignFromUrl,
} from "@/lib/printrove";

export async function GET() {
    const tokenData =
        await getPrintroveToken();

    const result =
        await uploadDesignFromUrl(
            tokenData.access_token,
            "https://res.cloudinary.com/fvib0zd9/image/upload/v1783249597/wearmyidea/kkt4cipsrxjops3j4cas.jpg",
            "Test Design"
        );

    return NextResponse.json(result);
}