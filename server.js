const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({
  origin: ['https://adeluxe.netlify.app', 'http://localhost:8888'],
    methods: ['POST', 'OPTIONS'],
    }));

    const supabase = createClient(
      process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
        );

        const resend = new Resend(process.env.RESEND_API_KEY);

        app.get('/', (req, res) => {
          res.json({ status: 'ok', service: 'adeluxe-backend' });
          });

          app.post('/api/subscribe', async (req, res) => {
            const { email } = req.body;
              if (!email || !email.includes('@')) {
                  return res.status(400).json({ error: 'Valid email required' });
                    }
                      try {
                          const { data, error: dbError } = await supabase
                                .from('email_captures')
                                      .insert([{ email: email.toLowerCase().trim() }])
                                            .select();
                                                if (dbError) {
                                                      if (dbError.code === '23505') {
                                                              return res.status(200).json({ message: 'Already subscribed', duplicate: true });
                                                                    }
                                                                          console.error('Supabase error:', dbError);
                                                                                return res.status(500).json({ error: 'Database error' });
                                                                                    }
                                                                                        try {
                                                                                              await resend.emails.send({
                                                                                                      from: 'LATELIER DE LUXE <info@brandvisable.com>',
                                                                                                              to: email,
                                                                                                                      subject: 'Welcome to LATELIER DE LUXE',
                                                                                                                              html: '<div style="font-family:Helvetica Neue,Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;background:#000;color:#fff"><h1 style="font-size:28px;font-weight:300;letter-spacing:3px;text-align:center;margin-bottom:30px">LATELIER DE LUXE</h1><p style="font-size:16px;line-height:1.6;color:#ccc;text-align:center">Welcome to the world of European luxury streetwear.</p><p style="font-size:16px;line-height:1.6;color:#ccc;text-align:center">You will be the first to know about new drops and limited collections.</p><div style="text-align:center;margin-top:30px"><a href="https://adeluxe.netlify.app" style="display:inline-block;padding:12px 40px;background:#fff;color:#000;text-decoration:none;font-size:14px;letter-spacing:2px;font-weight:500">SHOP NOW</a></div></div>',
                                                                                                                                    });
                                                                                                                                        } catch (emailErr) {
                                                                                                                                              console.error('Resend error:', emailErr);
                                                                                                                                                  }
                                                                                                                                                      return res.status(201).json({ message: 'Subscribed successfully' });
                                                                                                                                                        } catch (err) {
                                                                                                                                                            console.error('Server error:', err);
                                                                                                                                                                return res.status(500).json({ error: 'Internal server error' });
                                                                                                                                                                  }
                                                                                                                                                                  });
                                                                                                                                                                  
                                                                                                                                                                  app.listen(PORT, () => {
                                                                                                                                                                    console.log('Adeluxe backend running on port ' + PORT);
                                                                                                                                                                    });
