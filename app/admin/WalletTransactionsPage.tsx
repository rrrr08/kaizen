import { useEffect, useState } from 'react';

export default function WalletTransactionsPage({ userId }: { userId: string }) {
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${userId}/walletTransactions`)
      .then(r => r.json())
      .then(data => {
        setTxs(data.transactions || []);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Wallet Transactions</h2>
      <table className="w-full border">
        <thead>
          <tr>
            <th>Date</th><th>Type</th><th>Points</th><th>Reason</th><th>Game</th>
          </tr>
        </thead>
        <tbody>
          {txs.map(tx => (
            <tr key={tx.id}>
              <td>{tx.awardedAt?.slice(0,10)}</td>
              <td>{tx.type}</td>
              <td>{tx.points}</td>
              <td>{tx.reason}</td>
              <td>{tx.gameId}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
