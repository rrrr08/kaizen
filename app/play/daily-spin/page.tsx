import WheelOfJoy from '@/components/gamification/WheelOfJoy';

export default function DailySpinPage() {
  return (
    <div className="min-h-screen pt-28 pb-16 bg-gradient-to-br from-[#2D3436] via-[#FFD93D] to-[#FF7675]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-12">
          <h1 className="font-header text-6xl md:text-8xl tracking-tighter mb-6 text-white drop-shadow-[4px_4px_0px_#000]">
            DAILY <span className="text-[#FFD93D]">SPIN</span>
          </h1>
          <p className="text-white/90 font-bold text-xl max-w-2xl mx-auto">
            Spin the wheel once per day for FREE! Win bonus points and prizes.
          </p>
        </div>

        <div className="bg-black/40 border-2 border-white/20 p-12 rounded-[30px] backdrop-blur-sm">
          <WheelOfJoy />
        </div>

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 p-6 rounded-2xl text-center">
            <div className="text-4xl mb-3">🎁</div>
            <h3 className="font-bold text-white mb-2">Free Daily Spin</h3>
            <p className="text-white/70 text-sm">
              Get one free spin every 24 hours
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 p-6 rounded-2xl text-center">
            <div className="text-4xl mb-3">💰</div>
            <h3 className="font-bold text-white mb-2">Win Big Prizes</h3>
            <p className="text-white/70 text-sm">
              Earn bonus points and special rewards
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 p-6 rounded-2xl text-center">
            <div className="text-4xl mb-3">🔄</div>
            <h3 className="font-bold text-white mb-2">Extra Spins</h3>
            <p className="text-white/70 text-sm">
              Use points to buy additional spins
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
