export const getBaseUrl = () => process.env.NEXTAUTH_URL || "http://localhost:3000";

const header = `
  <div style="background-color: #0a0a0a; padding: 30px; text-align: center; border-bottom: 4px solid #98202E;">
    <h1 style="color: #ffffff; margin: 0; font-family: Georgia, serif; font-size: 28px; letter-spacing: 4px; text-transform: uppercase;">
      Glaze <span style="color: #98202E;">&</span> Gear
    </h1>
  </div>
`;

const footer = `
  <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-family: Arial, sans-serif; color: #888888; font-size: 12px; margin-top: 40px; border-top: 1px solid #eeeeee;">
    <p>Glaze & Gear | Drive with style. Gift with passion.</p>
    <p>© ${new Date().getFullYear()} Glaze & Gear. All rights reserved.</p>
  </div>
`;

export const getOrderEmailTemplate = (order: any, isCod: boolean = false) => {
  const baseUrl = getBaseUrl();
  
  const itemsHtml = order.items.map((item: any) => {
    const imageUrl = item.product.image.startsWith('/') ? `${baseUrl}${item.product.image}` : item.product.image;
    return `
      <tr>
        <td style="padding: 15px; border-bottom: 1px solid #eeeeee;">
          <img src="${imageUrl}" alt="${item.product.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;" />
        </td>
        <td style="padding: 15px; border-bottom: 1px solid #eeeeee; font-family: Arial, sans-serif;">
          <h4 style="margin: 0; color: #333333; font-size: 16px;">${item.product.name}</h4>
          <p style="margin: 4px 0 0 0; color: #888888; font-size: 12px; text-transform: uppercase;">${item.product.category || 'Gear'}</p>
        </td>
        <td style="padding: 15px; border-bottom: 1px solid #eeeeee; font-family: Arial, sans-serif; text-align: center; color: #555555;">
          x${item.quantity}
        </td>
        <td style="padding: 15px; border-bottom: 1px solid #eeeeee; font-family: Arial, sans-serif; text-align: right; font-weight: bold; color: #98202E;">
          ₹${(item.price * item.quantity).toLocaleString()}
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #eaeaea; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
      ${header}
      
      <div style="padding: 40px 30px; font-family: Arial, sans-serif;">
        <h2 style="color: #333333; font-size: 24px; margin-top: 0; font-family: Georgia, serif;">Thank you for your order, ${order.customerName}!</h2>
        <p style="color: #555555; line-height: 1.6; font-size: 15px;">
          ${isCod 
            ? `Your Cash on Delivery order has been successfully placed. Please keep <strong>₹${order.totalAmount.toLocaleString()}</strong> ready at the time of delivery.` 
            : `We have successfully received your payment of <strong>₹${order.totalAmount.toLocaleString()}</strong>.`}
        </p>
        
        <div style="margin: 30px 0; border: 1px solid #eeeeee; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #fafafa; padding: 15px; border-bottom: 1px solid #eeeeee;">
            <h3 style="margin: 0; font-size: 14px; text-transform: uppercase; color: #888888; letter-spacing: 1px;">Order Summary (#${order.id.slice(-6).toUpperCase()})</h3>
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            ${itemsHtml}
            <tr>
              <td colspan="3" style="padding: 20px 15px; text-align: right; font-family: Arial, sans-serif; color: #333333; font-weight: bold;">Final Total:</td>
              <td style="padding: 20px 15px; text-align: right; font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; color: #98202E;">₹${order.totalAmount.toLocaleString()}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #F9EAEA; padding: 20px; border-radius: 8px; border-left: 4px solid #98202E;">
          <h3 style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; color: #98202E; letter-spacing: 1px;">Shipping Destination</h3>
          <p style="margin: 0; color: #555555; font-size: 14px; line-height: 1.5;">${order.shippingAddress.replace(/\\n/g, '<br>')}</p>
        </div>
      </div>

      ${footer}
    </div>
  `;
};

export const getForgotPasswordTemplate = (resetUrl: string) => {
  return `
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #eaeaea; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
      ${header}
      
      <div style="padding: 40px 30px; font-family: Arial, sans-serif; text-align: center;">
        <h2 style="color: #333333; font-size: 24px; margin-top: 0; font-family: Georgia, serif;">Password Reset Request</h2>
        <p style="color: #555555; line-height: 1.6; font-size: 15px; margin-bottom: 30px;">
          We received a request to reset the password for your Glaze & Gear account. If you didn't make this request, you can safely ignore this email.
        </p>
        
        <a href="${resetUrl}" style="display: inline-block; background-color: #98202E; color: #ffffff; text-decoration: none; padding: 15px 30px; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; border-radius: 6px;">
          Reset Password
        </a>
        
        <p style="color: #888888; font-size: 12px; margin-top: 30px;">
          If the button above doesn't work, copy and paste this link into your browser:<br>
          <a href="${resetUrl}" style="color: #98202E;">${resetUrl}</a>
        </p>
      </div>

      ${footer}
    </div>
  `;
};

export const getShippingEmailTemplate = (order: any) => {
  const baseUrl = getBaseUrl();
  const itemsHtml = order.items.map((item: any) => {
    const imageUrl = item.product.image.startsWith('/') ? `${baseUrl}${item.product.image}` : item.product.image;
    return `
      <div style="display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid #eeeeee;">
        <img src="${imageUrl}" alt="${item.product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px; margin-right: 15px;" />
        <div style="flex-grow: 1; font-family: Arial, sans-serif;">
          <h4 style="margin: 0; color: #333333; font-size: 14px;">${item.product.name}</h4>
          <p style="margin: 2px 0 0 0; color: #888888; font-size: 12px;">Qty: ${item.quantity}</p>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #eaeaea; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
      ${header}
      
      <div style="padding: 40px 30px; font-family: Arial, sans-serif; text-align: center;">
        <div style="width: 60px; height: 60px; background-color: #e6f4ea; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 30px;">
          📦
        </div>
        <h2 style="color: #333333; font-size: 24px; margin-top: 0; font-family: Georgia, serif;">Great news! Your order is on the way.</h2>
        <p style="color: #555555; line-height: 1.6; font-size: 15px; margin-bottom: 30px;">
          Hi ${order.customerName},<br><br>
          Your order <strong>#${order.id.slice(-6).toUpperCase()}</strong> has just been shipped and is heading your way!
        </p>
        
        <div style="text-align: left; background-color: #fafafa; padding: 20px; border-radius: 8px; border: 1px solid #eeeeee; margin-bottom: 20px;">
          <h3 style="margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; color: #888888; letter-spacing: 1px;">Items in this shipment</h3>
          ${itemsHtml}
        </div>

        <div style="text-align: left; background-color: #F9EAEA; padding: 20px; border-radius: 8px; border-left: 4px solid #98202E;">
          <h3 style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; color: #98202E; letter-spacing: 1px;">Shipping To</h3>
          <p style="margin: 0; color: #555555; font-size: 14px; line-height: 1.5;">${order.shippingAddress.replace(/\\n/g, '<br>')}</p>
        </div>
        
        <p style="color: #888888; font-size: 13px; margin-top: 30px;">
          You can track your order status in your <a href="${baseUrl}/account/orders" style="color: #98202E;">account dashboard</a>.
        </p>
      </div>

      ${footer}
    </div>
  `;
};
