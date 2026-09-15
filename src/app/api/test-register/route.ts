import { NextResponse } from "next/server";
import { registrationSchema } from "@/lib/validation/registration";
import { saveRegistration } from "@/lib/sheets";

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ ok: false, error: "Disabled" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = registrationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const result = await saveRegistration(parsed.data);
    return NextResponse.json({
      ok: true,
      registrationId: result.registrationId,
      mode: result.mode,
      duplicateFlags: result.duplicateFlags,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
