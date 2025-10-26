import { NextRequest, NextResponse } from 'next/server';
import { getStrategies, saveStrategies, addStrategy, updateStrategy, deleteStrategy } from '@/lib/strategies';
import { Index } from '@/types/index';

// GET - Récupérer toutes les stratégies
export async function GET() {
  try {
    const strategies = getStrategies();
    return NextResponse.json({ strategies });
  } catch (error) {
    console.error('Error fetching strategies:', error);
    return NextResponse.json({ error: 'Failed to fetch strategies' }, { status: 500 });
  }
}

// POST - Créer une nouvelle stratégie
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const strategy: Index = body;
    
    // Validation basique
    if (!strategy.name || !strategy.tokens || strategy.tokens.length === 0) {
      return NextResponse.json({ error: 'Invalid strategy data' }, { status: 400 });
    }
    
    addStrategy(strategy);
    return NextResponse.json({ success: true, strategy });
  } catch (error) {
    console.error('Error creating strategy:', error);
    return NextResponse.json({ error: 'Failed to create strategy' }, { status: 500 });
  }
}

// PUT - Mettre à jour une stratégie
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const strategy: Index = body;
    
    if (!strategy.id) {
      return NextResponse.json({ error: 'Strategy ID is required' }, { status: 400 });
    }
    
    updateStrategy(strategy.id, strategy);
    return NextResponse.json({ success: true, strategy });
  } catch (error) {
    console.error('Error updating strategy:', error);
    return NextResponse.json({ error: 'Failed to update strategy' }, { status: 500 });
  }
}

// DELETE - Supprimer une stratégie
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Strategy ID is required' }, { status: 400 });
    }
    
    deleteStrategy(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting strategy:', error);
    return NextResponse.json({ error: 'Failed to delete strategy' }, { status: 500 });
  }
}
