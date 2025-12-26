'use client';
import { ErrorScreen } from '@/components/ui/error-screen';
export default function Error({ error, reset }: { error: Error; reset: () => void }) { return <ErrorScreen error={error} reset={reset} title="VAULT_LOCKDOWN" message="ACCESS_DENIED_OR_MALFUNCTION" />; }
