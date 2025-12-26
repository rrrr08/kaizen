'use client';
import { ErrorScreen } from '@/components/ui/error-screen';
export default function Error({ error, reset }: { error: Error; reset: () => void }) { return <ErrorScreen error={error} reset={reset} title="TRANSACTION_ERROR" message="LEDGER_SYNC_FAILED" />; }
