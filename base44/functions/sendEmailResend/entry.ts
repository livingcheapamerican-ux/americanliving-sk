import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { to, subject, html, cc } = await req.json();

    console.log('📧 sendEmailResend called with:');
    console.log('To:', to);
    console.log('CC:', cc);
    console.log('Subject:', subject);

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    
    if (!RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY not configured');
      return Response.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
    }

    const emailData = {
      from: 'American Living <info@americanliving.sk>',
      to: Array.isArray(to) ? to : [to],
      subject,
      html
    };

    // Pridaj CC ak je definované
    if (cc) {
      emailData.cc = Array.isArray(cc) ? cc : [cc];
    }

    console.log('📤 Sending to Resend API...');
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    const result = await response.json();
    console.log('Resend API response:', result);

    if (!response.ok) {
      console.error('❌ Resend API error:', result);
      return Response.json({ 
        error: result.message || 'Failed to send email',
        details: result 
      }, { status: response.status });
    }

    console.log('✅ Email sent successfully, ID:', result.id);
    return Response.json({ 
      success: true, 
      message: 'Email sent successfully',
      email_id: result.id 
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});