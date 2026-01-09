
/**
 * STUNNING UI TEMPLATE FOR GENERAL EMAILS
 * Features the signature Joy Juncture Neo-Brutalist aesthetic.
 */
export const getBaseEmailTemplate = (subject: string, message: string) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700;800&display=swap');
          
          body {
            font-family: 'Space Grotesk', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #FFFDF5;
            color: #000000;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border: 4px solid #000000;
            box-shadow: 12px 12px 0px #000000;
            overflow: hidden;
          }
          .header {
            background-color: #FFD93D;
            padding: 50px 20px;
            text-align: center;
            border-bottom: 4px solid #000000;
          }
          .logo-badge {
            background-color: #FF7675;
            color: white;
            padding: 6px 14px;
            border: 3px solid #000000;
            display: inline-block;
            font-weight: 800;
            font-size: 18px;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 15px;
            box-shadow: 4px 4px 0px #000000;
          }
          .header h1 {
            margin: 0;
            font-size: 36px;
            text-transform: uppercase;
            letter-spacing: -2px;
            font-weight: 800;
            line-height: 1;
          }
          .content {
            padding: 40px;
            line-height: 1.6;
          }
          .message-card {
            background-color: #DDFFF7;
            border: 3px solid #000000;
            padding: 30px;
            margin: 20px 0;
            box-shadow: 8px 8px 0px #000000;
            white-space: pre-wrap;
            font-size: 16px;
            font-weight: 500;
          }
          .btn {
            display: inline-block;
            background-color: #A29BFE;
            color: #000000 !important;
            text-decoration: none;
            padding: 18px 36px;
            font-weight: 800;
            text-transform: uppercase;
            border: 3px solid #000000;
            box-shadow: 6px 6px 0px #000000;
            margin-top: 20px;
            transition: all 0.2s;
          }
          .footer {
            background-color: #000000;
            color: #ffffff;
            padding: 30px;
            text-align: center;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 2px;
            font-weight: 700;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo-badge">JOY JUNCTURE</div>
            <h1>${subject}</h1>
          </div>
          <div class="content">
            <div class="message-card">${message.replace(/\n/g, '<br>')}</div>
            <p style="font-weight: 700; font-size: 18px; margin-top: 30px;">Stay connected, stay playful!</p>
            <a href="https://joyjuncture.com" class="btn">Explore More Fun</a>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} JOY JUNCTURE • THE ULTIMATE PLAYGROUND
          </div>
        </div>
      </body>
    </html>
  `;
};

/**
 * FORMAL BUSINESS TEMPLATE FOR ORDER INVOICES
 * Strictly professional, no creative styling.
 */
export const getOrderInvoiceTemplate = (order: any) => {
  const itemsHtml = (order.items || []).map((item: any) => {
    const unitPrice = item.product?.price || item.price || 0;
    const itemName = item.product?.name || item.name || item.title || 'Product';
    const quantity = item.quantity || 0;
    const total = unitPrice * quantity;
    return `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px 5px;">${itemName}</td>
        <td style="padding: 12px 5px; text-align: center;">${quantity}</td>
        <td style="padding: 12px 5px; text-align: right;">₹${unitPrice.toLocaleString()}</td>
        <td style="padding: 12px 5px; text-align: right; font-weight: bold;">₹${total.toLocaleString()}</td>
      </tr>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Arial', sans-serif; color: #333; line-height: 1.5; padding: 0; margin: 0; }
          .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; }
          .title { font-size: 28px; font-weight: bold; color: #000; }
          .heading td { background: #f9f9f9; border-bottom: 1px solid #ddd; font-weight: bold; font-size: 12px; text-transform: uppercase; }
          .item td { border-bottom: 1px solid #eee; }
          .total td { font-weight: bold; font-size: 16px; border-top: 2px solid #eee; }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <table width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td class="title">JOY JUNCTURE</td>
              <td align="right">
                <strong>INVOICE</strong><br>
                #${order.id}<br>
                Date: ${new Date(order.createdAt).toLocaleDateString()}
              </td>
            </tr>
            <tr style="height: 40px;"></tr>
            <tr>
              <td>
                <strong>From:</strong><br>
                Joy Juncture Stores Pvt Ltd<br>
                GSTIN: 24AABCJ1234F1Z5
              </td>
              <td align="right">
                <strong>Bill To:</strong><br>
                ${order.shippingAddress.name}<br>
                ${order.shippingAddress.address}<br>
                ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}
              </td>
            </tr>
            <tr style="height: 40px;"></tr>
          </table>
          <table width="100%" cellspacing="0" cellpadding="0">
            <tr class="heading">
              <td style="padding: 10px;">Item</td>
              <td align="center">Qty</td>
              <td align="right">Rate</td>
              <td align="right">Amount</td>
            </tr>
            ${itemsHtml}
            ${(() => {
      const subtotal = order.subtotal || order.originalPrice || order.totalPrice;
      const gstAmount = order.gst || 0;
      const gstRate = order.gstRate || 0;
      let gstRow = '';
      if (gstAmount > 0) {
        gstRow = `
                  <tr>
                    <td colspan="2"></td>
                    <td align="right" style="padding: 10px;">Subtotal:</td>
                    <td align="right" style="padding: 10px;">₹${subtotal.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td colspan="2"></td>
                    <td align="right" style="padding: 10px;">GST (${gstRate}%):</td>
                    <td align="right" style="padding: 10px;">₹${gstAmount.toLocaleString()}</td>
                  </tr>
                `;
      }
      return gstRow;
    })()}
            <tr class="total">
              <td colspan="2"></td>
              <td align="right" style="padding-top: 20px;">Grand Total:</td>
              <td align="right" style="padding-top: 20px;">₹${order.totalPrice.toLocaleString()}</td>
            </tr>
          </table>
          <div style="margin-top: 60px; text-align: right;">
            For Joy Juncture Stores Pvt Ltd<br><br><br>
            _______________________<br>
            Authorized Signatory
          </div>
          <div style="margin-top: 50px; font-size: 10px; color: #999;">
            Note: This is a computer-generated invoice.
          </div>
        </div>
      </body>
    </html>
  `;
};

/**
 * STUNNING UI + FORMAL BILL FOR EVENT REGISTRATION
 * Matches Neo-Brutalist UI but includes a formal bill section.
 */
export const getEventConfirmationTemplate = (registrationId: string, name: string, eventTitle: string, eventDate: string, eventLocation: string, amount: number) => {
  const formattedDate = eventDate ? new Date(eventDate).toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  }) : 'To be announced';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700;800&display=swap');
          body { font-family: 'Space Grotesk', sans-serif; background-color: #FFFDF5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background: white; border: 4px solid #000; box-shadow: 12px 12px 0px #000; overflow: hidden; }
          .ticket-header { background: #6C5CE7; padding: 40px; text-align: center; border-bottom: 4px solid #000; color: white; }
          .ticket-header h1 { font-size: 32px; font-weight: 800; text-transform: uppercase; margin: 0; text-shadow: 3px 3px 0px #000; }
          .ticket-content { padding: 40px; background: white; }
          .ticket-card { border: 3px solid #000; box-shadow: 8px 8px 0px #000; background: #FFD93D; padding: 25px; margin-bottom: 40px; }
          .info-block { margin-bottom: 15px; }
          .label { font-size: 12px; font-weight: 800; text-transform: uppercase; color: #000; opacity: 0.6; margin: 0; }
          .value { font-size: 18px; font-weight: 800; color: #000; margin: 0; }
          
          /* Formal Bill Section */
          .bill-section { padding: 40px; background: #f9f9f9; border-top: 4px dashed #000; font-family: 'Arial', sans-serif; color: #333; }
          .bill-title { font-size: 16px; font-weight: bold; text-transform: uppercase; color: #000; margin-bottom: 20px; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
          .bill-table { width: 100%; font-size: 12px; border-collapse: collapse; }
          .bill-table th { text-align: left; padding: 10px 0; border-bottom: 2px solid #333; }
          .bill-table td { padding: 10px 0; border-bottom: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="ticket-header">
             <div style="background:#FF7675; border:3px solid #000; display:inline-block; padding:5px 15px; margin-bottom:15px; font-weight:800; box-shadow:3px 3px 0px #000;">TICKET CONFIRMED</div>
             <h1>${eventTitle}</h1>
          </div>
          <div class="ticket-content">
             <h2 style="font-weight:800; text-transform:uppercase;">Hello ${name}, You're In!</h2>
             <div class="ticket-card">
                <div class="info-block">
                   <p class="label">Date & Time</p>
                   <p class="value">${formattedDate}</p>
                </div>
                <div class="info-block">
                   <p class="label">Location</p>
                   <p class="value">${eventLocation || 'To be announced'}</p>
                </div>
                <div class="info-block">
                   <p class="label">Registration ID</p>
                   <p class="value" style="font-family:monospace; color:#6C5CE7;">${registrationId}</p>
                </div>
             </div>
             <p style="font-size:12px; font-weight:bold; text-align:center; opacity:0.5; text-transform:uppercase;">Present this QR or Registration ID at the venue</p>
          </div>

          <div class="bill-section">
             <div class="bill-title">Official Tax Invoice</div>
             <table class="bill-table">
                <tr>
                   <td width="50%">
                      Joy Juncture Stores Pvt Ltd<br>
                      GSTIN: 24AABCJ1234F1Z5
                   </td>
                   <td align="right">
                      Reg ID: #${registrationId}<br>
                      Date: ${new Date().toLocaleDateString()}
                   </td>
                </tr>
             </table>
             <table class="bill-table" style="margin-top:20px;">
                <thead>
                   <tr>
                      <th>Description</th>
                      <th align="right">Amount</th>
                   </tr>
                </thead>
                <tbody>
                   <tr>
                      <td>Admission for ${eventTitle}</td>
                      <td align="right">₹${amount.toLocaleString()}</td>
                   </tr>
                   <tr style="font-weight:bold;">
                      <td align="right">Grand Total:</td>
                      <td align="right">₹${amount.toLocaleString()}</td>
                   </tr>
                </tbody>
             </table>
             <div style="margin-top:30px; font-size:10px; color:#999; text-align:center;">
                This is a computer-generated bill for your registration. No physical signature required.
             </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const getOrderConfirmationTemplate = (orderId: string, name: string, items: any[], totalPrice: number, shippingAddress: any) => {
  return getOrderInvoiceTemplate({
    id: orderId,
    createdAt: new Date(),
    items: items,
    totalPrice: totalPrice,
    shippingAddress: shippingAddress
  });
};

export const getPasswordResetTemplate = (name: string, resetLink: string) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700;800&display=swap');
          body { font-family: 'Space Grotesk', sans-serif; background-color: #FFFDF5; margin: 0; padding: 0; color: #000; }
          .container { max-width: 600px; margin: 40px auto; background: white; border: 4px solid #000; box-shadow: 12px 12px 0px #000; overflow: hidden; }
          .header { background: #FFD93D; padding: 50px 20px; text-align: center; border-bottom: 4px solid #000; }
          .logo-badge { background: #6C5CE7; color: white; padding: 8px 16px; border: 3px solid #000; display: inline-block; font-weight: 800; font-size: 16px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px; box-shadow: 4px 4px 0px #000; }
          .header h1 { font-size: 42px; font-weight: 800; text-transform: uppercase; margin: 0; letter-spacing: -2px; line-height: 0.9; }
          .content { padding: 40px; text-align: center; }
          .message-card { background: #ffffff; border: 3px solid #000; padding: 30px; margin: 20px 0; box-shadow: 8px 8px 0px #000; font-size: 18px; font-weight: 700; color: #2D3436; line-height: 1.4; }
          .btn { display: inline-block; background: #FF7675; color: white !important; text-decoration: none; padding: 20px 40px; font-weight: 800; text-transform: uppercase; border: 3px solid #000; box-shadow: 6px 6px 0px #000; margin: 30px 0; font-size: 16px; letter-spacing: 1px; transition: all 0.2s; }
          .footer { background: #000; color: white; padding: 30px; text-align: center; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
          .warning { font-size: 12px; color: #666; font-weight: 500; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo-badge">Security Protocol</div>
            <h1>ACCESS <br> RECOVERY</h1>
          </div>
          <div class="content">
            <h2 style="font-weight: 800; text-transform: uppercase; color: #6C5CE7; margin-bottom: 10px;">Hello ${name || 'Explorer'},</h2>
            <div class="message-card">
              Forgot your portal credentials? No problem. We've generated a unique transmission link to reset your password.
            </div>
            
            <a href="${resetLink}" class="btn">RESET MY PASSWORD</a>
            
            <p class="warning">
              This link will expire in 1 hour. <br>
              If you didn't request this, simply ignore this transmission.
            </p>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} JOY JUNCTURE • BUILT FOR CHAOS & JOY
          </div>
        </div>
      </body>
    </html>
  `;
};
