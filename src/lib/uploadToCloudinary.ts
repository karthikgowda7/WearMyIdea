import cloudinary from "./cloudinary";

/**
 * Downloads an image from a URL (with a long timeout for slow generators
 * like Pollinations), then uploads the binary buffer to Cloudinary.
 *
 * WHY NOT cloudinary.uploader.upload(url):
 *   Cloudinary's server fetches the URL itself and has a short internal
 *   timeout. Pollinations generates images on-demand (10–30 s) so Cloudinary
 *   hits the URL before the image is ready and gets a 500.
 *
 * WHY fetch() instead of axios:
 *   fetch() is built into Node 18+ (used by Next.js 14+), no extra dep needed.
 */
export async function uploadImageFromUrl(imageUrl: string): Promise<string> {
    console.log("Fetching image from Pollinations…");

    // Pollinations can take up to ~30 s to generate. Wait up to 90 s.
    const response = await fetch(imageUrl, {
        signal: AbortSignal.timeout(90_000),
        headers: {
            // Mimic a real browser to avoid bot-blocking by Pollinations CDN
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            Accept: "image/webp,image/png,image/*,*/*",
        },
    });

    if (!response.ok) {
        throw new Error(
            `Pollinations returned ${response.status} ${response.statusText} for URL: ${imageUrl}`
        );
    }

    const contentType =
        response.headers.get("content-type") ?? "image/png";

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataUri = `data:${contentType};base64,${base64}`;

    console.log(
        `Image downloaded (${Math.round(arrayBuffer.byteLength / 1024)} KB). Uploading to Cloudinary…`
    );

    const result = await cloudinary.uploader.upload(dataUri, {
        folder: "wearmyidea",
    });

    console.log("Cloudinary upload success:", result.secure_url);
    return result.secure_url;
}