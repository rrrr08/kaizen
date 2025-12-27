import MathQuizGame from '@/components/games/MathQuizGame';

export default function MathQuizPage() {
  return (
    <div className="min-h-screen pt-28 pb-16 bg-gradient-to-br from-[#2D3436] via-[#6C5CE7] to-[#A29BFE]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <MathQuizGame />
      </div>
    </div>
  );
}
