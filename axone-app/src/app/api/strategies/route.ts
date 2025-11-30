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
    
    // Convertir les adresses string en 0x${string}
    const strategyInput = {
      ...parsed.data,
      contracts: {
        ...parsed.data.contracts,
        vaultAddress: parsed.data.contracts.vaultAddress as `0x${string}`,
        handlerAddress: parsed.data.contracts.handlerAddress as `0x${string}`,
        coreViewsAddress: parsed.data.contracts.coreViewsAddress as `0x${string}`,
        l1ReadAddress: parsed.data.contracts.l1ReadAddress as `0x${string}`,
        coreWriterAddress: parsed.data.contracts.coreWriterAddress as `0x${string}`,
        usdcAddress: parsed.data.contracts.usdcAddress ? (parsed.data.contracts.usdcAddress as `0x${string}`) : undefined,
      },
    };
    
    const created = await saveStrategy(strategyInput);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Error creating strategy:', error);
    return NextResponse.json({ error: 'Failed to create strategy' }, { status: 500 });
  }
}
