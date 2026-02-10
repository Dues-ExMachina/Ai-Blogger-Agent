"use client";

import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { type Container, type ISourceOptions } from "@tsparticles/engine";
import { loadFull } from "tsparticles";
import { useTheme } from "next-themes";

const DynamicBackground = () => {
    const [init, setInit] = useState(false);
    const [themeColor, setThemeColor] = useState("#ffffff"); // Default color
    const { resolvedTheme } = useTheme();

    // 1. Initialize Particles Engine
    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadFull(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    // 2. Logic to change colors based on Scroll
    // You can also trigger setThemeColor() from click events or parent props
    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            if (scrollY < 500) setThemeColor("#ffffff");       // White for Hero
            else if (scrollY < 1200) setThemeColor("#3b82f6");  // Blue for Projects
            else setThemeColor("#a855f7");                      // Purple for Contact
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // 3. Particle Configuration
    const options: ISourceOptions = useMemo(() => {
        const isLight = resolvedTheme === "light";
        const bgColor = isLight ? "#ffffff" : "#0d0d0d";
        const particleColor = isLight ? "#000000" : themeColor;
        const linkColor = isLight ? "#000000" : themeColor;

        return {
            background: { color: bgColor },
            fpsLimit: 120,
            interactivity: {
                events: {
                    onHover: {
                        enable: true,
                        mode: "repulse", // <--- 1. ADDED REPULSE
                    },
                    onClick: {
                        enable: true,
                        mode: "push",
                    },
                },
                modes: {
                    repulse: {
                        distance: 150,      // How far particles are pushed
                        duration: 0.4,
                        speed: 1,
                        factor: 100,
                    },
                    push: { quantity: 4 },
                },
            },
            particles: {
                // <--- 2. DYNAMIC COLORS APPLIED HERE
                color: { value: particleColor },
                links: {
                    color: linkColor,
                    distance: 150,
                    enable: true,
                    opacity: 0.4,
                    width: 1,
                    triangles: {
                        enable: true,
                        opacity: 0.05,
                    },
                },
                move: {
                    enable: true,
                    speed: 1.2,
                    direction: "none",
                    outModes: { default: "out" },
                },
                number: {
                    density: { enable: true, area: 800 }, // area is deprecated in v3 but still works sometimes, better use density logic or value
                    // value: 90, // moved inside density object in new versions usually, but let's stick to user code structure mostly
                    value: 90,
                },
                opacity: {
                    value: 0.5,
                },
                shape: { type: "circle" },
                size: {
                    value: { min: 1, max: 3 },
                },
            },
            detectRetina: true,
        };
    }, [themeColor, resolvedTheme]); // Re-render when themeColor changes

    if (!init) return null;

    return (
        <Particles
            id="tsparticles"
            options={options}
            className="fixed inset-0 -z-10"
        />
    );
};

export default DynamicBackground;
