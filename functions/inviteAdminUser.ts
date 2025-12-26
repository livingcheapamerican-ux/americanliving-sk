import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify super admin
    const user = await base44.auth.me();
    if (!user?.super_admin) {
      return Response.json({ error: 'Only super admins can invite admin users' }, { status: 403 });
    }

    const { email, role } = await req.json();

    if (!email || !email.includes('@')) {
      return Response.json({ error: 'Invalid email' }, { status: 400 });
    }

    if (role !== 'admin' && role !== 'user') {
      return Response.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Invite user using service role - Base44 automaticky posiela pozvánku emailom
    const result = await base44.asServiceRole.users.inviteUser(email, role);
    console.log('✅ Invite successful:', result);

    return Response.json({ 
      success: true,
      message: `Pozvánka odoslaná na ${email}` 
    });

  } catch (error) {
    console.error('Invite error:', error);
    return Response.json({ 
      error: error.message || 'Chyba pri posielaní pozvánky',
      details: error.toString()
    }, { status: 500 });
  }
});