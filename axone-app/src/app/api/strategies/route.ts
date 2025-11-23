// axone-app/src/app/api/strategies/route.ts
import { NextResponse } from "next/server";
import { getAllStrategies, saveStrategy } from "@/lib/strategyRepo";
import { StrategyInputSchema } from "@/lib/strategySchema";

export async function GET() {
  try {
    const data = await getAllStrategies();
    // Conserve le format attendu par l'UI (tableau direct)
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error fetching strategies:', error);
    return NextResponse.json({ error: 'Failed to fetch strategies' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = StrategyInputSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", issues: parsed.error.issues },
        { status: 400 }
      );
    }
    
    const created = await saveStrategy(parsed.data);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Error creating strategy:', error);
    return NextResponse.json({ error: 'Failed to create strategy' }, { status: 500 });
  }
}
