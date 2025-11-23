// axone-app/src/app/api/strategies/[id]/route.ts
import { NextResponse } from "next/server";
import { getStrategyById, saveStrategy, deleteStrategy } from "@/lib/strategyRepo";
import { StrategyInputSchema } from "@/lib/strategySchema";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const s = await getStrategyById(id);
    
    if (!s) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    
    return NextResponse.json(s);
  } catch (error) {
    console.error('Error fetching strategy:', error);
    return NextResponse.json({ error: 'Failed to fetch strategy' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    // Récupérer la stratégie existante pour fusionner les champs
    const existing = await getStrategyById(id);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    
    // Fusionner les données existantes avec les nouvelles
    const merged = { ...existing, ...body, id };
    const parsed = StrategyInputSchema.safeParse(merged);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const updated = await saveStrategy(parsed.data);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating strategy:', error);
    return NextResponse.json({ error: 'Failed to update strategy' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ok = await deleteStrategy(id);
    
    if (!ok) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting strategy:', error);
    return NextResponse.json({ error: 'Failed to delete strategy' }, { status: 500 });
  }
}

