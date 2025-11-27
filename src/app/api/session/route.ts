import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// In-memory store for sessions (Note: In production, use a database like Redis/Postgres)
// Key: sessionId, Value: { email: string, verified: boolean, createdAt: number }
export const sessions = new Map<string, { email: string; verified: boolean; createdAt: number }>();

export async function POST(request: Request) {
    try {
        const { email } = await request.json();
        const sessionId = uuidv4();

        sessions.set(sessionId, {
            email,
            verified: false,
            createdAt: Date.now()
        });

        return NextResponse.json({ sessionId });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }
}
