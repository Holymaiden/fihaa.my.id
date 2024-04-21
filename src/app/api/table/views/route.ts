import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result =
      await sql`CREATE TABLE views ( id SERIAL PRIMARY KEY, blog_id INTEGER, slug TEXT );`;
    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
