import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, signToken, getCookieName } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, slug } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'E-mail e senha são obrigatórios.' }, { status: 400 });
    }

    // Buscar usuário pelo e-mail
    const user = await prisma.user.findFirst({
      where: {
        email: email.trim().toLowerCase(),
        ...(slug ? { tenant: { slug } } : {}),
      },
      include: {
        tenant: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 });
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 });
    }

    const token = signToken({
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenant: {
          id: user.tenant.id,
          name: user.tenant.name,
          slug: user.tenant.slug,
        },
      },
    });

    // Set HTTP-Only Secure Cookie
    response.cookies.set({
      name: getCookieName(),
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });

    return response;
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json({ error: 'Erro interno ao realizar login.' }, { status: 500 });
  }
}
