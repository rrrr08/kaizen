"use client";

import React, { useEffect, useRef, useState } from 'react';

const CustomCursor: React.FC = () => {
    const cursorRef = useRef<HTMLDivElement>(null);
    const trailRef = useRef<HTMLDivElement>(null);
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        // Only run on client side and if matchMedia matches fine pointer (desktop usually)
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia('(pointer: fine)');
        if (!mediaQuery.matches) return;

        const onMouseMove = (e: MouseEvent) => {
            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
            }
            if (trailRef.current) {
                // Subtle delay for the trail
                setTimeout(() => {
                    if (trailRef.current) {
                        trailRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%) rotate(45deg)`;
                    }
                }, 50);
            }
        };

        const onMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const isClickable =
                target.tagName === 'BUTTON' ||
                target.tagName === 'A' ||
                target.closest('button') ||
                target.closest('a') ||
                window.getComputedStyle(target).cursor === 'pointer';

            setIsHovering(!!isClickable);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseover', onMouseOver);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseover', onMouseOver);
        };
    }, []);

    return (
        <>
            <div
                ref={cursorRef}
                className={`arcade-cursor ${isHovering ? 'hovering' : ''}`}
                style={{ transform: 'translate3d(-100px, -100px, 0)' }}
            />
            <div
                ref={trailRef}
                className="cursor-trail"
                style={{ transform: 'translate3d(-100px, -100px, 0) rotate(45deg)' }}
            />
        </>
    );
};

export default CustomCursor;
