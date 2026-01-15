import React from 'react';
import { Shield, Lock, Eye, FileText, Server, Globe } from 'lucide-react';

export const metadata = {
    title: 'Privacy Policy | Joy Juncture',
    description: 'Privacy Policy for Joy Juncture - How we collect, use, and protect your data.',
};

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-white pt-32 pb-20">
            <div className="container mx-auto px-6 max-w-4xl">
                {/* Header */}
                <div className="mb-16 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#6C5CE7] rounded-full mb-6 neo-shadow">
                        <Shield className="text-white" size={32} />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black mb-6 text-black tracking-tight">
                        Privacy Policy
                    </h1>
                    <p className="text-xl text-black/60 font-medium">
                        Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                </div>

                {/* Content */}
                <div className="space-y-12">
                    {/* Introduction */}
                    <section className="bg-white border-4 border-black p-8 rounded-[32px] neo-shadow hover:translate-y-[-4px] transition-transform duration-300">
                        <h2 className="text-2xl font-black mb-4 flex items-center gap-3">
                            <FileText className="text-[#00B894]" />
                            1. Introduction
                        </h2>
                        <p className="text-lg text-black/70 leading-relaxed font-medium">
                            Welcome to Joy Juncture. We value your trust and are committed to protecting your privacy.
                            This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                            when you visit our website joy-juncture.vercel.app used for our community and events.
                        </p>
                    </section>

                    {/* Data Collection */}
                    <section className="bg-white border-4 border-black p-8 rounded-[32px] neo-shadow hover:translate-y-[-4px] transition-transform duration-300">
                        <h2 className="text-2xl font-black mb-4 flex items-center gap-3">
                            <Eye className="text-[#FF7675]" />
                            2. Information We Collect
                        </h2>
                        <div className="space-y-4 text-lg text-black/70 font-medium">
                            <p>We may collect information about you in a variety of ways. The information we may collect includes:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>
                                    <strong className="text-black">Personal Data:</strong> Personally identifiable information, such as your name, shipping address,
                                    email address, and telephone number, that you voluntarily give to us when you register with the Site
                                    or when you choose to participate in various activities related to the Site.
                                </li>
                                <li>
                                    <strong className="text-black">Derivative Data:</strong> Information our servers automatically collect when you access the Site,
                                    such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* Use of Information */}
                    <section className="bg-white border-4 border-black p-8 rounded-[32px] neo-shadow hover:translate-y-[-4px] transition-transform duration-300">
                        <h2 className="text-2xl font-black mb-4 flex items-center gap-3">
                            <Server className="text-[#FFD93D]" />
                            3. Use of Your Information
                        </h2>
                        <div className="space-y-4 text-lg text-black/70 font-medium">
                            <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Create and manage your account.</li>
                                <li>Process your orders and payments for events and merchandise.</li>
                                <li>Email you regarding your account or order.</li>
                                <li>Fulfill and manage purchases, orders, payments, and other transactions related to the Site.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Security */}
                    <section className="bg-white border-4 border-black p-8 rounded-[32px] neo-shadow hover:translate-y-[-4px] transition-transform duration-300">
                        <h2 className="text-2xl font-black mb-4 flex items-center gap-3">
                            <Lock className="text-[#6C5CE7]" />
                            4. Security of Your Information
                        </h2>
                        <p className="text-lg text-black/70 leading-relaxed font-medium">
                            We use administrative, technical, and physical security measures to help protect your personal information.
                            While we have taken reasonable steps to secure the personal information you provide to us, please be aware
                            that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission
                            can be guaranteed against any interception or other type of misuse.
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="bg-black text-white p-8 rounded-[32px] neo-shadow hover:translate-y-[-4px] transition-transform duration-300">
                        <h2 className="text-2xl font-black mb-4 flex items-center gap-3">
                            <Globe className="text-[#00B894]" />
                            5. Contact Us
                        </h2>
                        <p className="text-lg opacity-80 leading-relaxed font-medium mb-4">
                            If you have questions or comments about this Privacy Policy, please contact us at:
                        </p>
                        <a href="mailto:support@joyjuncture.com" className="text-[#FFD93D] font-bold text-xl hover:underline">
                            support@joyjuncture.com
                        </a>
                    </section>
                </div>
            </div>
        </div>
    );
}
