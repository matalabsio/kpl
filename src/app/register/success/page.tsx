import Link from "next/link";
import { CheckCircle2, Home } from "lucide-react";
import { KplLogo } from "@/components/brand/kpl-logo";

export const metadata = {
  title: "Registration Successful | KPL",
};

type Props = {
  searchParams: Promise<{
    id?: string;
    team?: string;
    sport?: string;
    members?: string;
  }>;
};

export default async function SuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const registrationId = params.id?.trim() || "—";
  const teamName = params.team?.trim() || "—";
  const sport = params.sport?.trim() || "—";
  const members = params.members?.trim() || "—";

  const followKpl =
    process.env.NEXT_PUBLIC_FOLLOW_KPL_URL ||
    "https://www.instagram.com/viresh_tdp/";
  const whatsapp =
    process.env.NEXT_PUBLIC_WHATSAPP_UPDATES_URL || "https://wa.me/";

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center bg-[#FFFDE6] px-4 py-12">
      <div className="border-2 border-[#FFFF00] bg-[#FFFFFF] p-6 text-center shadow-md sm:p-10">
        <div className="flex justify-center">
          <KplLogo href={undefined} size={96} />
        </div>
        <CheckCircle2
          className="mx-auto mt-4 size-12 text-[#2F5C2F]"
          aria-hidden
        />
        <p className="mt-4 text-[11px] font-bold tracking-[0.28em] text-[#2F5C2F] uppercase">
          Registration Successful
        </p>
        <h1 className="font-display mt-3 text-3xl font-bold tracking-wide text-[#2B2626] uppercase">
          Kurupam Premier League
        </h1>
        <p className="mt-6 text-sm font-medium text-[#5A6B7D]">Registration ID</p>
        <p className="font-display mt-1 text-4xl font-bold tracking-wider text-[#2F5C2F]">
          {registrationId}
        </p>
        <dl className="mt-6 grid gap-3 text-left text-sm sm:grid-cols-3">
          <div>
            <dt className="text-[10px] font-bold tracking-[0.16em] text-[#5A6B7D] uppercase">
              Team
            </dt>
            <dd className="font-semibold">{teamName}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold tracking-[0.16em] text-[#5A6B7D] uppercase">
              Sport
            </dt>
            <dd className="font-semibold uppercase">{sport}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold tracking-[0.16em] text-[#5A6B7D] uppercase">
              Members
            </dt>
            <dd className="font-semibold">{members}</dd>
          </div>
        </dl>
        <p className="mt-4 text-sm text-[#5A6B7D]">
          Keep your registration ID for future KPL communication.
        </p>
        <div className="mt-8 flex flex-col gap-2">
          <Link
            href="/"
            className="btn-green inline-flex h-12 items-center justify-center gap-2 px-6 text-sm font-bold tracking-[0.14em] uppercase"
          >
            <Home className="size-4" /> Back to KPL Home
          </Link>
          <a
            href={followKpl}
            target="_blank"
            rel="noreferrer"
            className="btn-red inline-flex h-12 items-center justify-center text-sm font-bold tracking-[0.14em] uppercase"
          >
            Follow KPL
          </a>
          <a
            href={whatsapp}
            target="_blank"
            rel="noreferrer"
            className="btn-green inline-flex h-12 items-center justify-center text-sm font-bold tracking-[0.14em] uppercase"
          >
            WhatsApp Updates
          </a>
        </div>
      </div>
    </main>
  );
}
