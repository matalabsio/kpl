import Image from "next/image";
import { KplLogo } from "@/components/brand/kpl-logo";

export const metadata = {
  title: "KPL Registration Poster",
};

export default function PosterPage() {
  return (
    <main className="min-h-screen bg-white text-[#2B2626] print:bg-white">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[210mm] flex-col items-center justify-between px-8 py-10 text-center sm:px-12 sm:py-14">
        <div className="flex flex-col items-center">
          <KplLogo href={undefined} size={160} priority />
          <p className="mt-4 border border-[#FFFF00] bg-[#FFFF00] px-3 py-1 text-sm font-bold tracking-[0.35em] text-[#2B2626] uppercase">
            Free Entry
          </p>
          <p className="font-display mt-3 text-2xl font-semibold tracking-[0.15em] text-[#2B2626] uppercase">
            Cricket + Volleyball
          </p>
        </div>

        <div className="my-10 flex flex-col items-center gap-4">
          <p className="font-display text-3xl font-bold tracking-wide uppercase">
            Register Your Team
          </p>
          <p className="text-lg text-[#2B2626]/60">Scan QR Code</p>
          <div className="border-4 border-[#FFFF00] bg-white p-4 shadow-lg ring-2 ring-[#FFFF00]">
            <Image
              src="/kpl-register-qr.png"
              alt="QR code to register for Kurupam Premier League"
              width={240}
              height={240}
              priority
            />
          </div>
          <p className="max-w-sm text-sm text-[#2B2626]/60">
            Opens the official KPL team registration form on your phone.
          </p>
        </div>

        <div>
          <p className="font-display text-xl font-semibold tracking-wide uppercase text-[#2B2626]">
            No Entry Fee
          </p>
          <p className="mt-2 text-sm text-[#2B2626]/60">
            Captains: sport → details → roster → submit
          </p>
        </div>
      </div>
      <style>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </main>
  );
}
