import WordSearchGame from '@/components/games/WordSearchGame';

export default function WordSearchPage() {
  return (
    <div className="min-h-screen pt-28 pb-16 bg-gradient-to-br from-[#2D3436] via-[#00B894] to-[#55EFC4]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <WordSearchGame />
      </div>
    </div>
  );
}
