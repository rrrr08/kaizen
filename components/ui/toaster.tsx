"use client"

import { useToast } from "@/hooks/use-toast"
import {
    Toast,
    ToastClose,
    ToastDescription,
    ToastProvider,
    ToastTitle,
    ToastViewport,
} from "@/components/ui/toast"

import { CheckCircle2, AlertCircle, Info, XCircle } from "lucide-react"

export function Toaster() {
    const { toasts } = useToast()

    return (
        <ToastProvider>
            {toasts.map(function ({ id, title, description, variant, ...props }) {
                return (
                    // @ts-ignore
                    <Toast key={id} variant={variant} {...props}>
                        <div className="flex gap-4">
                            {variant === 'success' && <CheckCircle2 className="w-6 h-6 text-white shrink-0" />}
                            {variant === 'destructive' && <XCircle className="w-6 h-6 text-white shrink-0" />}
                            {variant === 'default' && <Info className="w-6 h-6 text-[#6C5CE7] shrink-0" />}
                            <div className="grid gap-1">
                                {title && <ToastTitle className="font-black uppercase tracking-tight text-lg leading-tight">{title}</ToastTitle>}
                                {description && (
                                    <ToastDescription className="font-bold opacity-90">{description}</ToastDescription>
                                )}
                            </div>
                        </div>
                        <ToastClose className="text-current opacity-50 hover:opacity-100" />
                    </Toast>
                )
            })}
            <ToastViewport />
        </ToastProvider>
    )
}
