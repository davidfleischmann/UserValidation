import { NextResponse } from 'next/server';
import { sessions } from '../route'; // Importing the shared map

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id;
    const session = sessions.get(id);

    if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json(session);
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id;
    const session = sessions.get(id);

    if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Mark as verified
    sessions.set(id, { ...session, verified: true });

    return NextResponse.json({ success: true });
}
