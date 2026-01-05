
'use client';

import React from 'react';
import { X, Printer } from 'lucide-react';
import { getOrderInvoiceTemplate } from '@/lib/email-templates';

interface InvoiceModalProps {
    order: any;
    isOpen: boolean;
    onClose: () => void;
}

export default function InvoiceModal({ order, isOpen, onClose }: InvoiceModalProps) {
    if (!isOpen || !order) return null;

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            const html = getOrderInvoiceTemplate(order);
            printWindow.document.write(html);
            printWindow.document.close();
            printWindow.print();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-4xl rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
                {/* Header */}
                <div className="bg-gray-100 p-4 border-b flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-800 tracking-tight">Tax Invoice Preview</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                            <Printer className="w-4 h-4" />
                            Print Official Bill
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content - Formal Look with Signatures and Terms */}
                <div className="overflow-y-auto p-12 bg-gray-50 flex justify-center">
                    <div className="bg-white w-full max-w-[800px] shadow-sm border border-gray-200 p-10 text-gray-800 font-sans leading-relaxed">
                        <div className="flex justify-between mb-10 border-b pb-6">
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 mb-1">JOY JUNCTURE</h1>
                                <p className="text-sm font-bold text-gray-500">Joy Juncture Stores Pvt Ltd</p>
                                <p className="text-xs text-gray-400">GSTIN: 24AABCJ1234F1Z5</p>
                            </div>
                            <div className="text-right">
                                <h1 className="text-2xl font-bold text-gray-400">TAX INVOICE</h1>
                                <div className="text-sm space-y-1 mt-2">
                                    <p><span className="font-bold">Invoice #:</span> {order.id}</p>
                                    <p><span className="font-bold">Date:</span> {new Date(order.createdAt).toLocaleDateString()}</p>
                                    <p><span className="font-bold text-green-600">PAID</span></p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-10 mb-10 text-sm">
                            <div>
                                <h3 className="font-bold text-gray-400 uppercase text-xs mb-3 tracking-wider border-b pb-1">Billing Details</h3>
                                <div className="text-gray-900 space-y-1">
                                    <p className="font-bold text-base">{order.shippingAddress?.name}</p>
                                    <p>{order.shippingAddress?.address}</p>
                                    <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
                                    <p className="pt-2 font-medium">Contact: {order.shippingAddress?.phone}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h3 className="font-bold text-gray-400 uppercase text-xs mb-3 tracking-wider border-b pb-1">Payment Info</h3>
                                <div className="text-gray-900 space-y-1">
                                    <p><span className="font-medium">Method:</span> {order.paymentMethod || 'Razorpay Online'}</p>
                                    <p className="font-mono text-xs"><span className="font-medium">Order ID:</span> {order.id}</p>
                                </div>
                            </div>
                        </div>

                        <table className="w-full text-sm mb-10">
                            <thead>
                                <tr className="bg-gray-50 border-y border-gray-200 text-gray-900 font-bold">
                                    <th className="py-3 text-left pl-2">Description</th>
                                    <th className="py-3 text-center">Quantity</th>
                                    <th className="py-3 text-right">Unit Price</th>
                                    <th className="py-3 text-right pr-2">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items?.map((item: any, idx: number) => {
                                    const unitPrice = item.product?.price || item.price || 0;
                                    const itemName = item.product?.name || item.name || item.title || 'Product';
                                    const total = unitPrice * item.quantity;
                                    return (
                                        <tr key={idx} className="border-b border-gray-100">
                                            <td className="py-4 pl-2 font-medium">{itemName}</td>
                                            <td className="py-4 text-center">{item.quantity}</td>
                                            <td className="py-4 text-right">₹{unitPrice.toLocaleString()}</td>
                                            <td className="py-4 text-right pr-2 font-bold">₹{total.toLocaleString()}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        <div className="flex justify-end pt-4">
                            <div className="w-64 space-y-2 border-t border-gray-200 pt-4">
                                {(() => {
                                    const subtotal = order.subtotal || order.originalPrice || order.totalPrice;
                                    const gstAmount = order.gst || 0;
                                    const gstRate = order.gstRate || 0;
                                    return (
                                        <>
                                            <div className="flex justify-between text-gray-500 text-sm">
                                                <span>Subtotal</span>
                                                <span>₹{subtotal.toLocaleString()}</span>
                                            </div>
                                            {gstAmount > 0 ? (
                                                <div className="flex justify-between text-gray-500 text-sm">
                                                    <span>GST ({gstRate}%)</span>
                                                    <span>₹{gstAmount.toLocaleString()}</span>
                                                </div>
                                            ) : (
                                                <div className="flex justify-between text-gray-500 text-sm">
                                                    <span>GST (0%)</span>
                                                    <span>₹0</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t-2 border-gray-900">
                                                <span>Grand Total</span>
                                                <span>₹{order.totalPrice.toLocaleString()}</span>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Formal Footer: Signatory and Terms */}
                        <div className="mt-16 grid grid-cols-2 gap-10">
                            <div className="text-[10px] text-gray-400 space-y-1">
                                <p className="font-bold text-gray-600 mb-2">TERMS & CONDITIONS:</p>
                                <p>1. Goods once sold will not be taken back.</p>
                                <p>2. Final payment includes all applicable digital convenience fees.</p>
                                <p>3. This is a computer-generated invoice and does not require a signature.</p>
                            </div>
                            <div className="text-right">
                                <div className="inline-block text-center mr-0">
                                    <p className="text-xs font-bold text-gray-700 mb-10">For JOY JUNCTURE STORES PVT LTD</p>
                                    <div className="border-t border-gray-300 w-48 mx-auto"></div>
                                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">Authorized Signatory</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 pt-6 border-t border-gray-50 text-center text-[10px] text-gray-400 italic">
                            Thank you for your business. For any queries, please email support@joyjuncture.com
                        </div>
                    </div>
                </div>

                {/* Main Footer */}
                <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={handlePrint}
                        className="px-10 py-2 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Printer className="w-4 h-4" />
                        Print Official Bill
                    </button>
                </div>
            </div>
        </div>
    );
}
