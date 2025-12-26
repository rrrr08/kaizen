"use client";

import React, { useEffect, useState } from 'react';

const SidebarMonitor: React.FC = () => {
    const [scrollPercent, setScrollPercent] = useState(0);
    const [activeNodes, setActiveNodes] = useState(1240);

    useEffect(() => {
        const handleScroll = () => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (scrollHeight <= 0) {
                setScrollPercent(0);
                return;
            }
            const scrolled = (window.scrollY / scrollHeight) * 100;
            setScrollPercent(Math.min(scrolled, 100));
        };

        const interval = setInterval(() => {
            setActiveNodes(prev => prev + (Math.random() > 0.5 ? 1 : -1));
        }, 3000);

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearInterval(interval);
        };
    }, []);

    return (
        <aside className="sidebar-monitor border-r border-[#333]">
            <div className="flex flex-col items-center gap-6">
                <div className="w-8 h-8 border-2 border-[#FFD400] rotate-45 flex items-center justify-center">
                    <div className="-rotate-45 font-arcade text-xs text-[#FFD400]">S</div>
                </div>
                <div className="font-arcade text-[8px] text-gray-600 vertical-text tracking-[0.3em] uppercase">
                    Solar.System.OS_v2.5
                </div>
            </div>

            <div className="flex flex-col items-center gap-4">
                <div className="font-arcade text-[7px] text-[#FF8C00] uppercase">Heat</div>
                <div className="meter-container">
                    <div className="meter-fill" style={{ height: `${scrollPercent}%` }}></div>
                </div>
                <div className="font-arcade text-[10px] text-white">{Math.round(scrollPercent)}%</div>
            </div>

            <div className="flex flex-col items-center gap-8">
                <div className="flex flex-col items-center">
                    <div className="w-1 h-8 bg-gradient-to-b from-[#FF8C00] to-transparent mb-2"></div>
                    <div className="font-arcade text-[7px] text-gray-500 vertical-text">NODES_ACTIVE</div>
                    <div className="font-arcade text-[10px] text-[#FFD400] mt-2">{activeNodes}</div>
                </div>

                <div className="flex flex-col gap-1">
                    <div className="w-1.5 h-1.5 bg-[#FF8C00]"></div>
                    <div className="w-1.5 h-1.5 bg-gray-800"></div>
                    <div className="w-1.5 h-1.5 bg-[#FFD400]"></div>
                </div>
            </div>
        </aside>
    );
};

export default SidebarMonitor;
