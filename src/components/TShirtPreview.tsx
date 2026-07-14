"use client";

import { useState, useRef, useEffect } from "react";
import { Rnd } from "react-rnd";

interface TShirtPreviewProps {
    color: string;
    designImageUrl: string;
}

/* ── Printable area as % of the shirt image container ──
 *  These approximate the chest print zone on a standard
 *  half-sleeve round-neck tee (Printrove 15.6 × 19.6 in). */
const PRINT_AREA = {
    top: 28,    // % from top (well below collar)
    left: 28,   // % from left (inset from shoulders into torso)
    width: 44,  // % of container width (chest width only)
    height: 40, // % of container height (chest to waist)
};

const MOCKUPS: Record<string, string> = {
    White: "/mockups/white-tshirt.png",
    Black: "/mockups/black-tshirt.png",
};

export default function TShirtPreview({
    color,
    designImageUrl,
}: TShirtPreviewProps) {
    const printAreaRef = useRef<HTMLDivElement>(null);

    /* Track the pixel dimensions of the printable area so we can
       set sensible defaults for the Rnd component. */
    const [printAreaSize, setPrintAreaSize] = useState({
        w: 0,
        h: 0,
    });

    /* Design position & size inside the printable area */
    const [designPos, setDesignPos] = useState({ x: 0, y: 0 });
    const [designSize, setDesignSize] = useState({
        width: 160,
        height: 160,
    });
    const [initialized, setInitialized] = useState(false);

    /* Measure the printable area once it renders (and on resize) */
    useEffect(() => {
        function measure() {
            if (!printAreaRef.current) return;
            const rect =
                printAreaRef.current.getBoundingClientRect();
            setPrintAreaSize({
                w: rect.width,
                h: rect.height,
            });
        }

        measure();
        window.addEventListener("resize", measure);
        return () =>
            window.removeEventListener("resize", measure);
    }, []);

    /* Center the design when the printable area is first measured */
    useEffect(() => {
        if (printAreaSize.w > 0 && !initialized) {
            const dw = Math.round(printAreaSize.w * 0.6);
            const dh = dw; // square default
            setDesignSize({ width: dw, height: dh });
            setDesignPos({
                x: Math.round(
                    (printAreaSize.w - dw) / 2
                ),
                y: Math.round(
                    (printAreaSize.h - dh) * 0.15
                ),
            });
            setInitialized(true);
        }
    }, [printAreaSize, initialized]);

    return (
        <div
            className="relative mx-auto w-full"
            style={{ maxWidth: 420 }}
        >
            {/* T-Shirt mockup image */}
            <img
                src={MOCKUPS[color] ?? MOCKUPS.White}
                alt={`${color} T-Shirt`}
                className="h-auto w-full select-none"
                draggable={false}
            />

            {/* Invisible printable area bounding box */}
            <div
                ref={printAreaRef}
                className="absolute"
                style={{
                    top: `${PRINT_AREA.top}%`,
                    left: `${PRINT_AREA.left}%`,
                    width: `${PRINT_AREA.width}%`,
                    height: `${PRINT_AREA.height}%`,
                    border: "1.5px dashed rgba(120,120,120,0.35)",
                    borderRadius: 4,
                    overflow: "hidden",
                    pointerEvents: "auto",
                }}
            >
                {/* Draggable + resizable design overlay */}
                {initialized && (
                    <Rnd
                        bounds="parent"
                        lockAspectRatio
                        size={designSize}
                        position={designPos}
                        minWidth={50}
                        minHeight={50}
                        onDragStop={(_e, d) => {
                            setDesignPos({
                                x: d.x,
                                y: d.y,
                            });
                        }}
                        onResizeStop={(
                            _e,
                            _dir,
                            ref,
                            _delta,
                            position
                        ) => {
                            setDesignSize({
                                width: ref.offsetWidth,
                                height: ref.offsetHeight,
                            });
                            setDesignPos(position);
                        }}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "move",
                        }}
                        enableResizing={{
                            topLeft: true,
                            topRight: true,
                            bottomLeft: true,
                            bottomRight: true,
                            top: false,
                            right: false,
                            bottom: false,
                            left: false,
                        }}
                        resizeHandleStyles={{
                            topLeft: handleStyle,
                            topRight: handleStyle,
                            bottomLeft: handleStyle,
                            bottomRight: handleStyle,
                        }}
                    >
                        <img
                            src={designImageUrl}
                            alt="Your design"
                            className="pointer-events-none h-full w-full object-contain"
                            draggable={false}
                        />
                    </Rnd>
                )}
            </div>
        </div>
    );
}

/* Small visible resize handles at corners */
const handleStyle: React.CSSProperties = {
    width: 10,
    height: 10,
    background: "#fff",
    border: "2px solid #555",
    borderRadius: 2,
};
